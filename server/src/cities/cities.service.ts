import { CACHE_KEYS } from '@/common/constants/cache-keys.constants';
import { CACHE_TTL } from '@/common/constants/cache-ttl.constants';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';

import { City } from './entities/city.entity';

@Injectable()
export class CitiesService implements OnModuleInit {
  private readonly logger = new Logger(CitiesService.name);

  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Расширение pg_trgm нужно для триграммного (нечёткого) поиска
   * по названию города — функция similarity() и оператор `%`.
   * Создаём его один раз при старте приложения, если ещё не создано.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.cityRepository.query(
        'CREATE EXTENSION IF NOT EXISTS pg_trgm;',
      );
    } catch (error) {
      this.logger.warn(
        'Не удалось включить расширение pg_trgm — поиск городов может не работать',
        error,
      );
    }
  }

  /**
   * Возвращает города, отсортированные по населению (по убыванию).
   * Используется для отображения списка самых популярных городов.
   */
  async findPopular(limit: number): Promise<City[]> {
    const cacheKey = `${CACHE_KEYS.CITIES_POPULAR}:${limit}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as City[];
    }

    const cities = await this.cityRepository.find({
      order: { population: 'DESC' },
      take: limit,
    });

    await this.redis.set(
      cacheKey,
      JSON.stringify(cities),
      'EX',
      CACHE_TTL.ONE_DAY,
    );

    return cities;
  }

  /**
   * Триграммный (нечёткий) поиск городов по названию с помощью pg_trgm.
   * similarity() сравнивает строки по общим триграммам (наборам из 3 символов),
   * поэтому хорошо находит совпадения даже с опечатками. Результат
   * отсортирован сначала по релевантности, затем по населению.
   */
  async search(query: string, limit: number): Promise<City[]> {
    const trimmed = query.trim();
    const SIMILARITY_THRESHOLD = 0.2;

    return this.cityRepository
      .createQueryBuilder('city')
      .where('similarity(city.name, :query) > :threshold', {
        query: trimmed,
        threshold: SIMILARITY_THRESHOLD,
      })
      .orderBy('similarity(city.name, :query)', 'DESC')
      .addOrderBy('city.population', 'DESC')
      .take(limit)
      .getMany();
  }
}
