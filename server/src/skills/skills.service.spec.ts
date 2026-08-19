import { HttpStatus } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './entities/skills.entity';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  let service: SkillsService;
  let skillsRepository: jest.Mocked<Repository<Skill>>;
  let categoriesRepository: jest.Mocked<Repository<Category>>;
  let subcategoriesRepository: jest.Mocked<Repository<Subcategory>>;

  beforeEach(() => {
    skillsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<Skill>>;
    categoriesRepository = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<Category>>;
    subcategoriesRepository = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<Subcategory>>;

    service = new SkillsService(
      skillsRepository,
      categoriesRepository,
      subcategoriesRepository,
    );
  });

  it('создаёт навык от имени текущего пользователя', async () => {
    const dto: CreateSkillDto = {
      title: 'TypeScript',
      description: 'Помогу разобраться с TypeScript',
      categoryId: 'bdbdbd06-0ee5-4cd9-8446-15a3be0af22f',
    };
    const created = { id: 'skill-id', ...dto } as Skill;
    categoriesRepository.findOneBy.mockResolvedValue({
      id: dto.categoryId,
    } as Category);
    skillsRepository.create.mockReturnValue(created);
    skillsRepository.save.mockResolvedValue(created);

    await expect(service.create('owner-id', dto)).resolves.toBe(created);
    expect(skillsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        ownerId: 'owner-id',
        owner: { id: 'owner-id' },
        images: null,
        subcategoryId: null,
      }),
    );
  });

  it('возвращает 404 для страницы за пределами результата', async () => {
    const builder = createQueryBuilderMock([[], 21]);
    skillsRepository.createQueryBuilder.mockReturnValue(builder);
    const query = Object.assign(new PaginationDto(), { page: 4, limit: 10 });

    await expect(service.findAll(query)).rejects.toMatchObject({
      code: exceptionCodes.skills.notFound,
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('возвращает 404 для второй страницы пустого списка', async () => {
    const builder = createQueryBuilderMock([[], 0]);
    skillsRepository.createQueryBuilder.mockReturnValue(builder);
    const query = Object.assign(new PaginationDto(), { page: 2 });

    await expect(service.findAll(query)).rejects.toMatchObject({
      code: exceptionCodes.skills.notFound,
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('запрещает изменять чужой навык', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'skill-id',
      ownerId: 'another-owner',
    } as Skill);

    await expect(
      service.update('skill-id', 'owner-id', { title: 'Новое название' }),
    ).rejects.toMatchObject({
      code: exceptionCodes.skills.accessDenied,
      status: HttpStatus.FORBIDDEN,
    });
  });

  it('проверяет принадлежность подкатегории категории', async () => {
    categoriesRepository.findOneBy.mockResolvedValue({} as Category);
    subcategoriesRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.create('owner-id', {
        title: 'TypeScript',
        description: 'Помогу разобраться с TypeScript',
        categoryId: 'bdbdbd06-0ee5-4cd9-8446-15a3be0af22f',
        subcategoryId: 'c49ca3f5-04bc-4ca9-ae38-5b27a39c79bc',
      }),
    ).rejects.toBeInstanceOf(BusinessException);
    expect(subcategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: 'c49ca3f5-04bc-4ca9-ae38-5b27a39c79bc',
      categoryId: 'bdbdbd06-0ee5-4cd9-8446-15a3be0af22f',
    });
  });
});

function createQueryBuilderMock(
  result: [Skill[], number],
): SelectQueryBuilder<Skill> {
  const builder = {
    leftJoinAndSelect: jest.fn(),
    leftJoin: jest.fn(),
    addSelect: jest.fn(),
    orderBy: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    andWhere: jest.fn(),
    where: jest.fn(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };

  Object.values(builder).forEach((method) => {
    if (method !== builder.getManyAndCount) method.mockReturnValue(builder);
  });

  return builder as unknown as SelectQueryBuilder<Skill>;
}
