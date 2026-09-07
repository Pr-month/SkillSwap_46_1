import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  changePassword,
  checkUser,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../../api/authApi.ts";
import { updateCurrentUser } from "../../api/userApi.ts";
import type {
  IRegisterUserData,
  TLoginUserData,
  TUpdateCurrentUserData,
} from "../../utils/types.ts";

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
  async (payload: TUpdateCurrentUserData, { rejectWithValue }) => {
    try {
      return await updateCurrentUser(payload);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

/** ОБНОВЛЕНИЕ ПАРОЛЯ ПОЛЬЗОВАТЕЛЯ */
export const updatePassword = createAsyncThunk(
  "auth/update-password",
  async (
    data: { currentPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      return data.newPassword;
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
