import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skills.entity';
import { User } from './entities/user.entity';

// Базовый тип только с полями данных (без методов)
export type UserData = Pick<User, keyof User>;

// Тип для создания пользователя
export type CreateUserData = Omit<
  UserData,
  'id' | 'refreshToken' | 'favoriteSkills' | 'favorites'
> & {
  password: string;
  wantToLearn?: Category[];
  skills?: Skill[];
};

// Тип для обновления
export type UpdateUserData = Partial<
  Omit<UserData, 'id' | 'email' | 'refreshToken'>
>;
