import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../../../shared/ui/icon";
import { Search } from "../../../shared/ui/search";
import { useDispatch, useSelector } from "../../../services/store";
import {
  fetchCitiesBySearch,
  fetchPopularCities,
} from "../../../services/city/actions";
import {
  MIN_CITY_SEARCH_LENGTH,
  clearCitySearch,
  selectCityLoading,
  selectDisplayedCities,
  selectPopularCities,
} from "../../../services/city/slice";
import type { TCityCheckboxGroupProps } from "./types";
import styles from "./checkbox-group.module.css";

// Сколько городов показывать до включения скролла/раскрытия списка
const VISIBLE_CITIES_COUNT = 5;
// Задержка перед отправкой поискового запроса на бэкенд, мс —
// чтобы не спамить запросами на каждую введённую букву
const SEARCH_DEBOUNCE_MS = 400;

export const CityCheckboxGroup: React.FC<TCityCheckboxGroupProps> = ({
  value = [],
  onChange,
}) => {
  const dispatch = useDispatch();

  const popularCities = useSelector(selectPopularCities);
  const displayedCities = useSelector(selectDisplayedCities);
  const loading = useSelector(selectCityLoading);

  const [showAll, setShowAll] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSearching = inputValue.trim().length >= MIN_CITY_SEARCH_LENGTH;

  // Загружаем список самых популярных городов (топ-20 по населению) один раз при монтировании
  useEffect(() => {
    if (popularCities.length === 0) {
      dispatch(fetchPopularCities());
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Живой поиск с debounce: запрос на бэкенд (/cities/search) уходит только
  // если введено от MIN_CITY_SEARCH_LENGTH символов и не чаще, чем раз в
  // SEARCH_DEBOUNCE_MS — иначе показываем список популярных городов.
  const handleSearchChange = (query: string) => {
    setInputValue(query);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const trimmed = query.trim();

    if (trimmed.length < MIN_CITY_SEARCH_LENGTH) {
      dispatch(clearCitySearch());
      return;
    }

    debounceTimer.current = setTimeout(() => {
      dispatch(fetchCitiesBySearch(trimmed));
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleClearSearch = () => {
    setInputValue("");

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    dispatch(clearCitySearch());
  };

  const handleCityChange = (city: string) => {
    const newValue = value.includes(city)
      ? value.filter((c) => c !== city)
      : [...value, city];
    onChange?.(newValue);
  };

  const handleSeeAll = () => {
    setShowAll((prev) => !prev);
  };

  const visibleCities =
    isSearching || showAll
      ? displayedCities
      : displayedCities.slice(0, VISIBLE_CITIES_COUNT);
  const hasMoreCities =
    !isSearching && displayedCities.length > VISIBLE_CITIES_COUNT;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Город</h3>

      <Search
        placeholder="Искать город"
        onChange={handleSearchChange}
        onClear={handleClearSearch}
        aria-label="Поиск города"
      />

      <div className={styles.checkboxgroup}>
        {!isSearching && loading && visibleCities.length === 0 && (
          <span className={styles.label}>Загрузка городов…</span>
        )}

        {isSearching && loading && (
          <span className={styles.label}>Идёт поиск…</span>
        )}

        {isSearching && !loading && visibleCities.length === 0 && (
          <span className={styles.label}>Города не найдены</span>
        )}

        {visibleCities.map((city) => {
          const isChecked = value.includes(city.name);

          return (
            <label key={city.id} className={styles.option}>
              <input
                type="checkbox"
                value={city.name}
                checked={isChecked}
                onChange={() => handleCityChange(city.name)}
                className={styles.input}
              />
              <span className={styles.checkbox}>
                <Icon
                  name={isChecked ? "checkbox-done" : "checkbox-empty"}
                  size={20}
                  aria-hidden="true"
                />
              </span>
              <span className={styles.label}>{city.name}</span>
            </label>
          );
        })}
      </div>

      {/* Кнопка "Все города" — показываем, если городов больше чем VISIBLE_CITIES_COUNT и поиск не активен */}
      {hasMoreCities && (
        <button
          type="button"
          className={styles["see-all-button"]}
          onClick={handleSeeAll}
          aria-label={
            showAll ? "Свернуть список городов" : "Показать все города"
          }
        >
          <span>{showAll ? "Свернуть" : "Все города"}</span>
          <Icon
            name={showAll ? "chevron-up" : "chevron-down"}
            size={20}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
};
