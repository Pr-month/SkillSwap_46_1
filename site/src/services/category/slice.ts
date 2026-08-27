import { createSlice } from "@reduxjs/toolkit";
import { fetchCategories, fetchSubCategories } from "./actions";
import type {
  ISkillsSubcategory,
  ISkillsCategory,
  TId,
} from "../../utils/types";

type CategoryState = {
  categories: ISkillsCategory[];
  subCategories: ISkillsSubcategory[];
  loading: boolean;
  error: string | null;
};

export const initialState: CategoryState = {
  categories: [],
  subCategories: [],
  loading: false,
  error: null,
};

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setSubCategories: (state, action) => {
      state.subCategories = action.payload;
    },
  },
  selectors: {
    selectCategories: (state) => state.categories,
    selectSubCategories: (state) => state.subCategories,
    selectCategoryById: (state) => (id: TId) =>
      state.categories.find((category) => category.id === id),
    selectSubCategoriesByCategoryId: (state) => (id: TId) =>
      state.subCategories.filter((sub) => sub.skillCategoryId === id),
    selectSubCategoriesById: (state) => (ids: TId[]) =>
      state.subCategories.filter((subCategory) => ids.includes(subCategory.id)),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        // Подкатегории приходят вложенными в категории (`category.subcategories`),
        // поэтому отдельный запрос `fetchSubCategories` не нужен — извлекаем их
        // здесь, чтобы не делать лишний запрос к `/categories`.
        state.subCategories = action.payload.flatMap(
          (category) => category.subcategories,
        );
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Categories rejected";
      })
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "SubCategories rejected";
      });
  },
});

export const { setCategories, setSubCategories } = categorySlice.actions;
export const {
  selectCategories,
  selectSubCategories,
  selectSubCategoriesByCategoryId,
  selectSubCategoriesById,
} = categorySlice.selectors;

export default categorySlice.reducer;
