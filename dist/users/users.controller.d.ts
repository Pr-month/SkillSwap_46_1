import { RequestWithUser } from '../auth/auth.types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(request: RequestWithUser): Promise<import("./dto/user-profile.response").UserProfileResponse>;
    getById(id: string): Promise<import("./dto/user-profile.response").UserProfileResponse>;
    updateMe(request: RequestWithUser, updateUserDto: UpdateUserDto): Promise<import("./dto/user-profile.response").UserProfileResponse>;
    changePassword(request: RequestWithUser, changePasswordDto: ChangePasswordDto): Promise<{
        status: boolean;
        message: string;
    }>;
}
