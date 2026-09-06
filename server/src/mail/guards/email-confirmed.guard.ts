import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { UsersService } from '@/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class EmailConfirmedGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.id;

    if (!userId) {
      throw new BusinessException(
        exceptionCodes.common.unauthorized,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BusinessException(
        exceptionCodes.users.notFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.isEmailConfirmed) {
      throw new BusinessException(
        exceptionCodes.users.emailNotConfirmed,
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
