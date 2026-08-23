import { Repository } from 'typeorm';
import { ConfigurationService } from '../module/configuration/configuration.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponse } from './dto/user-profile.response';
import { User } from './entities/user.entity';
import { CreateUserData } from './users.types';
export declare class UsersService {
    private readonly usersRepository;
    private readonly configurationService;
    constructor(usersRepository: Repository<User>, configurationService: ConfigurationService);
    private toProfileResponse;
    create(createUserData: CreateUserData): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
    clearRefreshToken(id: string): Promise<void>;
    updatePassword(id: string, password: string): Promise<void>;
    getProfile(id: string): Promise<UserProfileResponse>;
    updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<UserProfileResponse>;
    changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void>;
}
