import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private usersService;
    constructor(reflector: Reflector, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
