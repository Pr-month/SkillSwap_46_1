import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, getUserById, deleteUser } from "../../api/userApi.ts";
import type { TId } from "../../utils/types.ts";

export const fetchUsers = createAsyncThunk(
  "user/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getUsers();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

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
  async ({ id, token }: { id: TId; token: string }, { rejectWithValue }) => {
    try {
      await deleteUser(id, token);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
