import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err || !user) {
      console.log('Local Auth Guard - Error:', err);
      console.log('Local Auth Guard - Info:', info);
      
      throw err || new UnauthorizedException({
        code: 'app:unauthorized',
        message: 'Неверный email или пароль',
        timestamp: new Date().toISOString()
      });
    }
    return user;
  }
}