import { DataSource, Repository } from 'typeorm';
import { Skill } from '../skills/entities/skills.entity';
import { User } from '../users/entities/user.entity';
import { CreateRequestDto, UpdateRequestDto } from './dto';
import { Request } from './entities/request.entity';
export declare class RequestsService {
    private readonly requestsRepository;
    private readonly skillsRepository;
    private readonly usersRepository;
    private readonly dataSource;
    constructor(requestsRepository: Repository<Request>, skillsRepository: Repository<Skill>, usersRepository: Repository<User>, dataSource: DataSource);
    create(senderId: string, dto: CreateRequestDto): Promise<Request>;
    findIncoming(userId: string): Promise<Request[]>;
    findOutgoing(userId: string): Promise<Request[]>;
    update(id: string, receiverId: string, dto: UpdateRequestDto): Promise<Request>;
    remove(id: string, userId: string): Promise<void>;
    private findOne;
    private findSkill;
}
