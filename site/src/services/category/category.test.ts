import { describe, test, expect } from "@jest/globals";
import {
  categorySlice,
  setCategories,
  setSubCategories,
  selectCategories,
  selectSubCategories,
  selectSubCategoriesByCategoryId,
  selectSubCategoriesById,
} from "./slice";
import { fetchCategories, fetchSubCategories } from "./actions";

const categoryReducer = categorySlice.reducer;

describe("categorySlice reducer", () => {
  const category1 = {
    id: "1",
    name: "name1",
    subcategories: [],
  };

  const category2 = {
    id: "2",
    name: "name2",
    subcategories: [],
  };

  const subCategory1 = {
    id: "10",
    name: "subname1",
    skillCategoryId: "1",
  };

  const subCategory2 = {
    id: "20",
    name: "subname2",
    skillCategoryId: "2",
  };

  test("устанавливает список категорий (setCategories)", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      setCategories([category1, category2]),
    );
    expect(newState.categories).toEqual([category1, category2]);
  });

  test("устанавливает список подкатегорий (setSubCategories)", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      setSubCategories([subCategory1, subCategory2]),
    );
    expect(newState.subCategories).toEqual([subCategory1, subCategory2]);
  });

  test("устанавливает loading=true при запросе категорий (pending)", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      fetchCategories.pending("", undefined),
    );
    expect(newState.loading).toBe(true);
    expect(newState.error).toBe(null);
  });

  test("сохраняет категории при успешном запросе (fulfilled)", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      fetchCategories.fulfilled([category1], "", undefined),
    );
    expect(newState.loading).toBe(false);
    expect(newState.categories).toEqual([category1]);
  });

  test("сохраняет ошибку при неудачном запросе категорий (rejected)", () => {
    const initialState = categorySlice.getInitialState();
    const error = new Error("Error occurred");
    const newState = categoryReducer(
      initialState,
      fetchCategories.rejected(error, "", undefined),
    );
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Error occurred");
  });

  test("устанавливает loading=true при запросе подкатегорий (pending)", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      fetchSubCategories.pending("", undefined),
    );
    expect(newState.loading).toBe(true);
    expect(newState.error).toBe(null);
  });

  test("сохраняет подкатегории при успешном запросе (fulfilled)", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      fetchSubCategories.fulfilled([subCategory1], "", undefined),
    );
    expect(newState.loading).toBe(false);
    expect(newState.subCategories).toEqual([subCategory1]);
  });

  test("сохраняет ошибку при неудачном запросе подкатегорий (rejected)", () => {
    const initialState = categorySlice.getInitialState();
    const error = new Error("Sub error");
    const newState = categoryReducer(
      initialState,
      fetchSubCategories.rejected(error, "", undefined),
    );
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Sub error");
  });

  test("использует fallback сообщение при ошибке категорий", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      fetchCategories.rejected(new Error(), "", undefined),
    );
    expect(newState.error).toBe("Categories rejected");
  });

  test("использует fallback сообщение при ошибке подкатегорий", () => {
    const initialState = categorySlice.getInitialState();
    const newState = categoryReducer(
      initialState,
      fetchSubCategories.rejected(new Error(), "", undefined),
    );
    expect(newState.error).toBe("SubCategories rejected");
  });

  test("возвращает список категорий (selectCategories)", () => {
    const state = {
      category: {
        categories: [category1],
        subCategories: [],
        loading: false,
        error: null,
      },
    };
    expect(selectCategories(state)).toEqual([category1]);
  });

  test("возвращает список подкатегорий (selectSubCategories)", () => {
    const state = {
      category: {
        categories: [],
        subCategories: [subCategory1],
        loading: false,
        error: null,
      },
    };
    expect(selectSubCategories(state)).toEqual([subCategory1]);
  });

  test("возвращает подкатегории по id категории", () => {
    const state = {
      category: {
        categories: [],
        subCategories: [subCategory1, subCategory2],
        loading: false,
        error: null,
      },
    };
    const result = selectSubCategoriesByCategoryId(state)("1");
    expect(result).toEqual([subCategory1]);
  });

  test("возвращает подкатегории по массиву id", () => {
    const state = {
      category: {
        categories: [],
        subCategories: [subCategory1, subCategory2],
        loading: false,
        error: null,
      },
    };
    const result = selectSubCategoriesById(state)(["10"]);
    expect(result).toEqual([subCategory1]);
  });
});
