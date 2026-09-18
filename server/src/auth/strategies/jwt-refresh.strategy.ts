import { TokenType } from '@/common/enums/token-type.enum';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigurationService } from '../../module/configuration/configuration.service';
import { JwtPayload, RefreshAuthenticatedUser } from '../auth.types';

const extractRefreshTokenFromCookie = (request: Request): string | null => {
  const cookies = request.cookies as Record<string, string> | undefined;

  return cookies?.refreshToken ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configurationService: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractRefreshTokenFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configurationService.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: JwtPayload): RefreshAuthenticatedUser {
    if (payload.tokenType !== TokenType.REFRESH) {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = extractRefreshTokenFromCookie(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return {
      id: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
