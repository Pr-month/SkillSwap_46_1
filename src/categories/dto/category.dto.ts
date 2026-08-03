import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @IsString({ message: 'Название категории должно быть строкой' })
  @MaxLength(255, {
    message: 'Максимальная длина названия категории - 255 символов',
  })
  name!: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
