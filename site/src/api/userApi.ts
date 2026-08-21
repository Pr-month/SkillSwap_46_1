import { USE_MOCKS } from "../config/apiConfig";
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

const appendArrayParams = (
  query: URLSearchParams,
  key: string,
  values?: string[],
): void => {
  (values ?? []).forEach((value) => {
    if (value) {
      query.append(key, value);
    }
  });
};

// GET /users?page=...&limit=...&search=...&gender=...&cities=...&subCategoryIds=...&skillOption=...
export const getUsers = ({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  search,
  gender,
  cities,
  subCategoryIds,
  skillOption,
}: GetUsersParams = {}): Promise<PaginatedUsersResponse> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search?.trim()) {
    query.set("search", search.trim());
  }

  if (gender && gender !== "all") {
    query.set("gender", gender);
  }

  appendArrayParams(query, "cities", cities);
  appendArrayParams(query, "subCategoryIds", subCategoryIds);

  if (skillOption && skillOption !== "all") {
    query.set("skillOption", skillOption);
  }

  if (USE_MOCKS) {
    return fetch("/users.json")
      .then((res) => res.json())
      .then((response) => {
        const all: IUserProfile[] = response.data ?? [];
        const start = (page - 1) * limit;
        return {
          data: all.slice(start, start + limit),
          page,
          totalPages: Math.max(1, Math.ceil(all.length / limit)),
        };
      });
  }

  return request<ApiResponse<PaginatedUsersResponse>>(
    `/users?${query.toString()}`,
  ).then((response: { status: boolean; data: PaginatedUsersResponse }) => {
    return response.data;
  });
};

// GET /users/:id
export const getUserById = (id: TId): Promise<IUserProfile> => {
  if (USE_MOCKS) {
    return fetch("/users.json")
      .then((res) => res.json())
      .then((response) => {
        const user = response.data.find((u: IUserProfile) => u.id === id);
        if (!user) return Promise.reject({ message: "User not found" });
        return user;
      });
  }
  return request<ApiResponse<IUserProfile>>(`/users/${id}`).then(
    (response: { status: boolean; data: IUserProfile }) => response.data,
  );
};

// PATCH /users/:id (требует токен)
export const updateUser = (
  id: string,
  payload: Partial<IUserProfile>,
  token: string,
): Promise<IUserProfile> => {
  if (USE_MOCKS) {
    return fetch("/users.json")
      .then((res) => res.json())
      .then((response) => {
        const user = response.data.find((u: IUserProfile) => u.id === id);
        if (!user) return Promise.reject({ message: "User not found" });
        // Эмулируем обновление — мержим payload поверх найденного юзера
        return { ...user, ...payload, updatedAt: new Date().toISOString() };
      });
  }
  return request<ApiResponse<IUserProfile>>(`/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).then((response: { status: boolean; data: IUserProfile }) => response.data);
};

// DELETE /users/:id (требует токен)
export const deleteUser = (id: TId, token: string): Promise<void> => {
  if (USE_MOCKS) {
    return fetch("/users.json")
      .then((res) => res.json())
      .then((response) => {
        const exists = response.data.some((u: IUserProfile) => u.id === id);
        if (!exists) return Promise.reject({ message: "User not found" });
        // В моках просто эмулируем успех
        return;
      });
  }
  return request<void>(`/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
