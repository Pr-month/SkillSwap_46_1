import { UserGender } from '../enums/user.enums';
export declare class UpdateUserDto {
    name?: string;
    about?: string | null;
    birthdate?: Date;
    city?: string;
    gender?: UserGender;
    avatar?: string | null;
}
