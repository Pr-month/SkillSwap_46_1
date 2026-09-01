import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { Skill } from '../skills/entities/skills.entity';
import { User } from './entities/user.entity';

// Базовый тип только с полями данных (без методов)
export type UserData = Pick<User, keyof User>;

// Тип для создания пользователя
export type CreateUserData = Omit<
  UserData,
  | 'id'
  | 'refreshToken'
  | 'favoriteSkills'
  | 'favorites'
  | 'createdAt'
  | 'updatedAt'
  | 'skills'
  | 'wantToLearn'
  | 'wantToLearnSubcategories'
  | 'city'
> & {
  password: string;
  cityId: string;
  wantToLearn?: Category[];
  skills?: Skill[];
  wantToLearnSubcategories?: Subcategory[];
};

// Тип для обновления
export type UpdateUserData = Partial<
  Omit<UserData, 'id' | 'email' | 'refreshToken'>
>;
