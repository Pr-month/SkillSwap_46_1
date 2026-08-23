import { UserProfileResponse } from '../../users/dto/user-profile.response';
import { UserGender } from '../../users/enums/user.enums';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    birthdate: string;
    gender: UserGender;
    city: string;
    avatar: string;
    about?: string;
    wantToLearn?: string[];
    skills?: string[];
}
export declare class RegisterResponseDto {
    status: boolean;
    access_token: string;
    user: UserProfileResponse;
}
