import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  changePassword,
  checkUser,
  forgotPassword,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../../api/authApi.ts";
import { updateUser } from "../../api/userApi.ts";
import type {
  IRegisterUserData,
  TLoginUserData,
  TUpdateUserData,
} from "../../utils/types.ts";
import type { AuthState } from "./types.ts";

export const fetchRegister = createAsyncThunk(
  "auth/register",
  async (data: IRegisterUserData, { rejectWithValue }) => {
    try {
      return await registerUser(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchLogin = createAsyncThunk(
  "auth/login",
  async (data: TLoginUserData, { rejectWithValue }) => {
    try {
      return await loginUser(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchCheckUser = createAsyncThunk(
  "auth/check-user",
  async (data: TLoginUserData, { rejectWithValue }) => {
    try {
      return await checkUser(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      return await getProfile();
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "statusCode" in err &&
        err.statusCode === 401
      ) {
        return null;
      }
      return rejectWithValue(err);
    }
  },
);

export const fetchUpdateCurrentUser = createAsyncThunk(
  "auth/updateCurrentUser",
  async (payload: Partial<TUpdateUserData>, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const { currentUser } = state.auth;

    if (!currentUser?.id) return rejectWithValue("Не найден id пользователя");

    try {
      return await updateUser(currentUser.id, payload);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

/** ОБНОВЛЕНИЕ ПАРОЛЯ ПОЛЬЗОВАТЕЛЯ */
export const updatePassword = createAsyncThunk(
  "auth/update-password",
  async (newPassword: string, { rejectWithValue }) => {
    try {
      await changePassword(newPassword);
      return newPassword;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchLogout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchForgotPassword = createAsyncThunk(
  "auth/forgot-password",
  async (email: string, { rejectWithValue }) => {
    try {
      await forgotPassword(email);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchResetPassword = createAsyncThunk(
  "auth/reset-password",
  async (
    payload: { token: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      await resetPassword(payload.token, payload.newPassword);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
