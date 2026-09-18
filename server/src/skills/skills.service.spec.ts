import { Category } from '@/categories/entities/category.entity';
import { Subcategory } from '@/categories/entities/subcategory.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { HttpStatus } from '@nestjs/common';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

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

  describe('createForRegistration', () => {
    it('returns null when subcategoryId is missing', async () => {
      const result = await service.createForRegistration('owner-id', {});

      expect(result).toBeNull();
      expect(subcategoriesRepository.findOneBy).not.toHaveBeenCalled();
      expect(skillsRepository.create).not.toHaveBeenCalled();
    });

    it('returns null when subcategoryId is blank', async () => {
      const result = await service.createForRegistration('owner-id', {
        subcategoryId: '   ',
      });

      expect(result).toBeNull();
      expect(subcategoriesRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('returns null when subcategory does not exist', async () => {
      subcategoriesRepository.findOneBy.mockResolvedValue(null);

      const result = await service.createForRegistration('owner-id', {
        subcategoryId: 'sub-id',
      });

      expect(result).toBeNull();
      expect(skillsRepository.create).not.toHaveBeenCalled();
    });

    it('creates skill from subcategory with fallback title and description', async () => {
      const subcategory = {
        id: 'sub-id',
        name: 'Гитара',
        categoryId: 'cat-id',
      } as Subcategory;
      subcategoriesRepository.findOneBy.mockResolvedValue(subcategory);

      const created = { id: 'skill-id' } as Skill;
      skillsRepository.create.mockReturnValue(created);
      skillsRepository.save.mockResolvedValue(created);

      const result = await service.createForRegistration('owner-id', {
        subcategoryId: 'sub-id',
      });

      expect(result).toBe(created);
      expect(skillsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Гитара',
          description: 'Навык пользователя',
          images: null,
          categoryId: 'cat-id',
          subcategoryId: 'sub-id',
          ownerId: 'owner-id',
        }),
      );
    });

    it('uses provided title/description/images when given', async () => {
      const subcategory = {
        id: 'sub-id',
        name: 'Гитара',
        categoryId: 'cat-id',
      } as Subcategory;
      subcategoriesRepository.findOneBy.mockResolvedValue(subcategory);

      const created = { id: 'skill-id' } as Skill;
      skillsRepository.create.mockReturnValue(created);
      skillsRepository.save.mockResolvedValue(created);

      await service.createForRegistration('owner-id', {
        subcategoryId: '  sub-id  ',
        title: '  Уроки гитары  ',
        description: '  Научу аккордам  ',
        images: ['https://example.com/img.jpg'],
      });

      expect(skillsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Уроки гитары',
          description: 'Научу аккордам',
          images: ['https://example.com/img.jpg'],
          subcategoryId: 'sub-id',
        }),
      );
    });
  });

  it('applies search filter', async () => {
    const builder = createQueryBuilderMock([[], 0]);
    skillsRepository.createQueryBuilder.mockReturnValue(builder);

    const query = Object.assign(new PaginationDto(), { search: '  гитара  ' });
    await service.findAll(query);

    expect(builder.andWhere).toHaveBeenCalledTimes(1);
    const [condition, params] = (builder.andWhere as jest.Mock).mock.calls[0];
    expect(condition).toBeInstanceOf(Brackets);
    expect(params).toEqual({ search: '%гитара%' });
  });

  it('applies category filter', async () => {
    const builder = createQueryBuilderMock([[], 0]);
    skillsRepository.createQueryBuilder.mockReturnValue(builder);

    const query = Object.assign(new PaginationDto(), { category: 'cat-id' });
    await service.findAll(query);

    expect(builder.andWhere).toHaveBeenCalledTimes(1);
    const [condition, params] = (builder.andWhere as jest.Mock).mock.calls[0];
    expect(condition).toBeInstanceOf(Brackets);
    expect(params).toEqual({ category: 'cat-id' });
  });

  describe('findOne', () => {
    it('returns skill when found', async () => {
      const skill = { id: 'skill-id' } as Skill;
      const builder = createQueryBuilderMock([[], 0]);
      builder.getOne = jest.fn().mockResolvedValue(skill);
      skillsRepository.createQueryBuilder.mockReturnValue(builder);

      const result = await service.findOne('skill-id');

      expect(result).toBe(skill);
      expect(builder.where).toHaveBeenCalledWith('skill.id = :id', {
        id: 'skill-id',
      });
    });

    it('throws notFound when skill missing', async () => {
      const builder = createQueryBuilderMock([[], 0]);
      builder.getOne = jest.fn().mockResolvedValue(null);
      skillsRepository.createQueryBuilder.mockReturnValue(builder);

      await expect(service.findOne('skill-id')).rejects.toMatchObject({
        code: exceptionCodes.skills.notFound,
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('update', () => {
    const existingSkill = {
      id: 'skill-id',
      ownerId: 'owner-id',
      categoryId: 'cat-id',
      subcategoryId: 'sub-id',
      title: 'Старое',
    } as Skill;

    it('updates skill when owner matches', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...existingSkill });
      categoriesRepository.findOneBy.mockResolvedValue({
        id: 'cat-id',
      } as Category);
      subcategoriesRepository.findOneBy.mockResolvedValue({
        id: 'sub-id',
        categoryId: 'cat-id',
      } as Subcategory);
      skillsRepository.save.mockImplementation(async (s) => s as Skill);

      const result = await service.update('skill-id', 'owner-id', {
        title: 'Новое',
      });

      expect(result.title).toBe('Новое');
      expect(skillsRepository.save).toHaveBeenCalled();
    });

    it('validates category when categoryId changed', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...existingSkill });
      categoriesRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('skill-id', 'owner-id', { categoryId: 'new-cat' }),
      ).rejects.toMatchObject({
        code: exceptionCodes.categories.notFound,
      });
    });

    it('keeps existing subcategoryId when dto.subcategoryId is undefined', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...existingSkill });
      categoriesRepository.findOneBy.mockResolvedValue({
        id: 'cat-id',
      } as Category);
      subcategoriesRepository.findOneBy.mockResolvedValue({
        id: 'sub-id',
        categoryId: 'cat-id',
      } as Subcategory);
      skillsRepository.save.mockImplementation(async (s) => s as Skill);

      await service.update('skill-id', 'owner-id', { title: 'Новое' });

      expect(subcategoriesRepository.findOneBy).toHaveBeenCalledWith({
        id: 'sub-id',
        categoryId: 'cat-id',
      });
    });

    it('skips subcategory validation when categoryId is empty and subcategoryId is null', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        ...existingSkill,
        subcategoryId: null,
      });
      categoriesRepository.findOneBy.mockResolvedValue({
        id: 'cat-id',
      } as Category);
      skillsRepository.save.mockImplementation(async (s) => s as Skill);

      await service.update('skill-id', 'owner-id', { title: 'Новое' });

      expect(subcategoriesRepository.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes skill when owner matches', async () => {
      const skill = { id: 'skill-id', ownerId: 'owner-id' } as Skill;
      jest.spyOn(service, 'findOne').mockResolvedValue(skill);
      skillsRepository.remove.mockResolvedValue(skill);

      await expect(
        service.remove('skill-id', 'owner-id'),
      ).resolves.toBeUndefined();

      expect(skillsRepository.remove).toHaveBeenCalledWith(skill);
    });

    it('throws accessDenied when owner does not match', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'skill-id',
        ownerId: 'another-owner',
      } as Skill);

      await expect(
        service.remove('skill-id', 'owner-id'),
      ).rejects.toMatchObject({
        code: exceptionCodes.skills.accessDenied,
      });

      expect(skillsRepository.remove).not.toHaveBeenCalled();
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
