import { UserGender, UserRole } from '../enums/user.enums';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    about?: string;
    birthdate: Date;
    city: string;
    gender: UserGender;
    avatar?: string;
    role: UserRole;
}
