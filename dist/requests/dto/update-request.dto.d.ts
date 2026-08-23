import { RequestStatus } from '../enums/request-status.enum';
export declare class UpdateRequestDto {
    status: RequestStatus.ACCEPTED | RequestStatus.REJECTED;
}
