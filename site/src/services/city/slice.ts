import { createSlice } from "@reduxjs/toolkit";
import { fetchPopularCities, fetchSearchCities } from "./actions";
import type { ICity } from "../../utils/types";

/**
 * Минимальная длина поискового запроса для обращения к бэкенду.
 * Короче — показываем список популярных городов (см. selectDisplayedCities).
 * Совпадает с тем, что триграмное сходство pg_trgm на бэке не имеет
 * смысла для строк короче 3 символов (триграмма — это как раз 3 символа).
 */
export const MIN_CITY_SEARCH_LENGTH = 3;

type CityState = {
  popularCities: ICity[];
  searchResults: ICity[];
  searchQuery: string;
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
};

export const initialState: CityState = {
  popularCities: [],
  searchResults: [],
  searchQuery: "",
  loading: false,
  searchLoading: false,
  error: null,
};

export const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {
    setCitySearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCitySearch: (state) => {
      state.searchQuery = "";
      state.searchResults = [];
    },
  },
  selectors: {
    selectPopularCities: (state) => state.popularCities,
    selectCitySearchResults: (state) => state.searchResults,
    selectCitySearchQuery: (state) => state.searchQuery,
    selectCityLoading: (state) => state.loading,
    selectCitySearchLoading: (state) => state.searchLoading,
    selectDisplayedCities: (state) =>
      state.searchQuery.trim().length >= MIN_CITY_SEARCH_LENGTH
        ? state.searchResults
        : state.popularCities,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularCities.fulfilled, (state, action) => {
        state.loading = false;
        state.popularCities = action.payload;
      })
      .addCase(fetchPopularCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "PopularCities rejected";
      })
      .addCase(fetchSearchCities.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchCities.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchSearchCities.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message || "City search rejected";
      });
  },
});

export const { setCitySearchQuery, clearCitySearch } = citySlice.actions;
export const {
  selectPopularCities,
  selectCitySearchResults,
  selectCitySearchQuery,
  selectCityLoading,
  selectCitySearchLoading,
  selectDisplayedCities,
} = citySlice.selectors;

export default citySlice.reducer;