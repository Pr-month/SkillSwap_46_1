import { USE_MOCKS } from "../config/apiConfig";
import type {
  TId,
  TModifySkillData,
  TSkillData,
  TSkillResponse,
  TSkillsResponse,
} from "../utils/types";
import { request } from "./client";
import { tokenService } from "../utils/tokenService.ts";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

//! ЗАПРПОСЫ БЕЗ АВТОРИЗАЦИИ

/** API: ПОЛУЧЕНИЕ ВСЕХ НАВЫКОВ */
export const getSkills = (): Promise<TSkillsResponse> => {
  if (USE_MOCKS) {
    return fetch("/skills.json")
      .then((res) => res.json())
      .then((response) => response);
  }

  return request<TSkillsResponse>("/skills").then(
    (response: TSkillsResponse) => response,
  );
};

/** API: ПОЛУЧЕНИЕ НАВЫКА ПО ЕГО ID */
export const getSkillById = (skillId: TId): Promise<TSkillResponse> => {
  if (USE_MOCKS) {
    return fetch("/skills.json")
      .then((res) => res.json())
      .then((response) => response.data[0]);
  }

  return request<TSkillResponse>(`/skills/${skillId}`).then(
    (response: TSkillResponse) => response,
  );
};

//! ЗАПРПОСЫ С АВТОРИЗАЦИЕЙ

/** API: ДОБАВЛЕНИЕ НАВЫКА */
export const addSkill = (skill: TSkillData): Promise<TSkillResponse> => {
  if (USE_MOCKS) {
    return Promise.resolve({
      status: true,
      data: {
        ...skill,
        id: Date.now().toString(),
        userId: "mock-user-id",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  return request<ApiResponse<TSkillResponse["data"]>>("/skills", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${tokenService.get()}`,
    } as HeadersInit,
    body: JSON.stringify(skill),
  }).then((response: TSkillResponse) => response);
};

/** API: УДАЛЕНИЕ НАВЫКА ПО ЕГО ID */
// export const deleteSkillById = async (
//   skillId: TId,
// ): Promise<{ status: boolean }> => {
//   if (USE_MOCKS) return { status: true };
//
//   // Обработка DELETE с 204 ответом (без body)
//   const response = await fetch(`/api/skills/${skillId}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       authorization: `Bearer ${tokenService.get()}`,
//     } as HeadersInit,
//   });
//
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}));
//     return Promise.reject(error);
//   }
//
//   return { status: true }; // успешное удаление (без body)
// };
export const deleteSkillById = async (
  skillId: TId,
): Promise<{ status: boolean }> => {
  if (USE_MOCKS) return { status: true };

  await request<void>(`/skills/${skillId}`, {
    method: "DELETE",
  });

  return { status: true };
};

/** API: МОДИФИКАЦИЯ НАВЫКА */
export const modifySkill = (
  skill: TModifySkillData,
): Promise<TSkillResponse> => {
  if (USE_MOCKS) {
    return fetch("/skills.json")
      .then((res) => res.json())
      .then((response) => response.data[0]);
  }

  const { id, ...skillData } = skill;

  // Если id навыка не указан
  if (!id) {
    console.error("Ошибка модификации навыка: отсутствует id навыка");
    return Promise.reject();
  }

  return request<ApiResponse<TSkillResponse["data"]>>(`/skills/${skill.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${tokenService.get()}`,
    } as HeadersInit,
    body: JSON.stringify(skillData),
  }).then((response: TSkillResponse) => response);
};
