import { request } from "./client";
import type { TId, ISkillsCategory, ISkillsSubcategory } from "../utils/types";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

type ApiSubcategory = {
  id: TId;
  name: string;
  categoryId: TId;
};

type ApiCategory = {
  id: TId;
  name: string;
  subcategories: ApiSubcategory[];
};

const normalizeSubcategory = (
  subcategory: ApiSubcategory,
): ISkillsSubcategory => ({
  id: subcategory.id,
  name: subcategory.name,
  skillCategoryId: subcategory.categoryId,
});

const normalizeCategory = (category: ApiCategory): ISkillsCategory => ({
  id: category.id,
  name: category.name,
  subcategories: category.subcategories.map(normalizeSubcategory),
});

export const getCategories = (): Promise<ISkillsCategory[]> => {
  return request<ApiResponse<ApiCategory[]>>("/categories").then((response) =>
    response.data.map(normalizeCategory),
  );
};

export const getSubCategories = (): Promise<ISkillsSubcategory[]> => {
  return request<ApiResponse<ApiSubcategory[]>>("/subcategories").then(
    (response) =>
      response.data.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        skillCategoryId: subcategory.categoryId,
      })),
  );
};

export const getCategoryById = (id: TId): Promise<ISkillsCategory> => {
  return request<ApiResponse<ApiCategory[]>>("/categories").then((response) => {
    const category = response.data.find((category) => category.id === id);

    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }

    return normalizeCategory(category);
  });
};
