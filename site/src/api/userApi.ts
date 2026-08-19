import { USE_MOCKS } from "../config/apiConfig";
import { request } from "./client";
import type { IUserProfile } from "../utils/types";
import type { TId } from "../utils/types";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

// GET /users
export const getUsers = (): Promise<IUserProfile[]> => {
  if (USE_MOCKS) {
    return fetch("/users.json")
      .then((res) => res.json())
      .then((response) => response.data);
  }
  return request<ApiResponse<IUserProfile[]>>("/users").then(
    (response: { status: boolean; data: IUserProfile[] }) => response.data,
  );
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
