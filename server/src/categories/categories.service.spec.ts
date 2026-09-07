import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { REDIS_CLIENT } from '../redis/redis.module';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const mockCategoryRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepo,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('должен возвращать список категорий c подкатегориями из кеша', async () => {
      const mockResult = [
        { id: 'cat-1', name: 'Бизнес и карьера', subcategories: [] },
      ];

      mockRedis.get.mockResolvedValue(JSON.stringify(mockResult));

      const result = await service.findAll();

      expect(result).toEqual(mockResult);
      expect(mockRedis.get).toHaveBeenCalledWith('cache:categories');
      expect(mockCategoryRepo.find).not.toHaveBeenCalled();
    });

    it('должен брать из БД и класть в кеш, если кеша нет', async () => {
      const mockResult = [
        { id: 'cat-1', name: 'Бизнес и карьера', subcategories: [] },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockCategoryRepo.find.mockResolvedValue(mockResult);

      const result = await service.findAll();

      expect(result).toEqual(mockResult);
      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        relations: { subcategories: true },
      });
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('должен создавать категорию и инвалидировать кеш', async () => {
      const dto = { name: 'Новая категория' };
      const createdEntity = { ...dto };
      const savedEntity = { id: 'cat-1', ...dto };

      mockCategoryRepo.create.mockReturnValue(createdEntity);
      mockCategoryRepo.save.mockResolvedValue(savedEntity);
      mockRedis.del.mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(mockCategoryRepo.create).toHaveBeenCalledWith(dto);
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(createdEntity);
      expect(mockRedis.del).toHaveBeenCalledWith('cache:categories');
      expect(result).toEqual(savedEntity);
    });
  });

  describe('update', () => {
    it('должен обновлять существующую категорию и инвалидировать кеш', async () => {
      const existing = { id: 'cat-1', name: 'Старое имя' };
      const dto = { name: 'Новое имя' };

      mockCategoryRepo.findOne.mockResolvedValue(existing);
      mockCategoryRepo.save.mockResolvedValue({ ...existing, ...dto });
      mockRedis.del.mockResolvedValue(undefined);

      const result = await service.update('cat-1', dto);

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(mockRedis.del).toHaveBeenCalledWith('cache:categories');
      expect(result.name).toBe('Новое имя');
    });

    it('должен бросать BusinessException, если категория не найдена', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
        BusinessException,
      );
      await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
        new BusinessException(exceptionCodes.categories.notFound, 404),
      );

      expect(mockCategoryRepo.save).not.toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен удалять существующую категорию и инвалидировать кеш', async () => {
      const existing = { id: 'cat-1', name: 'Категория' };
      mockCategoryRepo.findOne.mockResolvedValue(existing);
      mockCategoryRepo.remove.mockResolvedValue(undefined);
      mockRedis.del.mockResolvedValue(undefined);

      await service.remove('cat-1');

      expect(mockCategoryRepo.remove).toHaveBeenCalledWith(existing);
      expect(mockRedis.del).toHaveBeenCalledWith('cache:categories');
    });

    it('должен бросать BusinessException, если категория для удаления не найдена', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        BusinessException,
      );
      expect(mockCategoryRepo.remove).not.toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });
});
