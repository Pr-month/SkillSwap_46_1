import { createSlice } from "@reduxjs/toolkit";
import { fetchPopularCities, fetchSearchCities } from "./actions";
import type { ICity } from "../../utils/types";

type CityState = {
  popularCities: ICity[];
  searchResults: ICity[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
};

export const initialState: CityState = {
  popularCities: [],
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null,
};

export const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {},
  selectors: {
    selectPopularCities: (state) => state.popularCities,
    selectCityLoading: (state) => state.loading,
    selectCitySearchResults: (state) => state.searchResults,
    selectCitySearchLoading: (state) => state.searchLoading,
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

export const {
  selectPopularCities,
  selectCityLoading,
  selectCitySearchResults,
  selectCitySearchLoading,
} = citySlice.selectors;

export default citySlice.reducer;
