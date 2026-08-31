import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subcategory } from '../entities/subcategory.entity';
import { SubcategoriesController } from './subcategories.controller';
import { SubcategoriesService } from './subcategories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subcategory])],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService],
})
export class SubcategoriesModule {}
