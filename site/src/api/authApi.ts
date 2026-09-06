import type {
  IRegisterUserData,
  IUserProfile,
  TLoginUserData,
  TLoginUserResponse,
} from "../utils/types";
import { api, request } from "./client";

// POST /auth/register
export const registerUser = async (
  data: IRegisterUserData,
): Promise<TLoginUserResponse> => {
  const resp = await request<TLoginUserResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return resp;
};

// POST /auth/login
export const loginUser = async (
  data: TLoginUserData,
): Promise<TLoginUserResponse> => {
  return await request<TLoginUserResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
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
  const response = await request<{ data: IUserProfile }>("/auth/profile");
  return response.data;
};

// PATCH /auth/password
export const changePassword = async (
  newPassword: string,
): Promise<{ newPassword: string }> => {
  const resp = await api.patch<{ newPassword: string }>(
    "/auth/password",
    { newPassword: newPassword },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return resp;
};

// POST /auth/logout
export const logoutUser = async (): Promise<void> => {
  await request<void>("/auth/logout", {
    method: "POST",
  });
};

// POST /auth/forgot-password
export const forgotPassword = async (email: string): Promise<void> => {
  await request<void>("/mail/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
};

// POST /auth/reset-password
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  await request<void>("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
};

// GET /mail/confirm-email
export const confirmEmail = async (token: string): Promise<void> => {
  await request<void>(`/mail/confirm-email?token=${token}`);
};
