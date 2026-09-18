import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsers,
  getUserById,
  deleteUser,
  type GetUsersParams,
  type PaginatedUsersResponse,
  sendConfirmationEmail,
} from "../../api/userApi.ts";
import type { TId } from "../../utils/types.ts";

/** Сколько пользователей показываем в разделе «Популярное». */
export const POPULAR_USERS_LIMIT = 9;

export const fetchUsers = createAsyncThunk<
  PaginatedUsersResponse,
  GetUsersParams | void
>("user/fetchAll", async (arg, { rejectWithValue }) => {
  try {
    return await getUsers(arg ?? {});
  } catch (err) {
    return rejectWithValue(err);
  }
});

/**
 * Загружает пользователей, отсортированных по популярности (по количеству
 * полученных избранных). Сортировка выполняется на бэкенде по всей базе,
 * поэтому раздел «Популярное» не зависит от уже загруженной первой страницы.
 */
export const fetchPopularUsers = createAsyncThunk<
  PaginatedUsersResponse,
  number | void
>("user/fetchPopular", async (limit, { rejectWithValue }) => {
  try {
    return await getUsers({
      page: 1,
      limit: limit ?? POPULAR_USERS_LIMIT,
      orderBy: "popular",
    });
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const fetchUserById = createAsyncThunk(
  "user/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getUserById(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const removeUser = createAsyncThunk(
  "user/delete",
  async ({ id }: { id: TId }, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchSendConfirmationEmail = createAsyncThunk(
  "auth/sendConfirmationEmail",
  async (_, { rejectWithValue }) => {
    try {
      await sendConfirmationEmail();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
