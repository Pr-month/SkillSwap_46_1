import { CACHE_KEYS } from '@/common/constants/cache-keys.constants';
import { CACHE_TTL } from '@/common/constants/cache-ttl.constants';
import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';

import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findAll(): Promise<Category[]> {
    const cached = await this.redis.get(CACHE_KEYS.CATEGORIES);
    if (cached) {
      return JSON.parse(cached) as Category[];
    }

    const categories = await this.categoryRepo.find({
      relations: { subcategories: true },
    });

    await this.redis.set(
      CACHE_KEYS.CATEGORIES,
      JSON.stringify(categories),
      'EX',
      CACHE_TTL.ONE_DAY,
    );

    return categories;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create(dto);
    const saved = await this.categoryRepo.save(category);

    await this.redis.del(CACHE_KEYS.CATEGORIES);

    return saved;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new BusinessException(exceptionCodes.categories.notFound, 404);
    }

    Object.assign(category, dto);
    const saved = await this.categoryRepo.save(category);

    await this.redis.del(CACHE_KEYS.CATEGORIES);

    return saved;
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new BusinessException(exceptionCodes.categories.notFound, 404);
    }

    await this.categoryRepo.remove(category);

    await this.redis.del(CACHE_KEYS.CATEGORIES);
  }
}
