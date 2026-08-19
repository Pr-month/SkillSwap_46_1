import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Текущий пароль (необходим для подтверждения)',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    minLength: 6,
    description: 'Новый пароль',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
