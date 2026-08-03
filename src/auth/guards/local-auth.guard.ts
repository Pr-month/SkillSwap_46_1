import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    _info: unknown, // Добавлено нижнее подчеркивание, так как не используется
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          code: 'app:unauthorized',
          message: 'Неверный email или пароль',
          timestamp: new Date().toISOString(),
        })
      );
    }
    return user as TUser;
  }
}
