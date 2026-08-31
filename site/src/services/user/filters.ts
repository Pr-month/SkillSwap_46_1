import type { GetUsersParams } from "../../api/userApi";
import type {
  TGenderOption,
  TSkillOption,
} from "../../widgets/filter-bar/radio-groups/types";

export interface UserFilterInput {
  skillOption: TSkillOption;
  gender: TGenderOption;
  subCategoryIds: string[];
  cities: string[];
  searchQuery: string;
}

/**
 * Приводит состояние фильтра к параметрам запроса `GET /users`.
 * `all`/пустые значения отбрасываются, чтобы бэкенд не применял фильтр.
 */
export const buildUsersFilterParams = (
  filter: UserFilterInput,
): Omit<GetUsersParams, "page" | "limit"> => ({
  search: filter.searchQuery,
  gender: filter.gender === "all" ? undefined : filter.gender,
  cities: filter.cities,
  subCategoryIds: filter.subCategoryIds,
  skillOption: filter.skillOption === "all" ? undefined : filter.skillOption,
});
