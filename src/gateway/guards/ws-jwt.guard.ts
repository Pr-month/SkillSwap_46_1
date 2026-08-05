import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { parse } from 'cookie';

import { JwtPayload } from '../../auth/auth.types';
import { ConfigurationService } from '../../module/configuration/configuration.service';
import { AuthenticatedSocket, SocketUser } from '../gateway.types';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    await this.authenticate(client);

    return true;
  }

  async authenticate(client: AuthenticatedSocket): Promise<SocketUser> {
    const accessToken = this.extractAccessToken(client);

    if (!accessToken) {
      throw new WsException('Необходима авторизация');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        accessToken,
        {
          secret: this.configurationService.jwtAccessSecret,
        },
      );

      if (payload.tokenType !== 'access' || !payload.sub || !payload.email) {
        throw new WsException('Недействительный access token');
      }

      const user: SocketUser = {
        id: payload.sub,
        email: payload.email,
      };

      client.data.user = user;

      return user;
    } catch (error: unknown) {
      if (error instanceof WsException) {
        throw error;
      }

      throw new WsException('Недействительный или просроченный токен');
    }
  }

  private extractAccessToken(client: AuthenticatedSocket): string | null {
    const cookieHeader = client.handshake.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    try {
      const cookies = parse(cookieHeader);

      return cookies.accessToken ?? null;
    } catch {
      return null;
    }
  }
}
