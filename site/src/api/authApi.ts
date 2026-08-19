import { USE_MOCKS } from "../config/apiConfig";
import { tokenService } from "../utils/tokenService.ts";
import type {
  IRegisterUserData,
  IUserProfile,
  TLoginUserData,
  TLoginUserResponse,
} from "../utils/types";
import { api, request } from "./client";

const MOCK_TOKEN = "mock_jwt_token";

// POST /auth/register
export const registerUser = async (
  data: IRegisterUserData,
): Promise<TLoginUserResponse> => {
  if (USE_MOCKS) {
    const mockUser: IUserProfile = {
      id: "mock-user-1",
      email: data.email,
      name: data.name,
      birthDate: data.birthDate,
      gender: data.gender,
      city: data.city,
      avatar: data.avatar,
      likesSkillsIds: [],
      userSkill: "",
      interestedSkillsSubcategoriesIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tokenService.set(MOCK_TOKEN);
    return {
      status: true,
      access_token: MOCK_TOKEN,
      user: mockUser,
    };
  }

  const resp = await request<TLoginUserResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  tokenService.set(resp.access_token);
  return resp;
};

// POST /auth/login
export const loginUser = async (
  data: TLoginUserData,
): Promise<TLoginUserResponse> => {
  if (USE_MOCKS) {
    const response = await fetch("/users.json").then((res) => res.json());
    const user = response.data.find(
      (u: IUserProfile) => u.email === data.email,
    );
    if (!user) return Promise.reject({ message: "Пользователь не найден" });
    tokenService.set(MOCK_TOKEN);
    return {
      status: true,
      access_token: MOCK_TOKEN,
      user,
    };
  }

  const resp = await request<TLoginUserResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  tokenService.set(resp.access_token);
  return resp;
};

// POST /auth/check-user
export const checkUser = async (data: TLoginUserData): Promise<void> => {
  const resp = await request<void>("/auth/check-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return resp;
};

// GET /auth/profile
export const getProfile = async (): Promise<IUserProfile> => {
  const token = tokenService.get();

  if (USE_MOCKS) {
    const response = await fetch("/users.json").then((res) => res.json());
    return response.data[0]; // в моках возвращаем первого юзера
  }

  const response = await request<{ data: IUserProfile }>("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// PATCH /auth/password
export const changePassword = async (
  newPassword: string,
): Promise<{ newPassword: string }> => {
  const token = tokenService.get();

  if (USE_MOCKS) {
    return { newPassword };
  }

  const resp = await api.patch<{ newPassword: string }>(
    "/auth/password",
    { newPassword: newPassword },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return resp;
};
