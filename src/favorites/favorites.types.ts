import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { Favorite } from '../skills/entities/favorite.entity';
import { Skill } from '../skills/entities/skills.entity';
import { User } from '../users/entities/user.entity';

export type FavoriteData = Pick<
  Favorite,
  'id' | 'userId' | 'skillId' | 'createdAt'
>;

export type FavoriteSkillOwnerData = Pick<User, 'id' | 'name' | 'avatar'>;

export type FavoriteSkillData = Pick<
  Skill,
  'id' | 'title' | 'description' | 'images'
> & {
  category: Pick<Category, 'name'> | null;
  subcategory: Pick<Subcategory, 'name'> | null;
  owner: FavoriteSkillOwnerData | null;
};
