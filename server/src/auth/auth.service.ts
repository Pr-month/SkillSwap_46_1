import { Category } from '@/categories/entities/category.entity';
import { Subcategory } from '@/categories/entities/subcategory.entity';
import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { REDIS_CLIENT } from '@/redis/redis.module';
import { SkillsService } from '@/skills/skills.service';
import { UserGender, UserRole } from '@/users/enums/user.enums';
import { UsersService } from '@/users/users.service';
import { CreateUserData } from '@/users/users.types';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { Response, Request } from 'express';
import { Redis } from 'ioredis';
import ms, { StringValue } from 'ms';

import { AuthenticatedUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigurationService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async register(registerDto: RegisterDto, res: Response) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BusinessException(
        exceptionCodes.users.alreadyExists,
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.configService.hashSalt,
    );

    const wantToLearn = registerDto.wantToLearn
      ? registerDto.wantToLearn.map((id) => ({ id }) as Category)
      : [];

    const selectedSubcategoryIds =
      registerDto.interestedSkillsSubcategoriesIds ?? registerDto.skills ?? [];

    const wantToLearnSubcategories = selectedSubcategoryIds.map(
      (id) => ({ id }) as Subcategory,
    );

    const createUserData: CreateUserData = {
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      birthdate: new Date(registerDto.birthdate),
      gender: registerDto.gender ?? UserGender.OTHER,
      cityId: registerDto.cityId,
      avatar: registerDto.avatar,
      role: UserRole.USER,
      about: registerDto.about ?? null,
      wantToLearn,
      wantToLearnSubcategories,
    };

    const user = await this.usersService.create(createUserData);

    const skillSubcategoryId =
      registerDto.skills?.[0] ?? selectedSubcategoryIds[0];

    if (skillSubcategoryId) {
      await this.skillsService.createForRegistration(user.id, {
        title: registerDto.title,
        description: registerDto.description,
        subcategoryId: skillSubcategoryId,
        images: registerDto.images,
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    this.setAuthCookies(res, tokens);

    return user;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string } | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        id: user.id,
        email: user.email,
      };
    }

    return null;
  }

  // не нужен весь юзер, из-за этого падала сборка
  async login(user: AuthenticatedUser, res: Response) {
    const tokens = await this.generateTokens(user.id, user.email);

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    this.setAuthCookies(res, tokens);

    return await this.usersService.findById(user.id);
  }

  async logout(userId: string, res: Response) {
    await this.usersService.clearRefreshToken(userId);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Успешный выход' };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatches = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new BusinessException(
        exceptionCodes.users.invalidCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const hashedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      this.configService.hashSalt,
    );

    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Пароль успешно обновлен' };
  }

  async resetPassword(token: string, newPassword: string, request?: Request) {
    try {
      if (await this.isTokenUsed(token)) {
        throw new BusinessException(
          exceptionCodes.users.invalidToken,
          HttpStatus.BAD_REQUEST,
        );
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtAccessSecret,
      });

      if (payload.tokenType !== 'reset-password') {
        throw new BusinessException(
          exceptionCodes.users.invalidToken,
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        this.configService.hashSalt,
      );

      await this.usersService.updatePassword(payload.sub, hashedPassword);

      // Помечаем токен как использованный
      await this.markTokenAsUsed(token, 60 * 60); // 1 час

      // Удалить троттлинг
      const ip = request?.ip || request?.socket?.remoteAddress;
      if (ip) {
        await this.redis.del(`mail:reset-password:${ip}`);
      }

      return { message: 'Пароль успешно сброшен' };
    } catch (error) {
      this.logger.warn('Не удалось сбросить пароль', error);
      throw new BusinessException(
        exceptionCodes.users.invalidToken,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getProfile(userId: string) {
    return this.usersService.getProfile(userId);
  }

  async checkUser(email: string): Promise<{ available: true }> {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BusinessException(
        exceptionCodes.users.alreadyExists,
        HttpStatus.CONFLICT,
      );
    }

    return { available: true };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tokenType: 'access',
        },
        {
          expiresIn: this.configService.jwtAccessExpiresIn as StringValue,
          secret: this.configService.jwtAccessSecret,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tokenType: 'refresh',
        },
        {
          expiresIn: this.configService.jwtRefreshExpiresIn as StringValue,
          secret: this.configService.jwtRefreshSecret,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private setAuthCookies(
    res: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
    },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ms(this.configService.jwtAccessExpiresIn as StringValue),
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: ms(this.configService.jwtRefreshExpiresIn as StringValue),
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async markTokenAsUsed(
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.redis.set(`used_token:${tokenHash}`, '1', 'EX', ttlSeconds);
  }

  private async isTokenUsed(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const result = await this.redis.get(`used_token:${tokenHash}`);
    return !!result;
  }
}
