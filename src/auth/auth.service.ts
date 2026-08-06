import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { BusinessException } from '../common/errors/business.exception';
import { exceptionCodes } from '../common/errors/error-codes';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { User } from '../users/entities/user.entity';
import { UserGender, UserRole } from '../users/enums/user.enums';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigurationService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BusinessException(exceptionCodes.users.alreadyExists, 409);
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.configService.hashSalt,
    );

    const newUser = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      birthdate: new Date(registerDto.birthdate),
      gender: registerDto.gender ?? UserGender.OTHER,
      city: registerDto.city,
      avatar: registerDto.avatar,
      role: UserRole.USER,
    });

    const tokens = await this.generateTokens(newUser.id, newUser.email);

    await this.usersService.updateRefreshToken(newUser.id, tokens.refreshToken);

    return {
      status: true,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        birthDate: newUser.birthdate,
        gender: newUser.gender,
        city: newUser.city,
        avatar: newUser.avatar,
      },
    };
  }

  async checkUser(email: string) {
    const user = await this.usersService.findByEmail(email);
    return {
      exists: !!user,
      email,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password' | 'refreshToken'> | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const {
        password: _password,
        refreshToken: _refreshToken,
        ...result
      } = user;
      void _password;
      void _refreshToken;
      return result;
    }

    return null;
  }
  // не нужен весь юзер, из-за этого падала сборка
  async login(user: AuthenticatedUser) {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      status: true,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BusinessException(exceptionCodes.users.notFound, 404);
    }

    return {
      status: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        birthDate: user.birthdate,
        gender: user.gender,
        city: user.city,
        avatar: user.avatar,
        about: user.about,
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      },
    };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BusinessException(exceptionCodes.users.notFound, 404);
    }

    const hashedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      this.configService.hashSalt,
    );

    await this.usersService.updatePassword(userId, hashedPassword);

    return {
      status: true,
      message: 'Пароль успешно обновлен',
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Недействительный токен обновления');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      status: true,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, tokenType: 'access' },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, tokenType: 'refresh' },
        { expiresIn: '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
