import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { FavoriteDto } from "../../utils/types";
import {
  fetchAddFavorite,
  fetchFavorites,
  fetchRemoveFavorite,
} from "./actions";

interface FavoriteState {
  favorites: FavoriteDto[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoriteState = {
  favorites: [],
  loading: false,
  error: null,
};

export const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites(state) {
      state.favorites = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //* ПОЛУЧЕНИЕ СПИСКА ИЗБРАННОГО
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка загрузки избранного";
      })
      //* ДОБАВЛЕНИЕ В ИЗБРАННОЕ
      .addCase(fetchAddFavorite.fulfilled, (state, action) => {
        const favorite = action.payload;
        const exists = state.favorites.some(
          (item) => item.skillId === favorite.skillId,
        );
        if (!exists) {
          state.favorites = [favorite, ...state.favorites];
        }
      })
      //* УДАЛЕНИЕ ИЗ ИЗБРАННОГО
      .addCase(fetchRemoveFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(
          (item) => item.skillId !== action.payload,
        );
      });
  },
  selectors: {
    selectFavorites: (state: FavoriteState) => state.favorites,
    selectFavoritesLoading: (state: FavoriteState) => state.loading,
    selectFavoritesError: (state: FavoriteState) => state.error,
  },
});

export const { clearFavorites } = favoriteSlice.actions;
export const { selectFavorites, selectFavoritesLoading, selectFavoritesError } =
  favoriteSlice.selectors;

/** Набор id навыков, находящихся в избранном у текущего пользователя. */
export const selectFavoriteSkillIds = createSelector(
  [selectFavorites],
  (favorites) => new Set(favorites.map((favorite) => favorite.skillId)),
);

export default favoriteSlice.reducer;
