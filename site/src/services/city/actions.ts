import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPopularCities, searchCities } from "../../api/cityApi";

export const fetchPopularCities = createAsyncThunk(
  "city/getPopular",
  async (_, { rejectWithValue }) => {
    try {
      return await getPopularCities();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchCitiesBySearch = createAsyncThunk(
  "city/search",
  async (query: string, { rejectWithValue }) => {
    try {
      return await searchCities(query);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
