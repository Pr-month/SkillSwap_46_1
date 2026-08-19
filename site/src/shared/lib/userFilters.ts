import type { IUserProfile, ISkill } from "../../utils/types";
import type {
  TGenderOption,
  TSkillOption,
} from "../../widgets/filter-bar/radio-groups/types";

export const matchesGender = (
  user: IUserProfile,
  gender: TGenderOption,
): boolean => gender === "all" || user.gender === gender;

export const matchesCity = (user: IUserProfile, cities: string[]): boolean =>
  cities.length === 0 || cities.includes(user.city);

export const matchesSkill = (
  user: IUserProfile,
  subCategoryIds: string[],
  skillOption: TSkillOption,
  skills: ISkill[],
): boolean => {
  if (subCategoryIds.length === 0) return true;

  const userSkillSubcategory = skills.find(
    (s) => s.id === user.userSkill,
  )?.skillSubcategory;

  if (skillOption === "can-teach")
    return (
      !!userSkillSubcategory && subCategoryIds.includes(userSkillSubcategory)
    );

  if (skillOption === "want-to-learn")
    return user.interestedSkillsSubcategoriesIds.some((id) =>
      subCategoryIds.includes(id),
    );

  // 'all'
  const canTeach =
    !!userSkillSubcategory && subCategoryIds.includes(userSkillSubcategory);
  const wantsToLearn = user.interestedSkillsSubcategoriesIds.some((id) =>
    subCategoryIds.includes(id),
  );
  return canTeach || wantsToLearn;
};
