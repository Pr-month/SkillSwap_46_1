import React, { useState } from "react";
import { Icon } from "../../../shared/ui/icon";
import type { TSkillCategoryCheckboxGroupProps } from "./types";
import styles from "./checkbox-group.module.css";
import { useSelector } from "../../../services/store.ts";
import { selectCategories } from "../../../services/category/slice.ts";

const VISIBLE_CATEGORIES_COUNT = 3;

export const SkillSubcategoryCheckboxGroup: React.FC<
  TSkillCategoryCheckboxGroupProps
> = ({ value = [], onChange }) => {
  const categories = useSelector(selectCategories);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const handleSubcategoryChange = (subcategoryId: string) => {
    const newValue = value.includes(subcategoryId)
      ? value.filter((id) => id !== subcategoryId)
      : [...value, subcategoryId];
    onChange?.(newValue);
  };

  const handleCategoryClick = (categoryId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleCategoryCheckboxChange = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;
    const subcategoryIds = category.subcategories.map((sub) => sub.id);
    const allSelected = subcategoryIds.every((id) => value.includes(id));
    const newValue = allSelected
      ? value.filter((id) => !subcategoryIds.includes(id))
      : [...new Set([...value, ...subcategoryIds])];
    onChange?.(newValue);
  };

  const handleSeeAll = () => {
    setShowAll((prev) => !prev);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return "checkbox-empty";
    const subcategoryIds = category.subcategories.map((sub) => sub.id);
    const selectedCount = subcategoryIds.filter((id) =>
      value.includes(id),
    ).length;
    if (selectedCount === 0) return "checkbox-empty";
    if (selectedCount === subcategoryIds.length) return "checkbox-done";
    return "checkbox-remove";
  };

  const visibleCategories = showAll
    ? categories
    : categories.slice(0, VISIBLE_CATEGORIES_COUNT);

  const hasMoreCategories = categories.length > VISIBLE_CATEGORIES_COUNT;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Навыки</h3>
      <div className={styles.checkboxgroup}>
        {visibleCategories.map((category) => {
          const isExpanded = expanded[category.id] ?? false;
          const categoryIcon = getCategoryIcon(category.id);
          return (
            <div key={category.id} className={styles.category}>
              <div
                className={styles["category-header"]}
                aria-expanded={isExpanded}
                aria-controls={`category-${category.id}-options`}
              >
                <div
                  className={styles["category-title-wrapper"]}
                  onClick={() => handleCategoryCheckboxChange(category.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCategoryCheckboxChange(category.id);
                    }
                  }}
                >
                  <span className={styles.checkbox}>
                    <Icon name={categoryIcon} size={20} aria-hidden="true" />
                  </span>
                  <span className={styles.label}>{category.name}</span>
                </div>

                <Icon
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  className={styles["category-toggle"]}
                  aria-hidden="true"
                  onClick={() => handleCategoryClick(category.id)}
                />
              </div>

              <div
                className={`${styles["category-options"]} ${!isExpanded ? styles.collapsed : ""}`}
              >
                {category.subcategories.map((subcategory) => {
                  const isChecked = value.includes(subcategory.id);
                  return (
                    <label key={subcategory.id} className={styles.option}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubcategoryChange(subcategory.id)}
                        className={styles.input}
                      />
                      <span className={styles.checkbox}>
                        <Icon
                          name={isChecked ? "checkbox-done" : "checkbox-empty"}
                          size={20}
                          aria-hidden="true"
                        />
                      </span>
                      <span className={styles.label}>{subcategory.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        {hasMoreCategories && (
          <button
            type="button"
            className={styles["see-all-button"]}
            onClick={handleSeeAll}
            aria-label={
              showAll
                ? "Свернуть список категорий"
                : "Показать все категории навыков"
            }
          >
            <span>{showAll ? "Свернуть" : "Все категории"}</span>
            <Icon
              name={showAll ? "chevron-up" : "chevron-down"}
              size={20}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
};
