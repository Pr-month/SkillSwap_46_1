import React from "react";
import type { TGenderOption, TGenderFilterProps } from "./types";
import styles from "./radio-group.module.css";

// eslint-disable-next-line react-refresh/only-export-components
export const genderOptions: { value: TGenderOption; label: string }[] = [
  { value: "all", label: "Не имеет значения" },
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
];

export const SexRadioGroup: React.FC<TGenderFilterProps> = ({
  value = "all",
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value as TGenderOption);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Пол автора</h3>
      <div
        role="radiogroup"
        aria-label="Пол автора"
        className={styles.radiogroup}
      >
        {genderOptions.map((option) => (
          <label
            key={option.value}
            className={`${styles.option} ${value === option.value ? styles.option_selected : ""}`}
          >
            <input
              type="radio"
              name="authors-sex"
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              className={styles.input}
            />
            <span className={styles.radio} aria-hidden="true" />
            <span className={styles.label}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
