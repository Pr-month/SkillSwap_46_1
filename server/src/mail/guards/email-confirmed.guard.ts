import { RequestWithUser } from '@/auth/auth.types';
import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { UsersService } from '@/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class EmailConfirmedGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.id;

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
