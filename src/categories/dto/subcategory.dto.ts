import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSubcategoryDto {
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @IsString({ message: 'Название категории должно быть строкой' })
  @MaxLength(255, {
    message: 'Максимальная длина названия подкатегории - 255 символов',
  })
  name!: string;

  @IsUUID(4, {
    message: 'Формат идентификатора категории не соответствует ожидаемому',
  })
  categoryId!: string;
}

export class UpdateSubcategoryDto extends PartialType(CreateSubcategoryDto) {}
