import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  TGenderOption,
  TSkillOption,
} from "../../widgets/filter-bar/radio-groups/types.ts";

interface FilterState {
  skillOption: TSkillOption;
  gender: TGenderOption;
  subCategoryIds: string[];
  cities: string[];
  searchQuery: string;
}

const initialState: FilterState = {
  skillOption: "all",
  gender: "all",
  subCategoryIds: [],
  cities: [],
  searchQuery: "",
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setSkillOption(state, action: PayloadAction<TSkillOption>) {
      state.skillOption = action.payload;
    },
    setGender(state, action: PayloadAction<TGenderOption>) {
      state.gender = action.payload;
    },
    setSubCategoryIds(state, action: PayloadAction<string[]>) {
      state.subCategoryIds = action.payload;
    },
    setCities(state, action: PayloadAction<string[]>) {
      state.cities = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSkillOption,
  setGender,
  setSubCategoryIds,
  setCities,
  resetFilters,
  setSearchQuery,
} = filterSlice.actions;
export default filterSlice.reducer;
