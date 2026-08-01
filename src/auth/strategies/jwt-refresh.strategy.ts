import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigurationService } from '../../module/configuration/configuration.service';
import { JwtPayload } from '../auth.types';

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
    });
  }

  validate(payload: JwtPayload) {
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
