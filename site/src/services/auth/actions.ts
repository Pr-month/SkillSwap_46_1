import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  changePassword,
  checkUser,
  getProfile,
  loginUser,
  registerUser,
} from "../../api/authApi.ts";
import { updateUser } from "../../api/userApi.ts";
import { tokenService } from "../../utils/tokenService.ts";
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
    const token = tokenService.get();
    if (!token) return rejectWithValue("Токен не найден");
    try {
      return await getProfile();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchUpdateCurrentUser = createAsyncThunk(
  "auth/updateCurrentUser",
  async (payload: Partial<TUpdateUserData>, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const { currentUser } = state.auth;
    const token = tokenService.get();
    if (!token) return rejectWithValue("Токен не найден");
    if (!currentUser?.id) return rejectWithValue("Не найден id пользователя");
    try {
      return await updateUser(currentUser.id, payload, token);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

/** ОБНОВЛЕНИЕ ПАРОЛЯ ПОЛЬЗОВАТЕЛЯ */
export const updatePassword = createAsyncThunk(
  "auth/update-password",
  async (newPassword: string, { rejectWithValue }) => {
    const token = tokenService.get();
    if (!token) return rejectWithValue("Токен не найден");
    try {
      await changePassword(newPassword);
      return newPassword;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
