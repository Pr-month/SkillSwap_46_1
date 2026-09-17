import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../../api/favoritesApi";
import type { FavoriteDto, TId } from "../../utils/types";

/** ASYNC THUNK: ПОЛУЧЕНИЕ СПИСКА ИЗБРАННОГО ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ */
export const fetchFavorites = createAsyncThunk<FavoriteDto[], void>(
  "favorites/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getFavorites();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

/** ASYNC THUNK: ДОБАВЛЕНИЕ НАВЫКА В ИЗБРАННОЕ */
export const fetchAddFavorite = createAsyncThunk<FavoriteDto, TId>(
  "favorites/add",
  async (skillId, { rejectWithValue }) => {
    try {
      return await addFavorite(skillId);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

/** ASYNC THUNK: УДАЛЕНИЕ НАВЫКА ИЗ ИЗБРАННОГО */
export const fetchRemoveFavorite = createAsyncThunk<TId, TId>(
  "favorites/remove",
  async (skillId, { rejectWithValue }) => {
    try {
      await removeFavorite(skillId);
      return skillId;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
