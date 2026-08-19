import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { RequestStatus } from '../enums/request-status.enum';

export class UpdateRequestDto {
  @ApiProperty({
    enum: [RequestStatus.ACCEPTED, RequestStatus.REJECTED],
  })
  @IsIn([RequestStatus.ACCEPTED, RequestStatus.REJECTED])
  status: RequestStatus.ACCEPTED | RequestStatus.REJECTED;
}
