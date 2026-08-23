import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';

export const USER_SKILL_OPTIONS = ['all', 'want-to-learn', 'can-teach'] as const;
export type UserSkillOption = (typeof USER_SKILL_OPTIONS)[number];

/**
 * Нормализует query-параметр-массив к массиву строк.
 *
 * `cities` и `subCategoryIds` — это значения МУЛЬТИВЫБОРА в фильтре
 * (можно выбрать сразу несколько городов/подкатегорий), поэтому на бэкенд
 * они приходят массивом. Пользователь сам по себе имеет один город —
 * массив означает список выбранных значений фильтра, а не несколько городов
 * у одного профиля.
 *
 * Поддерживаются два формата передачи массива:
 *  - повторение параметра: ?cities=Москва&cities=Казань
 *  - CSV: ?cities=Москва,Казань
 */
const toOptionalStringArray = ({
  value,
}: {
  value: unknown;
}): string[] | undefined => {
  if (value === undefined || value === null) return undefined;

  const items = Array.isArray(value) ? value : [value];

  return items
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

/**
 * Query-параметры для `GET /api/users`.
 * Наследует пагинацию (`page`, `limit`, `search`) от `PaginationDto`
 * и добавляет фильтры пользователей.
 */
export class UsersQueryDto extends PaginationDto {
  /** Пол: `male` | `female` | `other` (регистронезависимо). `all`/пусто — без фильтра. */
  @IsOptional()
  @IsString()
  gender?: string;

  /** Список названий городов, выбранных в фильтре (мультивыбор). */
  @IsOptional()
  @Transform(toOptionalStringArray)
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  /** Список id подкатегорий, выбранных в фильтре (мультивыбор). */
  @IsOptional()
  @Transform(toOptionalStringArray)
  @IsArray()
  @IsString({ each: true })
  subCategoryIds?: string[];

  /** Направление фильтра навыка: `all` | `want-to-learn` | `can-teach`. */
  @IsOptional()
  @IsIn(USER_SKILL_OPTIONS)
  skillOption?: UserSkillOption;
}
