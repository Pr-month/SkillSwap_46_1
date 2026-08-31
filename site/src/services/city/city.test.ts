import { describe, test, expect } from "@jest/globals";
import {
  citySlice,
  setCitySearchQuery,
  clearCitySearch,
  selectPopularCities,
  selectCitySearchResults,
  selectCitySearchQuery,
  selectDisplayedCities,
  MIN_CITY_SEARCH_LENGTH,
} from "./slice";
import { fetchPopularCities, fetchCitiesBySearch } from "./actions";
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

  test("устанавливает результаты поиска при успешном запросе (fulfilled)", () => {
    const initialState = citySlice.getInitialState();
    const newState = cityReducer(
      initialState,
      fetchCitiesBySearch.fulfilled([kazan], "", "каза"),
    );
    expect(newState.loading).toBe(false);
    expect(newState.searchResults).toEqual([kazan]);
  });

  test("сохраняет ошибку при неудачном поиске городов (rejected)", () => {
    const initialState = citySlice.getInitialState();
    const error = new Error("Search error");
    const newState = cityReducer(
      initialState,
      fetchCitiesBySearch.rejected(error, "", "каза"),
    );
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Search error");
  });

  test("устанавливает поисковый запрос (setCitySearchQuery)", () => {
    const initialState = citySlice.getInitialState();
    const newState = cityReducer(initialState, setCitySearchQuery("каза"));
    expect(newState.searchQuery).toBe("каза");
  });

  test("очищает поиск (clearCitySearch)", () => {
    const initialState = {
      ...citySlice.getInitialState(),
      searchQuery: "каза",
      searchResults: [kazan],
    };
    const newState = cityReducer(initialState, clearCitySearch());
    expect(newState.searchQuery).toBe("");
    expect(newState.searchResults).toEqual([]);
  });

  test("возвращает список популярных городов (selectPopularCities)", () => {
    const state = {
      city: {
        popularCities: [moscow],
        searchResults: [],
        searchQuery: "",
        loading: false,
        error: null,
      },
    };
    expect(selectPopularCities(state)).toEqual([moscow]);
  });

  test("возвращает результаты поиска (selectCitySearchResults)", () => {
    const state = {
      city: {
        popularCities: [],
        searchResults: [kazan],
        searchQuery: "каза",
        loading: false,
        error: null,
      },
    };
    expect(selectCitySearchResults(state)).toEqual([kazan]);
  });

  test("возвращает текущий поисковый запрос (selectCitySearchQuery)", () => {
    const state = {
      city: {
        popularCities: [],
        searchResults: [],
        searchQuery: "каза",
        loading: false,
        error: null,
      },
    };
    expect(selectCitySearchQuery(state)).toBe("каза");
  });

  describe("selectDisplayedCities", () => {
    test("возвращает популярные города, если запрос короче MIN_CITY_SEARCH_LENGTH", () => {
      const shortQuery = "к".repeat(MIN_CITY_SEARCH_LENGTH - 1);
      const state = {
        city: {
          popularCities: [moscow],
          searchResults: [kazan],
          searchQuery: shortQuery,
          loading: false,
          error: null,
        },
      };
      expect(selectDisplayedCities(state)).toEqual([moscow]);
    });

    test("возвращает результаты поиска, если запрос не короче MIN_CITY_SEARCH_LENGTH", () => {
      const state = {
        city: {
          popularCities: [moscow],
          searchResults: [kazan],
          searchQuery: "каза",
          loading: false,
          error: null,
        },
      };
      expect(selectDisplayedCities(state)).toEqual([kazan]);
    });

    test("возвращает популярные города при пустом запросе", () => {
      const state = {
        city: {
          popularCities: [moscow],
          searchResults: [kazan],
          searchQuery: "",
          loading: false,
          error: null,
        },
      };
      expect(selectDisplayedCities(state)).toEqual([moscow]);
    });
  });
});
