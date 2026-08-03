import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserGender } from '../enums/user.enums';

export class UserProfileResponse {
  @ApiProperty({ example: 'user-id' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Иван Петров' })
  name!: string;

  @ApiProperty({ example: '1990-01-01' })
  birthdate!: string;

  @ApiProperty({ enum: UserGender, example: 'MALE' })
  gender!: UserGender;

  @ApiProperty({ example: 'Москва' })
  city!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar!: string;

  @ApiPropertyOptional({ example: 'О себе...' })
  about?: string;
}
