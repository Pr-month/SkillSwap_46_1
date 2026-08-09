import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserGender, UserRole } from '../enums/user.enums';

export class UserProfileResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name: string;

  @ApiProperty({ type: String, format: 'date' })
  birthDate: Date;

  @ApiProperty({ enum: UserGender })
  gender: UserGender;

  @ApiProperty({ example: 'Москва' })
  city: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiPropertyOptional({ nullable: true })
  about: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
