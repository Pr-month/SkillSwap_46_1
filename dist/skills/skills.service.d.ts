import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/response.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skills.entity';
export declare class SkillsService {
    private readonly skillsRepository;
    private readonly categoriesRepository;
    private readonly subcategoriesRepository;
    constructor(skillsRepository: Repository<Skill>, categoriesRepository: Repository<Category>, subcategoriesRepository: Repository<Subcategory>);
    create(ownerId: string, dto: CreateSkillDto): Promise<Skill>;
    findAll(query: PaginationDto): Promise<PaginatedResponseDto<Skill>>;
    findOne(id: string): Promise<Skill>;
    update(id: string, ownerId: string, dto: UpdateSkillDto): Promise<Skill>;
    remove(id: string, ownerId: string): Promise<void>;
    private assertOwner;
    private validateCategory;
    private readonly publicOwnerColumns;
}
