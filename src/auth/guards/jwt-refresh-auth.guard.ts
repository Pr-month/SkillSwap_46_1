import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const errorMessage = info?.message || 'Недействительный или отсутствующий токен обновления';
      throw new UnauthorizedException(errorMessage);
    }
    
    return user;
  }
}