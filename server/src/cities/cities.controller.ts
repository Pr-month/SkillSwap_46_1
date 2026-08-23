import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CitiesService } from './cities.service';
import { PopularCitiesQueryDto } from './dto/popular-cities-query.dto';
import { SearchCityQueryDto } from './dto/search-city-query.dto';
import { City } from './entities/city.entity';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get('popular')
  @ApiOperation({
    summary: 'Получить самые популярные города (по населению)',
  })
  findPopular(@Query() query: PopularCitiesQueryDto): Promise<City[]> {
    return this.citiesService.findPopular(query.limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск городов по названию' })
  search(@Query() query: SearchCityQueryDto): Promise<City[]> {
    return this.citiesService.search(query.query, query.limit);
  }
}
