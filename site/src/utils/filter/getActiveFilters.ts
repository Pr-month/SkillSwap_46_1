import type { FilterState } from "../../services/filter/slice.ts";
import type { ISkillsCategory } from "../types.ts";

export type ActiveFilterItem = {
  id: string;
  label: string;
  type: "skillOption" | "gender" | "subCategory" | "city";
};

interface GetActiveFiltersParams {
  filterState: FilterState;
  categories: ISkillsCategory[];
  skillOptions: { value: string; label: string }[];
  genderOptions: { value: string; label: string }[];
  cityLabels: Record<string, string>;
}

export const getActiveFilters = ({
  filterState,
  categories,
  skillOptions,
  genderOptions,
  cityLabels,
}: GetActiveFiltersParams): ActiveFilterItem[] => {
  const filters: ActiveFilterItem[] = [];

  if (filterState.skillOption && filterState.skillOption !== "all") {
    filters.push({
      id: "skillOption",
      label:
        skillOptions.find((opt) => opt.value === filterState.skillOption)
          ?.label ?? filterState.skillOption,
      type: "skillOption",
    });
  }

  if (filterState.gender && filterState.gender !== "all") {
    filters.push({
      id: "gender",
      label:
        genderOptions.find((opt) => opt.value === filterState.gender)?.label ??
        filterState.gender,
      type: "gender",
    });
  }

  filterState.cities.forEach((cityId) => {
    filters.push({
      id: cityId,
      label: cityLabels[cityId] ?? cityId,
      type: "city",
    });
  });

  filterState.subCategoryIds.forEach((skillId) => {
    const subcategory = categories
      .flatMap((cat) => cat.subcategories)
      .find((sub) => sub.id === skillId);

    filters.push({
      id: skillId,
      label: subcategory?.name ?? `Навык ${skillId}`,
      type: "subCategory",
    });
  });

  return filters;
};
