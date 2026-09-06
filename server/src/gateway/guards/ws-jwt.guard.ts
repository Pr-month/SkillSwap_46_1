import { JwtPayload } from '@/auth/auth.types';
import {
  type ExceptionCode,
  exceptionCodes,
} from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { parse } from 'cookie';

import { AuthenticatedSocket, SocketUser } from '../gateway.types';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

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
      throw this.createWsException(exceptionCodes.common.unauthorized);
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        accessToken,
        {
          secret: this.configurationService.jwtAccessSecret,
        },
      );

      if (payload.tokenType !== 'access' || !payload.sub || !payload.email) {
        throw this.createWsException(exceptionCodes.auth.invalidAccessToken);
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

      if (error instanceof TokenExpiredError) {
        throw this.createWsException(exceptionCodes.auth.expiredAccessToken);
      }

      if (error instanceof NotBeforeError) {
        throw this.createWsException(exceptionCodes.auth.invalidAccessToken);
      }

      if (error instanceof JsonWebTokenError) {
        throw this.createWsException(exceptionCodes.auth.invalidAccessToken);
      }

      this.logger.error(
        'Неожиданная ошибка при аутентификации WebSocket-клиента',
        error instanceof Error ? error.stack : undefined,
      );

      throw this.createWsException(exceptionCodes.common.internal);
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

  private createWsException(code: ExceptionCode): WsException {
    return new WsException({
      code,
      message: code,
    });
  }
}
