import { RequestWithUser } from '../auth/auth.types';
import { FavoriteCheckDto, FavoriteDto } from './dto/favorite-response.dto';
import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    add(req: RequestWithUser, id: string): Promise<FavoriteDto>;
    remove(req: RequestWithUser, id: string): Promise<void>;
}
export declare class MyFavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    findAll(req: RequestWithUser): Promise<FavoriteDto[]>;
    check(req: RequestWithUser, id: string): Promise<FavoriteCheckDto>;
}
