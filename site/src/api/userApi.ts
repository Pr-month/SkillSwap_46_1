import { request } from "./client";
import type { IUserProfile } from "../utils/types";
import type { TId } from "../utils/types";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

export interface PaginatedUsersResponse {
  data: IUserProfile[];
  page: number;
  totalPages: number;
}

export type UserGenderFilter = "male" | "female" | "other";
export type UserSkillOptionFilter = "all" | "can-teach" | "want-to-learn";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: UserGenderFilter | "all";
  cities?: string[];
  subCategoryIds?: string[];
  skillOption?: UserSkillOptionFilter;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

// POST /users/search
export const getUsers = ({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  search,
  gender,
  cities,
  subCategoryIds,
  skillOption,
}: GetUsersParams = {}): Promise<PaginatedUsersResponse> => {
  const body: GetUsersParams = {
    page,
    limit,
  };

  if (search?.trim()) {
    body.search = search.trim();
  }

  if (gender && gender !== "all") {
    body.gender = gender;
  }

  const filteredCities = (cities ?? []).filter(Boolean);
  if (filteredCities.length) {
    body.cities = filteredCities;
  }

  const filteredSubCategoryIds = (subCategoryIds ?? []).filter(Boolean);
  if (filteredSubCategoryIds.length) {
    body.subCategoryIds = filteredSubCategoryIds;
  }

  if (skillOption && skillOption !== "all") {
    body.skillOption = skillOption;
  }

  return request<ApiResponse<PaginatedUsersResponse>>("/users/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((response: { status: boolean; data: PaginatedUsersResponse }) => {
    return response.data;
  });
};

// GET /users/:id
export const getUserById = (id: TId): Promise<IUserProfile> => {
  return request<ApiResponse<IUserProfile>>(`/users/${id}`).then(
    (response: { status: boolean; data: IUserProfile }) => response.data,
  );
};

// PATCH /users/:id
export const updateUser = (
  id: string,
  payload: Partial<IUserProfile>,
): Promise<IUserProfile> => {
  return request<ApiResponse<IUserProfile>>(`/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((response: { status: boolean; data: IUserProfile }) => response.data);
};

// DELETE /users/:id
export const deleteUser = (id: TId): Promise<void> => {
  return request<void>(`/users/${id}`, {
    method: "DELETE",
  });
};

// POST /mail/send-confirmation
export const sendConfirmationEmail = async (): Promise<void> => {
  await request<void>("/mail/send-confirmation", {
    method: "POST",
  });
};
