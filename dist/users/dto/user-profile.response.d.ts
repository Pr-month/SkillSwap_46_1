import { UserGender, UserRole } from '../enums/user.enums';
export declare class UserProfileResponse {
    id: string;
    email: string;
    name: string;
    birthDate: Date;
    gender: UserGender;
    city: string;
    avatar: string | null;
    about: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
