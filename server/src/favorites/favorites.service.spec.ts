import { HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

import { exceptionCodes } from '../common/errors/error-codes';
import { Favorite } from '../skills/entities/favorite.entity';
import { Skill } from '../skills/entities/skills.entity';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoriteRepository: jest.Mocked<Repository<Favorite>>;
  let skillRepository: jest.Mocked<Repository<Skill>>;

  const userId = 'user-id';
  const skillId = 'skill-id';
  const createdAt = new Date('2026-08-10T12:00:00.000Z');

  let skill: Skill;
  let favorite: Favorite;

  beforeEach(() => {
    favoriteRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<Repository<Favorite>>;

    skillRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Skill>>;

    skill = {
      id: skillId,
      title: 'Игра на гитаре',
      description: 'Научу играть на гитаре',
      images: ['https://example.com/guitar.jpg'],
      category: {
        name: 'Творчество',
      },
      subcategory: {
        name: 'Музыка',
      },
      owner: {
        id: 'owner-id',
        name: 'Иван',
        avatar: 'https://example.com/avatar.jpg',
      },
    } as Skill;

    favorite = {
      id: 'favorite-id',
      userId,
      skillId,
      createdAt,
    } as Favorite;

    service = new FavoritesService(favoriteRepository, skillRepository);
  });

  describe('add', () => {
    it('добавляет навык в избранное', async () => {
      skillRepository.findOne.mockResolvedValue(skill);
      favoriteRepository.findOne.mockResolvedValue(null);
      favoriteRepository.create.mockReturnValue(favorite);
      favoriteRepository.save.mockResolvedValue(favorite);

      const result = await service.add(userId, skillId);

      expect(skillRepository.findOne).toHaveBeenCalledWith({
        where: { id: skillId },
        relations: {
          category: true,
          subcategory: true,
          owner: true,
        },
      });

      expect(favoriteRepository.findOne).toHaveBeenCalledWith({
        where: { userId, skillId },
      });

      expect(favoriteRepository.create).toHaveBeenCalledWith({
        userId,
        skillId,
      });

      expect(favoriteRepository.save).toHaveBeenCalledWith(favorite);

      expect(result).toEqual({
        id: favorite.id,
        userId,
        skillId,
        createdAt: createdAt.toISOString(),
        skill: {
          id: skill.id,
          title: skill.title,
          description: skill.description,
          images: skill.images,
          category: skill.category.name,
          subcategory: skill.subcategory.name,
          owner: {
            id: skill.owner.id,
            name: skill.owner.name,
            avatar: skill.owner.avatar,
          },
        },
      });
    });

    it('выбрасывает ошибку, если навык не найден', async () => {
      skillRepository.findOne.mockResolvedValue(null);

      await expect(service.add(userId, skillId)).rejects.toMatchObject({
        code: exceptionCodes.skills.notFound,
        status: HttpStatus.NOT_FOUND,
        details: { skillId },
      });

      expect(favoriteRepository.findOne).not.toHaveBeenCalled();
      expect(favoriteRepository.save).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если навык уже добавлен в избранное', async () => {
      skillRepository.findOne.mockResolvedValue(skill);
      favoriteRepository.findOne.mockResolvedValue(favorite);

      await expect(service.add(userId, skillId)).rejects.toMatchObject({
        code: exceptionCodes.favorites.alreadyExists,
        status: HttpStatus.CONFLICT,
      });

      expect(favoriteRepository.create).not.toHaveBeenCalled();
      expect(favoriteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('удаляет навык из избранного', async () => {
      favoriteRepository.findOne.mockResolvedValue(favorite);
      favoriteRepository.remove.mockResolvedValue(favorite);

      await service.remove(userId, skillId);

      expect(favoriteRepository.findOne).toHaveBeenCalledWith({
        where: { userId, skillId },
      });

      expect(favoriteRepository.remove).toHaveBeenCalledWith(favorite);
    });

    it('выбрасывает ошибку, если избранное не найдено', async () => {
      favoriteRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId, skillId)).rejects.toMatchObject({
        code: exceptionCodes.favorites.notFound,
        status: HttpStatus.NOT_FOUND,
      });

      expect(favoriteRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('возвращает избранные навыки пользователя', async () => {
      const favoriteWithSkill = {
        ...favorite,
        skill,
      } as Favorite;

      favoriteRepository.find.mockResolvedValue([favoriteWithSkill]);

      const result = await service.findAll(userId);

      expect(favoriteRepository.find).toHaveBeenCalledWith({
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

      expect(result).toEqual([
        {
          id: favorite.id,
          userId,
          skillId,
          createdAt: createdAt.toISOString(),
          skill: {
            id: skill.id,
            title: skill.title,
            description: skill.description,
            images: skill.images,
            category: skill.category.name,
            subcategory: skill.subcategory.name,
            owner: {
              id: skill.owner.id,
              name: skill.owner.name,
              avatar: skill.owner.avatar,
            },
          },
        },
      ]);
    });

    it('подставляет значения по умолчанию для отсутствующих связей навыка', async () => {
      const skillWithoutRelations = {
        ...skill,
        images: null,
        category: null,
        subcategory: null,
        owner: null,
      } as unknown as Skill;

      const favoriteWithSkill = {
        ...favorite,
        skill: skillWithoutRelations,
      } as Favorite;

      favoriteRepository.find.mockResolvedValue([favoriteWithSkill]);

      const result = await service.findAll(userId);

      expect(result[0].skill).toEqual({
        id: skill.id,
        title: skill.title,
        description: skill.description,
        images: [],
        category: '',
        subcategory: undefined,
        owner: undefined,
      });
    });
  });

  describe('check', () => {
    it('возвращает true, если навык находится в избранном', async () => {
      favoriteRepository.count.mockResolvedValue(1);

      const result = await service.check(userId, skillId);

      expect(favoriteRepository.count).toHaveBeenCalledWith({
        where: { userId, skillId },
      });

      expect(result).toEqual({ isFavorite: true });
    });

    it('возвращает false, если навык отсутствует в избранном', async () => {
      favoriteRepository.count.mockResolvedValue(0);

      const result = await service.check(userId, skillId);

      expect(result).toEqual({ isFavorite: false });
    });
  });
});
