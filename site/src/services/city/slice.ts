import { createSlice } from "@reduxjs/toolkit";
import { fetchCitiesBySearch, fetchPopularCities } from "./actions";
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
  error: string | null;
};

export const initialState: CityState = {
  popularCities: [],
  searchResults: [],
  searchQuery: "",
  loading: false,
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
      .addCase(fetchCitiesBySearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCitiesBySearch.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchCitiesBySearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "CitiesSearch rejected";
      });
  },
});

export const { setCitySearchQuery, clearCitySearch } = citySlice.actions;
export const {
  selectPopularCities,
  selectCitySearchResults,
  selectCitySearchQuery,
  selectCityLoading,
  selectDisplayedCities,
} = citySlice.selectors;

export default citySlice.reducer;