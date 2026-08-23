import { USE_MOCKS } from "../config/apiConfig";
import { request } from "./client";
import type { ICity } from "../utils/types";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

export const POPULAR_CITIES_LIMIT = 20;

export const getPopularCities = (
  limit: number = POPULAR_CITIES_LIMIT,
): Promise<ICity[]> => {
  if (USE_MOCKS) {
    return fetch("/cities.json")
      .then((res) => res.json())
      .then((response) => response.data.slice(0, limit));
  }

  return request<ApiResponse<ICity[]>>(`/cities/popular?limit=${limit}`).then(
    (response) => response.data,
  );
};
