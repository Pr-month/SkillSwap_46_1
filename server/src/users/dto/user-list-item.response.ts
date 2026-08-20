import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserGender } from '../enums/user.enums';

/**
 * Элемент списка пользователей для GET /api/users.
 * Соответствует контракту `IUserProfile` на фронтенде.
 */
export class UserListItemResponse {
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

  @ApiPropertyOptional({ example: 'Москва', nullable: true })
  city: string | null;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiPropertyOptional({ nullable: true })
  aboutMe: string | null;

  @ApiProperty({ type: [String], isArray: true })
  likesSkillsIds: string[];

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  userSkill: string | null;

  @ApiProperty({ type: [String], isArray: true })
  interestedSkillsSubcategoriesIds: string[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
