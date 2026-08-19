import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      // Безопасное извлечение сообщения из info
      const errorMessage =
        (info && typeof info === 'object' && 'message' in info
          ? (info as { message: string }).message
          : undefined) || 'Необходима авторизация';

      throw new UnauthorizedException(errorMessage);
    }
    return user as TUser;
  }
}
