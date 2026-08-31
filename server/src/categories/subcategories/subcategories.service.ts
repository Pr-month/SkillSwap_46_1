import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subcategory } from '../entities/subcategory.entity';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepo: Repository<Subcategory>,
  ) {}

  findAll(): Promise<Subcategory[]> {
    return this.subcategoryRepo.find({
      order: { name: 'ASC' },
    });
  }
}
