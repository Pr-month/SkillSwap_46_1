import type { ISkillsSubcategory } from "../../utils/types.ts";

export const getSubcategoryNames = (
  ids: string[],
  subCategories: ISkillsSubcategory[],
): string[] =>
  ids.map((id) => subCategories.find((s) => s.id === id)?.name ?? id);
