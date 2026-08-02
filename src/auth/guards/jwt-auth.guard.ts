import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const errorMessage = info?.message || 'Необходима авторизация';
      throw new UnauthorizedException(errorMessage);
    }
    
    return user;
  }
}