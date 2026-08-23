import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockCityRepo = {
  find: jest.fn(),
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
    it('должен искать города по подстроке в названии без учёта регистра', async () => {
      const mockResult = [
        { id: 'city-1', name: 'Казань', population: 1300000 },
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockResult);

      const result = await service.search('КаЗа', 20);

      expect(mockCityRepo.createQueryBuilder).toHaveBeenCalledWith('city');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(city.name) LIKE :query',
        { query: '%каза%' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'city.population',
        'DESC',
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockResult);
    });
  });
});
