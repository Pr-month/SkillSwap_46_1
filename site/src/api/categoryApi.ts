import { USE_MOCKS } from "../config/apiConfig";
import { request } from "./client";
import type { TId, ISkillsCategory, ISkillsSubcategory } from "../utils/types";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

export const getCategories = (): Promise<ISkillsCategory[]> => {
  if (USE_MOCKS) {
    return fetch("/categories.json")
      .then((res) => res.json())
      .then((response) => response.data);
  }

  return request<ApiResponse<ISkillsCategory[]>>("/categories").then(
    (response: { status: boolean; data: ISkillsCategory[] }) => response.data,
  );
};

export const getSubCategories = (): Promise<ISkillsSubcategory[]> => {
  if (USE_MOCKS) {
    return fetch("/subcategories.json")
      .then((res) => res.json())
      .then((response) => response.data);
  }

  return request<ApiResponse<ISkillsCategory[]>>("/categories").then(
    (response: { status: boolean; data: ISkillsCategory[] }) =>
      response.data.flatMap((category) => category.subcategories),
  );
};

export const getCategoryById = (id: TId): Promise<ISkillsCategory> => {
  if (USE_MOCKS) {
    return fetch("/categories.json")
      .then((res) => res.json())
      .then(
        (response) =>
          response.data.find(
            (category: ISkillsCategory) => category.id === id,
          )!,
      );
  }

  return request<ApiResponse<ISkillsCategory>>(`/categories/${id}`).then(
    (response: { status: boolean; data: ISkillsCategory }) => response.data,
  );
};
