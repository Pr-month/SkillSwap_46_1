import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigurationService);
    register(registerDto: RegisterDto, res: Response): Promise<import("../users/entities/user.entity").User>;
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
    } | null>;
    login(user: AuthenticatedUser, res: Response): Promise<import("../users/entities/user.entity").User | null>;
    logout(userId: string, res: Response): Promise<{
        message: string;
    }>;
    updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<import("../users/entities/user.entity").User | null>;
    private generateTokens;
    private setAuthCookies;
}
