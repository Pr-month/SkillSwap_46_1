import {
  HttpStatus,
  Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { User } from './entities/user.entity';
import { CreateUserData, UpdateUserData } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    await this.findById(id);

    await this.userRepository.update(id, data);

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user;
  }
}
