import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Favorite } from '../skills/entities/favorite.entity';
import { Skill } from '../skills/entities/skills.entity';
import {
  FavoritesController,
  MyFavoritesController,
} from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Skill])],
  controllers: [FavoritesController, MyFavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
