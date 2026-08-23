import { UserProfileResponse } from '../../users/dto/user-profile.response';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class LoginResponseDto {
    status: boolean;
    access_token: string;
    user: UserProfileResponse;
}
