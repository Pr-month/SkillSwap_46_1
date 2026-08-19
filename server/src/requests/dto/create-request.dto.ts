import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({ format: 'uuid', description: 'Предлагаемый навык' })
  @IsUUID()
  offeredSkillId: string;

  @ApiProperty({ format: 'uuid', description: 'Запрашиваемый навык' })
  @IsUUID()
  requestedSkillId: string;
}
