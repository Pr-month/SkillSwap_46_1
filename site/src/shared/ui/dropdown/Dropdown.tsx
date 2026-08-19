import { useState, useRef, useMemo } from "react";
import type { MouseEventHandler, KeyboardEventHandler } from "react";
import clsx from "clsx";
import type { OptionType } from "./types";
import { Option } from "./Option";
import { useEnterSubmit } from "./hooks/useEnterSubmit";
import { useOutsideClickClose } from "./hooks/useOutsideClickClose";

import styles from "./Dropdown.module.css";
import { Icon } from "../icon";

type DropdownProps = {
  selected: OptionType | null;
  options: OptionType[];
  onChange?: (selected: OptionType) => void;
  onClose?: () => void;
  title?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export const Dropdown = (props: DropdownProps) => {
  const {
    options,
    placeholder,
    selected,
    onChange,
    onClose,
    title,
    required = false,
    disabled = false,
    error = false,
    searchable = false,
    searchPlaceholder = "Начните вводить...",
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useOutsideClickClose({
    isOpen,
    rootRef,
    onClose,
    onChange: (value) => {
      setIsOpen(value);

      if (!value) {
        setSearchQuery("");
      }
    },
  });

  useEnterSubmit({
    placeholderRef,
    onChange: setIsOpen,
  });

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;

    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.title.toLowerCase().includes(normalizedQuery),
    );
  }, [options, searchable, searchQuery]);

  const isFilled = Boolean(selected?.value);
  const isInvalid = required && !isFilled && error;

  const handleOptionClick = (option: OptionType) => {
    if (disabled) return;

    setIsOpen(false);
    setSearchQuery("");
    onChange?.(option);
    onClose?.();
  };

  const handleTriggerClick: MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();

    if (disabled) return;

    setIsOpen((prev) => {
      const next = !prev;

      if (!next) {
        setSearchQuery("");
        onClose?.();
      }

      return next;
    });
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
      onClose?.();
    }
  };

  return (
    <div className={styles.container}>
      {title && (
        <span className={styles.title}>
          {title}
          {required && <span className={styles.requiredMark}>*</span>}
        </span>
      )}

      <div
        className={clsx(
          styles.dropdownWrapper,
          disabled && styles.disabled,
          isInvalid && styles.invalid,
        )}
        ref={rootRef}
        data-is-active={isOpen}
        data-searchable={searchable}
        data-testid="dropdownWrapper"
        data-disabled={disabled}
        data-invalid={isInvalid}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-required={required}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-invalid={isInvalid}
      >
        <Icon
          name="chevron-down"
          size={20}
          className={styles.chevron}
          onClick={handleTriggerClick}
        />

        <div
          className={styles.placeholder}
          data-selected={isFilled}
          ref={placeholderRef}
          onClick={!isOpen ? handleTriggerClick : undefined}
        >
          {isOpen && searchable ? (
            <div
              className={styles.inlineSearchWrapper}
              onClick={(event) => event.stopPropagation()}
            >
              <input
                className={styles.inlineSearchInput}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
              />

              <button
                type="button"
                className={styles.clearButton}
                onClick={(event) => {
                  event.stopPropagation();

                  if (searchQuery) {
                    setSearchQuery("");
                  } else {
                    setIsOpen(false);
                    setSearchQuery("");
                    onClose?.();
                  }
                }}
                aria-label={searchQuery ? "Очистить поиск" : "Закрыть список"}
              >
                <Icon name="cross" size={16} className={styles.clearIcon} />
              </button>
            </div>
          ) : (
            <span className={styles.placeholderText}>
              {selected?.title || placeholder}
            </span>
          )}
        </div>

        {isOpen && !disabled && (
          <div
            className={styles.dropdown}
            data-testid="selectDropdown"
            role="listbox"
          >
            <ul className={styles.optionsList}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <Option
                    key={option.value}
                    option={option}
                    onClick={() => handleOptionClick(option)}
                  />
                ))
              ) : (
                <li className={styles.emptyState}>Ничего не найдено</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {isInvalid && (
        <span className={styles.errorText}>Выберите значение из списка</span>
      )}
    </div>
  );
};
