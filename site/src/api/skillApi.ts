import type {
  ISkill,
  TId,
  TModifySkillData,
  TSkillData,
  TSkillResponse,
} from "../utils/types";
import { request } from "./client";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

/** Сырая сущность навыка, возвращаемая бэкендом (до нормализации). */
interface ApiSkill {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  subcategoryId?: string | null;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Вложенная структура данных GET /skills (PaginatedResponseDto). */
interface PaginatedSkillsApiData {
  data: ApiSkill[];
  page: number;
  totalPages: number;
}

/** Ответ GET /skills после разворачивания вложенного `data` (аналог userApi). */
export interface PaginatedSkillsResponse {
  data: ISkill[];
  page: number;
  totalPages: number;
}

/** Приводим бэкенд-сущность Skill к фронтовому типу ISkill. */
const normalizeSkill = (skill: ApiSkill): ISkill => ({
  id: skill.id,
  title: skill.title,
  description: skill.description,
  skillSubcategory: skill.subcategoryId ?? "",
  images: skill.images ?? [],
  userId: skill.ownerId ?? "",
  createdAt: skill.createdAt,
  updatedAt: skill.updatedAt,
});

//! ЗАПРПОСЫ БЕЗ АВТОРИЗАЦИИ

/** API: ПОЛУЧЕНИЕ ВСЕХ НАВЫКОВ */
export const getSkills = (): Promise<PaginatedSkillsResponse> => {
  return request<ApiResponse<PaginatedSkillsApiData>>("/skills").then(
    (response) => ({
      page: response.data.page,
      totalPages: response.data.totalPages,
      data: response.data.data.map(normalizeSkill),
    }),
  );
};

/** API: ПОЛУЧЕНИЕ НАВЫКА ПО ЕГО ID */
export const getSkillById = (skillId: TId): Promise<TSkillResponse> => {
  return request<TSkillResponse>(`/skills/${skillId}`).then(
    (response: TSkillResponse) => response,
  );
};

//! ЗАПРПОСЫ С АВТОРИЗАЦИЕЙ

/** API: ДОБАВЛЕНИЕ НАВЫКА */
export const addSkill = (skill: TSkillData): Promise<TSkillResponse> => {
  return request<ApiResponse<TSkillResponse["data"]>>("/skills", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    } as HeadersInit,
    body: JSON.stringify(skill),
  }).then((response: TSkillResponse) => response);
};
export const deleteSkillById = async (
  skillId: TId,
): Promise<{ status: boolean }> => {
  await request<void>(`/skills/${skillId}`, {
    method: "DELETE",
  });

  return { status: true };
};

/** API: МОДИФИКАЦИЯ НАВЫКА */
export const modifySkill = (
  skill: TModifySkillData,
): Promise<TSkillResponse> => {
  const { id, ...skillData } = skill;

  if (!id) {
    console.error("Ошибка модификации навыка: отсутствует id навыка");
    return Promise.reject();
  }

  return request<ApiResponse<TSkillResponse["data"]>>(`/skills/${skill.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    } as HeadersInit,
    body: JSON.stringify(skillData),
  }).then((response: TSkillResponse) => response);
};
