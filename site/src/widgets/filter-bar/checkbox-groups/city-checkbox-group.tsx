import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "../../../shared/ui/icon";
import { Search } from "../../../shared/ui/search";
import { useDispatch, useSelector } from "../../../services/store";
import { fetchPopularCities } from "../../../services/city/actions";
import {
  selectCityLoading,
  selectPopularCities,
} from "../../../services/city/slice";
import { findMatchingIdsByTitle } from "../../../utils/search";
import type { TCityCheckboxGroupProps } from "./types";
import styles from "./checkbox-group.module.css";

// Сколько городов показывать до включения скролла/раскрытия списка
const VISIBLE_CITIES_COUNT = 5;

export const CityCheckboxGroup: React.FC<TCityCheckboxGroupProps> = ({
  value = [],
  onChange,
}) => {
  const dispatch = useDispatch();

  const popularCities = useSelector(selectPopularCities);
  const loading = useSelector(selectCityLoading);

  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  // Загружаем список самых популярных городов (топ-20 по населению) один раз при монтировании
  useEffect(() => {
    if (popularCities.length === 0) {
      dispatch(fetchPopularCities());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Поиск по загруженному списку городов через существующую на фронте
  // утилиту нечёткого (триграммного) поиска — без обращения к бэкенду
  const filteredCities = useMemo(() => {
    if (!isSearching) {
      return popularCities;
    }

    const searchableCities = popularCities.map((city) => ({
      id: city.id,
      title: city.name,
      description: city.name,
    }));

    const matchingIds = findMatchingIdsByTitle(searchableCities, searchQuery);

    return popularCities.filter((city) => matchingIds.includes(city.id));
  }, [popularCities, searchQuery, isSearching]);

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
      ? filteredCities
      : filteredCities.slice(0, VISIBLE_CITIES_COUNT);
  const hasMoreCities =
    !isSearching && filteredCities.length > VISIBLE_CITIES_COUNT;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Город</h3>

      <Search
        placeholder="Искать город"
        onChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
        aria-label="Поиск города"
      />

      <div className={styles.checkboxgroup}>
        {!isSearching && loading && visibleCities.length === 0 && (
          <span className={styles.label}>Загрузка городов…</span>
        )}

        {isSearching && visibleCities.length === 0 && (
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
