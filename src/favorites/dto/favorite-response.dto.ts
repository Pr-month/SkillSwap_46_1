import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteSkillOwnerDto {
  @ApiProperty({
    example: 'b3f1c2b0-4a2e-4c3f-9b7a-1e2d3c4b5a6f',
    description: 'ID автора навыка',
  })
  id!: string;

  @ApiProperty({
    example: 'Иван Петров',
    description: 'Имя автора навыка',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара автора навыка',
    nullable: true,
  })
  avatar?: string | null;
}

export class FavoriteSkillDto {
  @ApiProperty({
    example: 'e8f0a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
    description: 'ID навыка',
  })
  id!: string;

  @ApiProperty({
    example: 'Мастер-класс по игре на гитаре',
    description: 'Название навыка',
  })
  title!: string;

  @ApiProperty({
    example: 'Научу играть на гитаре с нуля за 5 занятий',
    description: 'Описание навыка',
  })
  description!: string;

  @ApiProperty({
    type: [String],
    example: ['https://example.com/skill-image-1.jpg'],
    description: 'Изображения навыка',
  })
  images!: string[];

  @ApiProperty({
    example: 'Творчество и искусство',
    description: 'Название категории',
  })
  category!: string;

  @ApiPropertyOptional({
    example: 'Игра на гитаре',
    description: 'Название подкатегории',
  })
  subcategory?: string;

  @ApiPropertyOptional({
    type: () => FavoriteSkillOwnerDto,
    description: 'Автор навыка',
  })
  owner?: FavoriteSkillOwnerDto;
}

export class FavoriteDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    description: 'ID записи избранного',
  })
  id!: string;

  @ApiProperty({
    example: 'b3f1c2b0-4a2e-4c3f-9b7a-1e2d3c4b5a6f',
    description: 'ID пользователя',
  })
  userId!: string;

  @ApiProperty({
    example: 'e8f0a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
    description: 'ID навыка',
  })
  skillId!: string;

  @ApiProperty({
    example: '2026-01-01T12:00:00.000Z',
    description: 'Дата добавления навыка в избранное',
  })
  createdAt!: string;

  @ApiPropertyOptional({
    type: () => FavoriteSkillDto,
    description: 'Детальная информация о навыке',
  })
  skill?: FavoriteSkillDto;
}

export class FavoriteCheckDto {
  @ApiProperty({
    example: true,
    description: 'Находится ли навык в избранном у текущего пользователя',
  })
  isFavorite!: boolean;
}
