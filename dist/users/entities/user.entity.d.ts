import { Relation } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Favorite } from '../../skills/entities/favorite.entity';
import { Skill } from '../../skills/entities/skills.entity';
import { UserGender, UserRole } from '../enums/user.enums';
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    about: string | null;
    birthdate: Date;
    city: string;
    gender: UserGender;
    avatar: string | null;
    favorites: Favorite[];
    skills: Relation<Skill>[];
    wantToLearn: Relation<Category>[];
    favoriteSkills: Relation<Skill>[];
    createdAt: Date;
    updatedAt: Date;
    role: UserRole;
    refreshToken: string | null;
}
