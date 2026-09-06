import { PaginatedResponseDto } from '@/common/dto/response.dto';
import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Brackets, Repository } from 'typeorm';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListItemResponse } from './dto/user-list-item.response';
import { UserProfileResponse } from './dto/user-profile.response';
import { UsersQueryDto } from './dto/users-query.dto';
import { User } from './entities/user.entity';
import { CreateUserData } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configurationService: ConfigurationService,
  ) {}
  private toProfileResponse(user: User): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      birthDate: user.birthdate,
      gender: user.gender,
      city: user.city?.name ?? null,
      avatar: user.avatar,
      about: user.about,
      role: user.role,
      likesSkillsIds: user.favoriteSkills?.map((skill) => skill.id) ?? [],
      userSkill: user.skills?.[0]?.id ?? null,
      interestedSkillsSubcategoriesIds:
        user.wantToLearnSubcategories?.map((subcategory) => subcategory.id) ??
        [],
      isEmailConfirmed: user.isEmailConfirmed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toUserListItem(user: User): UserListItemResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      birthDate: user.birthdate,
      gender: user.gender,
      city: user.city?.name ?? null,
      avatar: user.avatar,
      aboutMe: user.about,
      likesSkillsIds: user.favoriteSkills?.map((skill) => skill.id) ?? [],
      userSkill: user.skills?.[0]?.id ?? null,
      interestedSkillsSubcategoriesIds:
        user.wantToLearnSubcategories?.map((subcategory) => subcategory.id) ??
        [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserData: CreateUserData): Promise<User> {
    const user = this.usersRepository.create(createUserData);

    return this.usersRepository.save(user);
  }

  async findAll(
    query: UsersQueryDto,
  ): Promise<PaginatedResponseDto<UserListItemResponse>> {
    const builder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.city', 'city')
      .leftJoinAndSelect('user.skills', 'userSkill')
      .leftJoinAndSelect('user.favoriteSkills', 'favoriteSkill')
      .leftJoinAndSelect('user.wantToLearn', 'wantToLearn')
      .leftJoinAndSelect('wantToLearn.subcategories', 'wantToLearnSubcategory')
      .leftJoinAndSelect(
        'user.wantToLearnSubcategories',
        'userWantToLearnSubcategory',
      )
      .orderBy('user.createdAt', 'DESC')
      .skip(query.skip)
      .take(query.limit);

    if (query.search) {
      builder.andWhere(
        new Brackets((where) => {
          where
            .where('LOWER(user.name) LIKE :search')
            .orWhere('LOWER(user.email) LIKE :search')
            .orWhere('LOWER(userSkill.title) LIKE :search')
            .orWhere('LOWER(userSkill.description) LIKE :search');
        }),
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.gender && query.gender.toLowerCase() !== 'all') {
      builder.andWhere('CAST(user.gender AS text) = :gender', {
        gender: query.gender.toUpperCase(),
      });
    }

    if (query.cities?.length) {
      builder.andWhere('city.name IN (:...cities)', { cities: query.cities });
    }

    if (query.subCategoryIds?.length) {
      const skillOption = query.skillOption ?? 'all';
      if (skillOption === 'can-teach') {
        builder.andWhere(
          '"userSkill"."subcategory_id"::text IN (:...subCategoryIds)',
          {
            subCategoryIds: query.subCategoryIds,
          },
        );
      } else if (skillOption === 'want-to-learn') {
        builder.andWhere(
          '"userWantToLearnSubcategory"."id"::text IN (:...subCategoryIds)',
          { subCategoryIds: query.subCategoryIds },
        );
      } else {
        builder.andWhere(
          new Brackets((where) => {
            where
              .where(
                '"userSkill"."subcategory_id"::text IN (:...subCategoryIds)',
              )
              .orWhere(
                '"userWantToLearnSubcategory"."id"::text IN (:...subCategoryIds)',
              );
          }),
          { subCategoryIds: query.subCategoryIds },
        );
      }
    }

    const [users, total] = await builder.getManyAndCount();
    const totalPages = Math.ceil(total / query.limit);

    if (query.page > Math.max(totalPages, 1)) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return new PaginatedResponseDto(
      users.map((user) => this.toUserListItem(user)),
      query.page,
      total,
      query.limit,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { city: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: {
        city: true,
        skills: true,
        favoriteSkills: true,
        wantToLearnSubcategories: true,
      },
    });
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    const result = await this.usersRepository.update({ id }, { refreshToken });

    if (!result.affected) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async clearRefreshToken(id: string): Promise<void> {
    await this.updateRefreshToken(id, null);
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const result = await this.usersRepository.update({ id }, { password });

    if (!result.affected) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async confirmEmail(userId: string): Promise<void> {
    const result = await this.usersRepository.update(
      { id: userId },
      { isEmailConfirmed: true },
    );

    if (!result.affected) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getProfile(id: string): Promise<UserProfileResponse> {
    const user = await this.findById(id);

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toProfileResponse(user);
  }

  async getPublicProfile(id: string): Promise<UserListItemResponse> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        city: true,
        skills: true,
        favoriteSkills: true,
        wantToLearnSubcategories: true,
      },
    });

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toUserListItem(user);
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponse> {
    const user = await this.findById(id);

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.birthdate !== undefined)
      user.birthdate = updateUserDto.birthdate;
    if (updateUserDto.gender !== undefined) user.gender = updateUserDto.gender;
    if (updateUserDto.cityId !== undefined) user.cityId = updateUserDto.cityId;
    if (updateUserDto.avatar !== undefined) user.avatar = updateUserDto.avatar;
    if (updateUserDto.about !== undefined) user.about = updateUserDto.about;

    await this.usersRepository.save(user);

    const fullUser = await this.findById(id);
    return this.toProfileResponse(fullUser!);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new BusinessException(
        exceptionCodes.users.invalidCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      this.configurationService.hashSalt,
    );

    await this.updatePassword(id, hashedPassword);
  }
}
