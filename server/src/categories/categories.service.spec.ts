import { CACHE_KEYS } from '@/common/constants/cache-keys.constants';
import { CACHE_TTL } from '@/common/constants/cache-ttl.constants';
import { exceptionCodes } from '@/common/errors/error-codes';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;

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

  const categoryId = 'cat-uuid-1';

  const createCategory = (
    overrides: Partial<Category> = {},
  ): Partial<Category> => ({
    id: categoryId,
    name: 'Бизнес и карьера',
    subcategories: [],
    ...overrides,
  });

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

    jest.clearAllMocks();
  });

  it('должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('должен возвращать категории из кеша, не дергая БД', async () => {
      const cached = [createCategory()];

      mockRedis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.findAll();

      expect(result).toEqual(cached);
      expect(mockRedis.get).toHaveBeenCalledWith(CACHE_KEYS.CATEGORIES);
      expect(mockCategoryRepo.find).not.toHaveBeenCalled();
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('должен брать из БД и класть в кеш с TTL, если кеша нет', async () => {
      const fromDb = [createCategory()];

      mockRedis.get.mockResolvedValue(null);
      mockCategoryRepo.find.mockResolvedValue(fromDb);
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.findAll();

      expect(result).toEqual(fromDb);
      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        relations: { subcategories: true },
      });
      expect(mockRedis.set).toHaveBeenCalledWith(
        CACHE_KEYS.CATEGORIES,
        JSON.stringify(fromDb),
        'EX',
        CACHE_TTL.ONE_DAY,
      );
    });

    it('должен пробрасывать ошибку при битом JSON в кеше', async () => {
      mockRedis.get.mockResolvedValue('not-a-json');

      await expect(service.findAll()).rejects.toThrow(SyntaxError);

      expect(mockCategoryRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('должен создавать категорию и инвалидировать кеш', async () => {
      const dto = { name: 'Новая категория' };
      const createdEntity = { ...dto } as Category;
      const savedEntity = { id: categoryId, ...dto } as Category;

      mockCategoryRepo.create.mockReturnValue(createdEntity);
      mockCategoryRepo.save.mockResolvedValue(savedEntity);
      mockRedis.del.mockResolvedValue(1);

      const result = await service.create(dto);

      expect(mockCategoryRepo.create).toHaveBeenCalledWith(dto);
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(createdEntity);
      expect(mockRedis.del).toHaveBeenCalledWith(CACHE_KEYS.CATEGORIES);
      expect(result).toEqual(savedEntity);
    });
  });

  describe('update', () => {
    it('должен обновлять существующую категорию и инвалидировать кеш', async () => {
      const existing = createCategory({ name: 'Старое имя' }) as Category;
      const dto = { name: 'Новое имя' };
      const saved = { ...existing, ...dto } as Category;

      mockCategoryRepo.findOne.mockResolvedValue(existing);
      mockCategoryRepo.save.mockResolvedValue(saved);
      mockRedis.del.mockResolvedValue(1);

      const result = await service.update(categoryId, dto);

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: categoryId, name: 'Новое имя' }),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(CACHE_KEYS.CATEGORIES);
      expect(result.name).toBe('Новое имя');
    });

    it('должен бросать BusinessException, если категория не найдена', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { name: 'X' }),
      ).rejects.toMatchObject({
        code: exceptionCodes.categories.notFound,
        status: 404,
      });

      expect(mockCategoryRepo.save).not.toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен удалять существующую категорию и инвалидировать кеш', async () => {
      const existing = createCategory() as Category;

      mockCategoryRepo.findOne.mockResolvedValue(existing);
      mockCategoryRepo.remove.mockResolvedValue(existing);
      mockRedis.del.mockResolvedValue(1);

      await service.remove(categoryId);

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockCategoryRepo.remove).toHaveBeenCalledWith(existing);
      expect(mockRedis.del).toHaveBeenCalledWith(CACHE_KEYS.CATEGORIES);
    });

    it('должен бросать BusinessException, если категория для удаления не найдена', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toMatchObject({
        code: exceptionCodes.categories.notFound,
        status: 404,
      });

      expect(mockCategoryRepo.remove).not.toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });
});
