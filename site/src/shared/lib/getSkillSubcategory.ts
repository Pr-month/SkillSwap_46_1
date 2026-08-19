import type { ISkill, ISkillsSubcategory } from "../../utils/types.ts";

export const getSkillSubcategory = (
  skillId: string,
  skills: ISkill[],
  subCategories: ISkillsSubcategory[],
): string => {
  const skill = skills.find((skill) => skill.id === skillId);
  if (!skill) return skillId;
  const subCategory = subCategories.find(
    (s) => s.id === skill.skillSubcategory,
  );
  return subCategory?.name ?? skill.skillSubcategory;
};
