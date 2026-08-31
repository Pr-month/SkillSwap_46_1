import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchCityQueryDto {
  @IsNotEmpty({ message: 'Поисковый запрос не может быть пустым' })
  @IsString({ message: 'Поисковый запрос должен быть строкой' })
  @MaxLength(255, {
    message: 'Максимальная длина поискового запроса - 255 символов',
  })
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
