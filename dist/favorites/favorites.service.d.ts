import { Repository } from 'typeorm';
import { Favorite } from '../skills/entities/favorite.entity';
import { Skill } from '../skills/entities/skills.entity';
import { FavoriteCheckDto, FavoriteDto } from './dto/favorite-response.dto';
export declare class FavoritesService {
    private readonly favoriteRepository;
    private readonly skillRepository;
    private readonly skillRelations;
    constructor(favoriteRepository: Repository<Favorite>, skillRepository: Repository<Skill>);
    add(userId: string, skillId: string): Promise<FavoriteDto>;
    remove(userId: string, skillId: string): Promise<void>;
    findAll(userId: string): Promise<FavoriteDto[]>;
    check(userId: string, skillId: string): Promise<FavoriteCheckDto>;
    private toDto;
}
