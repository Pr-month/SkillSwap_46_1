import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skills.entity';
import { User } from './entities/user.entity';
export type UserData = Pick<User, keyof User>;
export type CreateUserData = Omit<UserData, 'id' | 'refreshToken' | 'favoriteSkills' | 'favorites' | 'createdAt' | 'updatedAt' | 'skills' | 'wantToLearn'> & {
    password: string;
    wantToLearn?: Category[];
    skills?: Skill[];
};
export type UpdateUserData = Partial<Omit<UserData, 'id' | 'email' | 'refreshToken'>>;
