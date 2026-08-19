import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { City } from './entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  exports: [TypeOrmModule],
})
export class CitiesModule {}
