import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const mockCategoryRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
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
    it('должен возвращать список категорий c подкатегориями', async () => {
      const mockResult = [
        { id: 'cat-1', name: 'Бизнес и карьера', subcategories: [] },
      ];
      mockCategoryRepo.find.mockResolvedValue(mockResult);

      const result = await service.findAll();

      expect(result).toEqual(mockResult);
      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        relations: { subcategories: true },
      });
    });
  });

  describe('create', () => {
    it('должен создавать категорию', async () => {
      const dto = { name: 'Новая категория' };
      const createdEntity = { ...dto };
      const savedEntity = { id: 'cat-1', ...dto };

      mockCategoryRepo.create.mockReturnValue(createdEntity);
      mockCategoryRepo.save.mockResolvedValue(savedEntity);

      const result = await service.create(dto);

      expect(mockCategoryRepo.create).toHaveBeenCalledWith(dto);
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(savedEntity);
    });
  });

  describe('update', () => {
    it('должен обновлять существующую категорию', async () => {
      const existing = { id: 'cat-1', name: 'Старое имя' };
      const dto = { name: 'Новое имя' };

      mockCategoryRepo.findOne.mockResolvedValue(existing);
      mockCategoryRepo.save.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update('cat-1', dto);

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(result.name).toBe('Новое имя');
    });

    it('должен бросать BusinessException, если категория не найдена', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { name: 'X' }),
      ).rejects.toThrow(BusinessException);
      await expect(
        service.update('missing-id', { name: 'X' }),
      ).rejects.toThrow(
        new BusinessException(exceptionCodes.categories.notFound, 404),
      );

      expect(mockCategoryRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен удалять существующую категорию', async () => {
      const existing = { id: 'cat-1', name: 'Категория' };
      mockCategoryRepo.findOne.mockResolvedValue(existing);
      mockCategoryRepo.remove.mockResolvedValue(undefined);

      await service.remove('cat-1');

      expect(mockCategoryRepo.remove).toHaveBeenCalledWith(existing);
    });

    it('должен бросать BusinessException, если категория для удаления не найдена', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        BusinessException,
      );
      expect(mockCategoryRepo.remove).not.toHaveBeenCalled();
    });
  });
});
