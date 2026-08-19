import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import type { TId } from "./types";

//Интерфейс объектов, по которым можно искать.
export interface ISearchable {
  id: TId;
  title: string;
  description: string;
}

/**
 * Конфигурация Fuse.js
 * - weight — важность поля для поиска (1 важнее 0)
 * - threshold — чувствительность поиска
 * - minMatchCharLength — минимальная длина совпадения
 */
const FUSE_OPTIONS_TITLE: IFuseOptions<ISearchable> = {
  keys: [{ name: "title", weight: 1 }],
  threshold: 0.2,
  includeScore: true,
  minMatchCharLength: 3,
  ignoreLocation: true,
  distance: 0,
};

const FUSE_OPTIONS_DESCRIPTION: IFuseOptions<ISearchable> = {
  keys: [{ name: "description", weight: 1 }],
  threshold: 0.2,
  includeScore: true,
  minMatchCharLength: 3,
  ignoreLocation: true,
  distance: 0,
};

/**
 * Универсальная функция поиска
 * @param items — массив объектов с id, title и description
 * @param query — строка для поиска
 * @returns массив id объектов, которые совпали
 */
export function findMatchingIdsByTitle(
  items: ISearchable[],
  query: string,
): TId[] {
  if (!query.trim()) {
    // Если пустой запрос — вернуть все id
    return items.map((i) => i.id as TId);
  }

  const fuse = new Fuse(items, FUSE_OPTIONS_TITLE);

  return fuse.search(query).map((r) => r.item.id);
}

export function findMatchingIdsByDescription(
  items: ISearchable[],
  query: string,
): TId[] {
  if (!query.trim()) {
    // Если пустой запрос — вернуть все id
    return items.map((i) => i.id as TId);
  }

  const fuse = new Fuse(items, FUSE_OPTIONS_DESCRIPTION);

  return fuse.search(query).map((r) => r.item.id);
}
