import React, { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "../icon";
import styles from "./search.module.css";

export interface SearchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** Обработчик поиска (вызывается по enter) */
  onSearch?: (value: string) => void;
  /** Обработчик живого ввода (вызывается на каждое изменение значения) */
  onChange?: (value: string) => void;
  /** Обработчик очистки поля */
  onClear?: () => void;
  /** Плейсхолдер */
  placeholder?: string;
  /** Дополнительный CSS класс */
  className?: string;
}

export const Search = ({
  onSearch,
  onChange,
  onClear,
  placeholder = "Искать навык",
  className,
  disabled,
  ...props
}: SearchProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(newValue);

      if (newValue.trim() === "") {
        onSearch?.("");
      }
    },
    [onSearch, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.(inputValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (inputValue) {
        setInputValue("");
        onClear?.();
      }
    }
    props.onKeyDown?.(e);
  };

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange?.("");
    onSearch?.("");
    inputRef.current?.focus();
  }, [onSearch, onChange]);

  const showClear = inputValue.length > 0 && !disabled;

  return (
    <div className={clsx(styles.search, className)}>
      <div className={styles.searchContainer}>
        <div className={styles.iconInputWrapper}>
          <Icon
            name="search"
            size={24}
            className={styles.searchIcon}
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={styles.input}
            {...props}
          />
        </div>

        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Очистить поле поиска"
            disabled={disabled}
          >
            <Icon name="cross" size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
