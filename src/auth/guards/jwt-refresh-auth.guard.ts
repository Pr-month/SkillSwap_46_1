import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      const errorMessage =
        (info && typeof info === 'object' && 'message' in info
          ? (info as { message: string }).message
          : undefined) || 'Недействительный или отсутствующий токен обновления';

      throw new UnauthorizedException(errorMessage);
    }
    return user as TUser;
  }
}
