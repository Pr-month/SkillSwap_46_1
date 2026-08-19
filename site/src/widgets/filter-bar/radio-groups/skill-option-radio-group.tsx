import React from "react";
import type { TSkillOption, TSkillOptionRadioGroupProps } from "./types";
import styles from "./radio-group.module.css";

// eslint-disable-next-line react-refresh/only-export-components
export const skillOptions: { value: TSkillOption; label: string }[] = [
  { value: "all", label: "Всё" },
  { value: "want-to-learn", label: "Хочу научиться" },
  { value: "can-teach", label: "Могу научить" },
];

export const SkillOptionRadioGroup: React.FC<TSkillOptionRadioGroupProps> = ({
  value = "all",
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value as TSkillOption);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Тип участия"
      className={styles.radiogroup}
    >
      {skillOptions.map((option) => (
        <label
          key={option.value}
          className={`${styles.option} ${value === option.value ? styles.option_selected : ""}`}
        >
          <input
            type="radio"
            name="skill-option"
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
  );
};
