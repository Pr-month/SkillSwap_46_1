import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { Favorite } from '../skills/entities/favorite.entity';
import { Skill } from '../skills/entities/skills.entity';
import { FavoriteCheckDto, FavoriteDto } from './dto/favorite-response.dto';
import { FavoriteData, FavoriteSkillData } from './favorites.types';

@Injectable()
export class FavoritesService {
  private readonly skillRelations = {
    category: true,
    subcategory: true,
    owner: true,
  };

  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async add(userId: string, skillId: string): Promise<FavoriteDto> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: this.skillRelations,
    });

    if (!skill) {
      throw new BusinessException(
        exceptionCodes.skills.notFound,
        HttpStatus.NOT_FOUND,
        { skillId },
      );
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: { userId, skillId },
    });

    if (existingFavorite) {
      throw new BusinessException(
        exceptionCodes.favorites.alreadyExists,
        HttpStatus.CONFLICT,
      );
    }

    const favorite = await this.favoriteRepository.save(
      this.favoriteRepository.create({ userId, skillId }),
    );

    return this.toDto(favorite, skill);
  }

  async remove(userId: string, skillId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, skillId },
    });

    if (!favorite) {
      throw new BusinessException(
        exceptionCodes.favorites.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.favoriteRepository.remove(favorite);
  }

  async findAll(userId: string): Promise<FavoriteDto[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: {
        skill: {
          category: true,
          subcategory: true,
          owner: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    return favorites.map((favorite) => this.toDto(favorite, favorite.skill));
  }

  async check(userId: string, skillId: string): Promise<FavoriteCheckDto> {
    const count = await this.favoriteRepository.count({
      where: { userId, skillId },
    });

    return { isFavorite: count > 0 };
  }

  private toDto(
    favorite: FavoriteData,
    skill: FavoriteSkillData,
  ): FavoriteDto {
    return {
      id: favorite.id,
      userId: favorite.userId,
      skillId: favorite.skillId,
      createdAt: favorite.createdAt.toISOString(),
      skill: {
        id: skill.id,
        title: skill.title,
        description: skill.description,
        images: skill.images ?? [],
        category: skill.category?.name ?? '',
        subcategory: skill.subcategory?.name,
        owner: skill.owner
          ? {
              id: skill.owner.id,
              name: skill.owner.name,
              avatar: skill.owner.avatar,
            }
          : undefined,
      },
    };
  }
}