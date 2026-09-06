import { EmailConfirmedGuard } from '@/mail/guards/email-confirmed.guard';
import { Favorite } from '@/skills/entities/favorite.entity';
import { Skill } from '@/skills/entities/skills.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  FavoritesController,
  MyFavoritesController,
} from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Skill])],
  controllers: [FavoritesController, MyFavoritesController],
  providers: [FavoritesService, EmailConfirmedGuard],
  exports: [FavoritesService],
})
export class FavoritesModule {}
