import { request } from "./client";
import type { ICity } from "../utils/types";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

/** Сколько городов показывать в списке популярных */
export const POPULAR_CITIES_LIMIT = 20;

/** API: ПОЛУЧЕНИЕ САМЫХ ПОПУЛЯРНЫХ ГОРОДОВ (ПО НАСЕЛЕНИЮ) */
export const getPopularCities = (
  limit: number = POPULAR_CITIES_LIMIT,
): Promise<ICity[]> => {
  return request<ApiResponse<ICity[]>>(`/cities/popular?limit=${limit}`).then(
    (response) => response.data,
  );
};

/** API: ПОИСК ГОРОДОВ ПО НАЗВАНИЮ (триграммный поиск на бэкенде) */
export const searchCities = (
  query: string,
  limit: number = POPULAR_CITIES_LIMIT,
): Promise<ICity[]> => {
  return request<ApiResponse<ICity[]>>(
    `/cities/search?query=${encodeURIComponent(query)}&limit=${limit}`,
  ).then((response) => response.data);
};
