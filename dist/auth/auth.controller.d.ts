import { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: ExpressResponse): Promise<import("../users/entities/user.entity").User>;
    login(req: RequestWithUser, res: ExpressResponse, _loginDto: LoginDto): Promise<import("../users/entities/user.entity").User | null>;
    logout(req: RequestWithUser, res: ExpressResponse): Promise<{
        message: string;
    }>;
    getProfile(req: RequestWithUser): Promise<import("../users/entities/user.entity").User | null>;
    updatePassword(req: RequestWithUser, updatePasswordDto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
}
