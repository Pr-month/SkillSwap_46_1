import { Category } from '../../categories/entities/category.entity';
import { Subcategory } from '../../categories/entities/subcategory.entity';
import { User } from '../../users/entities/user.entity';
import { Favorite } from './favorite.entity';
export declare class Skill {
    id: string;
    title: string;
    description: string;
    images: string[] | null;
    categoryId: string;
    category: Category;
    subcategoryId: string | null;
    subcategory: Subcategory;
    ownerId: string;
    owner: User;
    createdAt: Date;
    updatedAt: Date;
    favoritedBy: Favorite[];
}
