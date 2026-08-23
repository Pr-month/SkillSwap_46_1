import { User } from '../../users/entities/user.entity';
import { Skill } from './skills.entity';
export declare class Favorite {
    id: string;
    userId: string;
    user: User;
    skillId: string;
    skill: Skill;
    createdAt: Date;
}
