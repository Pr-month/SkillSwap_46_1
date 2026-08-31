import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockCityRepo = {
  find: jest.fn(),
  query: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('CitiesService', () => {
  let service: CitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepo,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('должен создавать расширение pg_trgm, если его ещё нет', async () => {
      mockCityRepo.query.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockCityRepo.query).toHaveBeenCalledWith(
        'CREATE EXTENSION IF NOT EXISTS pg_trgm;',
      );
    });

    it('не должен падать, если создание расширения завершилось ошибкой', async () => {
      mockCityRepo.query.mockRejectedValue(new Error('нет прав'));

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('findPopular', () => {
    it('должен возвращать города, отсортированные по населению', async () => {
      const mockResult = [
        { id: 'city-1', name: 'Москва', population: 12000000 },
      ];
      mockCityRepo.find.mockResolvedValue(mockResult);

      const result = await service.findPopular(20);

      expect(mockCityRepo.find).toHaveBeenCalledWith({
        order: { population: 'DESC' },
        take: 20,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('search', () => {
    it('должен искать города через триграммное сходство (pg_trgm)', async () => {
      const mockResult = [
        { id: 'city-1', name: 'Казань', population: 1300000 },
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockResult);

      const result = await service.search('Каза', 20);

      expect(mockCityRepo.createQueryBuilder).toHaveBeenCalledWith('city');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'similarity(city.name, :query) > :threshold',
        { query: 'Каза', threshold: 0.2 },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'similarity(city.name, :query)',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'city.population',
        'DESC',
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockResult);
    });

    it('должен обрезать пробелы в поисковом запросе', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.search('  Москва  ', 20);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'similarity(city.name, :query) > :threshold',
        { query: 'Москва', threshold: 0.2 },
      );
    });
  });
});
