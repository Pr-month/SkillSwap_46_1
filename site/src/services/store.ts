import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./user/slice";
import { skillSlice } from "./skill/slice";
import { categorySlice } from "./category/slice";
import { authSlice } from "./auth/slice";
import { filterSlice } from "./filter/slice.ts";
import { requestSlice } from "./request/slice.ts";

import {
  useDispatch as dispatchHook,
  useSelector as selectorHook,
} from "react-redux";

export const rootReducer = combineSlices(
  skillSlice,
  categorySlice,
  userSlice,
  authSlice,
  filterSlice,
  requestSlice,
);

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
type AppDispatch = typeof store.dispatch;

export const useDispatch = dispatchHook.withTypes<AppDispatch>();
export const useSelector = selectorHook.withTypes<RootState>();

export default store;
