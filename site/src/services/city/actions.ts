import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPopularCities } from "../../api/cityApi";

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
