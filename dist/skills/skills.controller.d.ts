import { RequestWithUser } from '../auth/auth.types';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    findAll(query: PaginationDto): Promise<import("../common/dto/response.dto").PaginatedResponseDto<import("./entities/skills.entity").Skill>>;
    findOne(id: string): Promise<import("./entities/skills.entity").Skill>;
    create(request: RequestWithUser, dto: CreateSkillDto): Promise<import("./entities/skills.entity").Skill>;
    update(request: RequestWithUser, id: string, dto: UpdateSkillDto): Promise<import("./entities/skills.entity").Skill>;
    remove(request: RequestWithUser, id: string): Promise<void>;
}
