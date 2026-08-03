import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import ms, { StringValue } from 'ms';

import { ConfigurationService } from '../module/configuration/configuration.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigurationService,
  ) {}

  async register(registerDto: RegisterDto, res: Response) {
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.configService.hashSalt,
    );

    const user = await this.usersService.create(registerDto, hashedPassword);

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
      return { id: user.id, email: user.email };
    }
    return null;
  }

  async login(user: { id: string; email: string }, res: Response) {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    this.setAuthCookies(res, tokens);

    const fullUser = await this.usersService.findById(user.id);
    return fullUser;
  }

  async logout(userId: string, res: Response) {
    await this.usersService.clearRefreshToken(userId);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Успешный выход' };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const hashedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      this.configService.hashSalt,
    );
    await this.usersService.updatePassword(userId, hashedPassword);
    return { message: 'Пароль успешно обновлен' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return user;
  }

  async checkUser(email: string) {
    const exists = await this.usersService.existsByEmail(email);
    return { exists, email };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, tokenType: 'access' },
        { expiresIn: this.configService.jwtAccessExpiresIn as StringValue },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, tokenType: 'refresh' },
        {
          expiresIn: this.configService.jwtRefreshExpiresIn as StringValue,
          secret: this.configService.jwtRefreshSecret,
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: ms(this.configService.jwtAccessExpiresIn as StringValue),
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: ms(this.configService.jwtRefreshExpiresIn as StringValue),
    });
  }
}
