import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/response.dto';
import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { User } from '../users/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skills.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoriesRepository: Repository<Subcategory>,
  ) {}

  async create(ownerId: string, dto: CreateSkillDto): Promise<Skill> {
    await this.validateCategory(dto.categoryId, dto.subcategoryId);

    const skill = this.skillsRepository.create({
      ...dto,
      images: dto.images ?? null,
      subcategoryId: dto.subcategoryId ?? null,
      ownerId,
      owner: { id: ownerId } as User,
    });

    return this.skillsRepository.save(skill);
  }

  async createForRegistration(
    ownerId: string,
    data: {
      title?: string;
      description?: string;
      subcategoryId?: string;
      images?: string[];
    },
  ): Promise<Skill | null> {
    const subcategoryId = data.subcategoryId?.trim();

    if (!subcategoryId) {
      return null;
    }

    const subcategory = await this.subcategoriesRepository.findOneBy({
      id: subcategoryId,
    });

    if (!subcategory) {
      return null;
    }

    const skill = this.skillsRepository.create({
      title: data.title?.trim() || subcategory.name || 'Мой навык',
      description: data.description?.trim() || 'Навык пользователя',
      images: data.images ?? null,
      categoryId: subcategory.categoryId,
      subcategoryId: subcategory.id,
      ownerId,
      owner: { id: ownerId } as User,
    });

    return this.skillsRepository.save(skill);
  }

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<Skill>> {
    const builder = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.subcategory', 'subcategory')
      .leftJoin('skill.owner', 'owner')
      .addSelect(this.publicOwnerColumns)
      .orderBy('skill.createdAt', 'DESC')
      .skip(query.skip)
      .take(query.limit);

    if (query.search) {
      builder.andWhere(
        new Brackets((where) => {
          where
            .where('LOWER(skill.title) LIKE :search')
            .orWhere('LOWER(category.name) LIKE :search')
            .orWhere('LOWER(subcategory.name) LIKE :search');
        }),
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.category) {
      builder.andWhere(
        new Brackets((where) => {
          where
            .where('category.id::text = :category')
            .orWhere('subcategory.id::text = :category')
            .orWhere('LOWER(category.name) = LOWER(:category)')
            .orWhere('LOWER(subcategory.name) = LOWER(:category)');
        }),
        { category: query.category },
      );
    }

    const [skills, total] = await builder.getManyAndCount();
    const totalPages = Math.ceil(total / query.limit);

    if (query.page > Math.max(totalPages, 1)) {
      throw new BusinessException(
        exceptionCodes.skills.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return new PaginatedResponseDto(skills, query.page, total, query.limit);
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.subcategory', 'subcategory')
      .leftJoin('skill.owner', 'owner')
      .addSelect(this.publicOwnerColumns)
      .where('skill.id = :id', { id })
      .getOne();

    if (!skill) {
      throw new BusinessException(
        exceptionCodes.skills.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return skill;
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateSkillDto,
  ): Promise<Skill> {
    const skill = await this.findOne(id);
    this.assertOwner(skill, ownerId);

    const categoryId = dto.categoryId ?? skill.categoryId;
    const subcategoryId =
      dto.subcategoryId === undefined
        ? (skill.subcategoryId ?? undefined)
        : dto.subcategoryId;
    await this.validateCategory(categoryId, subcategoryId);

    Object.assign(skill, dto);
    return this.skillsRepository.save(skill);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const skill = await this.findOne(id);
    this.assertOwner(skill, ownerId);
    await this.skillsRepository.remove(skill);
  }

  private assertOwner(skill: Skill, ownerId: string): void {
    if (skill.ownerId !== ownerId) {
      throw new BusinessException(
        exceptionCodes.skills.accessDenied,
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private async validateCategory(
    categoryId: string,
    subcategoryId?: string,
  ): Promise<void> {
    const category = await this.categoriesRepository.findOneBy({
      id: categoryId,
    });
    if (!category) {
      throw new BusinessException(
        exceptionCodes.categories.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!subcategoryId) return;

    const subcategory = await this.subcategoriesRepository.findOneBy({
      id: subcategoryId,
      categoryId,
    });
    if (!subcategory) {
      throw new BusinessException(
        exceptionCodes.categories.subcategoryNotFound,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private readonly publicOwnerColumns = [
    'owner.id',
    'owner.name',
    'owner.about',
    'owner.birthdate',
    'owner.city',
    'owner.gender',
    'owner.avatar',
  ];
}
