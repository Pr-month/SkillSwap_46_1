import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findPopular(limit: number): Promise<City[]> {
    return this.cityRepository.find({
      order: { population: 'DESC' },
      take: limit,
    });
  }

  async search(query: string, limit: number): Promise<City[]> {
    return this.cityRepository
      .createQueryBuilder('city')
      .where('LOWER(city.name) LIKE :query', {
        query: `%${query.trim().toLowerCase()}%`,
      })
      .orderBy('city.population', 'DESC')
      .take(limit)
      .getMany();
  }
}
