import { request } from "./client";
import type { TId, ISkillsCategory, ISkillsSubcategory } from "../utils/types";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

type ApiSubcategory = Omit<ISkillsSubcategory, "skillCategoryId"> & {
  categoryId: TId;
};

const normalizeSubcategory = (
  subcategory: ApiSubcategory,
): ISkillsSubcategory => ({
  id: subcategory.id,
  name: subcategory.name,
  skillCategoryId: subcategory.categoryId,
});

const normalizeCategory = (category: ISkillsCategory): ISkillsCategory => ({
  ...category,
  subcategories: category.subcategories.map((subcategory) =>
    normalizeSubcategory(subcategory as ApiSubcategory),
  ),
});

export const getCategories = (): Promise<ISkillsCategory[]> => {
  return request<ApiResponse<ISkillsCategory[]>>("/categories").then(
    (response) => response.data.map(normalizeCategory),
  );
};

export const getSubCategories = (): Promise<ISkillsSubcategory[]> => {
  return request<
    ApiResponse<
      {
        id: TId;
        name: string;
        categoryId: TId;
      }[]
    >
  >("/subcategories").then((response) =>
    response.data.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      skillCategoryId: subcategory.categoryId,
    })),
  );
};

export const getCategoryById = (id: TId): Promise<ISkillsCategory> => {
  return request<ApiResponse<ISkillsCategory[]>>("/categories").then(
    (response) => {
      const category = response.data.find((category) => category.id === id);

      if (!category) {
        throw new Error(`Category with id ${id} not found`);
      }

      return normalizeCategory(category);
    },
  );
};
