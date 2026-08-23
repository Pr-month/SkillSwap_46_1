import { createSlice } from "@reduxjs/toolkit";
import { fetchPopularCities } from "./actions";
import type { ICity } from "../../utils/types";

type CityState = {
  popularCities: ICity[];
  loading: boolean;
  error: string | null;
};

export const initialState: CityState = {
  popularCities: [],
  loading: false,
  error: null,
};

export const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {},
  selectors: {
    selectPopularCities: (state) => state.popularCities,
    selectCityLoading: (state) => state.loading,
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
      });
  },
});

export const { selectPopularCities, selectCityLoading } =
  citySlice.selectors;

export default citySlice.reducer;
