import { RequestWithUser } from '../auth/auth.types';
import { CreateRequestDto, UpdateRequestDto } from './dto';
import { RequestsService } from './requests.service';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    create(request: RequestWithUser, dto: CreateRequestDto): Promise<import("./entities/request.entity").Request>;
    findIncoming(request: RequestWithUser): Promise<import("./entities/request.entity").Request[]>;
    findOutgoing(request: RequestWithUser): Promise<import("./entities/request.entity").Request[]>;
    update(request: RequestWithUser, id: string, dto: UpdateRequestDto): Promise<import("./entities/request.entity").Request>;
    remove(request: RequestWithUser, id: string): Promise<void>;
}
