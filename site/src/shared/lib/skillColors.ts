import type { TId } from "../../utils/types";

const CATEGORY_COLORS: Record<string, string> = {
  "Бизнес и карьера": "var(--color-category-business)",
  "Творчество и искусство": "var(--color-category-creative)",
  "Иностранные языки": "var(--color-category-languages)",
  "Образование и развитие": "var(--color-category-education)",
  "Дом и уют": "var(--color-category-home)",
  "Здоровье и лайфстайл": "var(--color-category-health)",
  "Технологии и IT": "var(--color-category-it)",
};

const DEFAULT_LEARN_COLOR = "var(--color-category-health)";

type WithId = {
  id?: TId;
};

type WithCategoryName = WithId & {
  name: string;
};

type WithSkillCategoryId = WithId & {
  skillCategoryId?: TId;
};

type WithSkillSubcategory = WithId & {
  skillSubcategory?: TId | null;
};

export const getCategoryColorBySubcategoryId = <
  TSubCategory extends WithSkillCategoryId,
  TCategory extends WithCategoryName,
>(
  subcategoryId: TId | undefined,
  subCategories: ReadonlyArray<TSubCategory>,
  categories: ReadonlyArray<TCategory>,
): string | undefined => {
  if (!subcategoryId) {
    return undefined;
  }

  const subCategory = subCategories.find((item) => item.id === subcategoryId);

  if (!subCategory?.skillCategoryId) {
    return undefined;
  }

  const category = categories.find(
    (item) => item.id === subCategory.skillCategoryId,
  );

  if (!category) {
    return undefined;
  }

  return CATEGORY_COLORS[category.name];
};

export const getTeachColor = <
  TSkill extends WithSkillSubcategory,
  TSubCategory extends WithSkillCategoryId,
  TCategory extends WithCategoryName,
>(
  skillId: TId | undefined,
  skills: ReadonlyArray<TSkill>,
  subCategories: ReadonlyArray<TSubCategory>,
  categories: ReadonlyArray<TCategory>,
): string | undefined => {
  if (!skillId) {
    return undefined;
  }

  const skill = skills.find((item) => item.id === skillId);

  if (!skill?.skillSubcategory) {
    return undefined;
  }

  return getCategoryColorBySubcategoryId(
    skill.skillSubcategory,
    subCategories,
    categories,
  );
};

export const getLearnColors = <
  TSubCategory extends WithSkillCategoryId,
  TCategory extends WithCategoryName,
>(
  subcategoryIds: TId[],
  subCategories: ReadonlyArray<TSubCategory>,
  categories: ReadonlyArray<TCategory>,
): string[] =>
  subcategoryIds.map((subcategoryId) => {
    return (
      getCategoryColorBySubcategoryId(
        subcategoryId,
        subCategories,
        categories,
      ) ?? DEFAULT_LEARN_COLOR
    );
  });
