import type {
  FavoriteCheckResult,
  FavoriteDto,
  TId,
} from "../utils/types";
import { request } from "./client";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

// POST /skills/:skillId/favorite
export const addFavorite = (skillId: TId): Promise<FavoriteDto> => {
  return request<ApiResponse<FavoriteDto>>(`/skills/${skillId}/favorite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then((response) => response.data);
};

// DELETE /skills/:skillId/favorite
export const removeFavorite = (skillId: TId): Promise<void> => {
  return request<void>(`/skills/${skillId}/favorite`, {
    method: "DELETE",
  });
};

// GET /favorites
export const getFavorites = (): Promise<FavoriteDto[]> => {
  return request<ApiResponse<FavoriteDto[]>>("/favorites").then(
    (response) => response.data,
  );
};

// GET /favorites/:skillId/check
export const checkFavorite = (
  skillId: TId,
): Promise<FavoriteCheckResult> => {
  return request<ApiResponse<FavoriteCheckResult>>(
    `/favorites/${skillId}/check`,
  ).then((response) => response.data);
};
