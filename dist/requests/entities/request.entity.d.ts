import { Skill } from '../../skills/entities/skills.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../enums/request-status.enum';
export declare class Request {
    id: string;
    createdAt: Date;
    sender: User;
    receiver: User;
    status: RequestStatus;
    offeredSkill: Skill;
    requestedSkill: Skill;
    isRead: boolean;
}
