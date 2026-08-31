import { describe, test, expect } from "@jest/globals";
import { citySlice, selectPopularCities } from "./slice";
import { fetchPopularCities } from "./actions";
import type { ICity } from "../../utils/types";

const cityReducer = citySlice.reducer;

describe("citySlice reducer", () => {
  const moscow: ICity = {
    id: "1",
    name: "Москва",
    district: "Центральный",
    subject: "Москва",
    population: 12000000,
    lat: 55.75,
    lon: 37.62,
  };

  const kazan: ICity = {
    id: "2",
    name: "Казань",
    district: "Приволжский",
    subject: "Татарстан",
    population: 1300000,
    lat: 55.79,
    lon: 49.12,
  };

  test("устанавливает список популярных городов при успешном запросе (fulfilled)", () => {
    const initialState = citySlice.getInitialState();
    const newState = cityReducer(
      initialState,
      fetchPopularCities.fulfilled([moscow, kazan], "", undefined),
    );
    expect(newState.loading).toBe(false);
    expect(newState.popularCities).toEqual([moscow, kazan]);
  });

  test("устанавливает loading=true при запросе популярных городов (pending)", () => {
    const initialState = citySlice.getInitialState();
    const newState = cityReducer(
      initialState,
      fetchPopularCities.pending("", undefined),
    );
    expect(newState.loading).toBe(true);
    expect(newState.error).toBe(null);
  });

  test("сохраняет ошибку при неудачном запросе популярных городов (rejected)", () => {
    const initialState = citySlice.getInitialState();
    const error = new Error("Error occurred");
    const newState = cityReducer(
      initialState,
      fetchPopularCities.rejected(error, "", undefined),
    );
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Error occurred");
  });

  test("возвращает список популярных городов (selectPopularCities)", () => {
    const state = {
      city: {
        popularCities: [moscow],
        loading: false,
        error: null,
      },
    };
    expect(selectPopularCities(state)).toEqual([moscow]);
  });
});
