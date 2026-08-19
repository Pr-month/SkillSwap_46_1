import React from "react";
import clsx from "clsx";
import { Icon } from "../../../shared/ui/icon";
import styles from "./selected-filters.module.css";

import type { TSelectedFiltersProps } from "./types";

export const SelectedFilters: React.FC<TSelectedFiltersProps> = ({
  filters,
  onRemove,
  onReset,
  className = "",
}) => {
  if (!filters.length) {
    return null;
  }

  return (
    <div className={clsx(styles.selectedFilters, className)}>
      <button type="button" className={styles.resetButton} onClick={onReset}>
        <span>Сбросить</span>
        <Icon name="cross" size={24} aria-hidden="true" />
      </button>

      <div className={styles.filtersList}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={styles.filterChip}
            onClick={() => onRemove?.(filter.id)}
            aria-label={`Убрать фильтр: ${filter.label}`}
          >
            <span>{filter.label}</span>
            <Icon name="cross" size={24} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
};

SelectedFilters.displayName = "SelectedFilters";
