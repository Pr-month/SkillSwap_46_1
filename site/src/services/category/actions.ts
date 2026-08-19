import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCategories,
  getSubCategories,
  getCategoryById,
} from "../../api/categoryApi";
import type { TId } from "../../utils/types";

export const fetchCategories = createAsyncThunk(
  "category/getAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getCategories();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchSubCategories = createAsyncThunk(
  "category/getAllSubCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await getSubCategories();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchCategoryById = createAsyncThunk(
  "category/getById",
  async (categoryId: TId, { rejectWithValue }) => {
    try {
      return await getCategoryById(categoryId);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
