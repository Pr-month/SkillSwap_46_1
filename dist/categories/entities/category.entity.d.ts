import { Skill } from '../../skills/entities/skills.entity';
import { Subcategory } from './subcategory.entity';
export declare class Category {
    id: string;
    name: string;
    subcategories: Subcategory[];
    skills: Skill[];
}
