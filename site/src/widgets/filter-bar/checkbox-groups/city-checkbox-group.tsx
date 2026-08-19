import React, { useState } from "react";
import { Icon } from "../../../shared/ui/icon";
import { ECity } from "../../../shared/constants/cities";
import type { TCityCheckboxGroupProps } from "./types";
import styles from "./checkbox-group.module.css";

const CITIES_LIST: string[] = Object.values(ECity);

// Сколько городов показывать до включения скролла
const VISIBLE_CITIES_COUNT = 5;

export const CityCheckboxGroup: React.FC<TCityCheckboxGroupProps> = ({
  value = [],
  onChange,
}) => {
  const [showAll, setShowAll] = useState(false);

  const handleCityChange = (city: string) => {
    const newValue = value.includes(city)
      ? value.filter((c) => c !== city)
      : [...value, city];
    onChange?.(newValue);
  };

  const handleSeeAll = () => {
    setShowAll((prev) => !prev);
  };

  const visibleCities = showAll
    ? CITIES_LIST
    : CITIES_LIST.slice(0, VISIBLE_CITIES_COUNT);
  const hasMoreCities = CITIES_LIST.length > VISIBLE_CITIES_COUNT;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Город</h3>

      <div className={styles.checkboxgroup}>
        {visibleCities.map((city) => {
          const isChecked = value.includes(city);

          return (
            <label key={city} className={styles.option}>
              <input
                type="checkbox"
                value={city}
                checked={isChecked}
                onChange={() => handleCityChange(city)}
                className={styles.input}
              />
              <span className={styles.checkbox}>
                <Icon
                  name={isChecked ? "checkbox-done" : "checkbox-empty"}
                  size={20}
                  aria-hidden="true"
                />
              </span>
              <span className={styles.label}>{city}</span>
            </label>
          );
        })}
      </div>

      {/* Кнопка "Все города" — показываем, если городов больше чем VISIBLE_CITIES_COUNT */}
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
