import { Module } from '@nestjs/common';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { SubcategoriesModule } from './subcategories/subcategories.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [SubcategoriesModule],
})
export class CategoriesModule {}
