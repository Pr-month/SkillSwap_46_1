import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponse } from './dto/user-profile.response';
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
      city: user.city,
      avatar: user.avatar,
      about: user.about,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserData: CreateUserData): Promise<User> {
    const user = this.usersRepository.create(createUserData);

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
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
  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponse> {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedUser = await this.usersRepository.save(user);

    return this.toProfileResponse(updatedUser);
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
