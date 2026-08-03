import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SubcategoriesModule } from './subcategories/subcategories.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [SubcategoriesModule],
})
export class CategoriesModule {}
