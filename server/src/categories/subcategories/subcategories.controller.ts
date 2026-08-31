import { Controller, Get } from '@nestjs/common';

import { SubcategoriesService } from './subcategories.service';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  findAll() {
    return this.subcategoriesService.findAll();
  }
}
