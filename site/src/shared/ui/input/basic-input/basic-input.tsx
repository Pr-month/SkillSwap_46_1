import { forwardRef, useId, useEffect, useRef } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import clsx from "clsx";
import styles from "./basic-input.module.css";

export type BasicInputProps = {
  /** Метка поля */
  label?: string;
  /** Значение */
  value?: string;
  /** Обработчик изменения */
  onChange?: (value: string) => void;
  /** Ошибка валидации (текст или boolean) */
  error?: boolean | string;
  /** Плейсхолдер */
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  rows?: number;
  /** Правая иконка */
  rightIcon?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement> &
    TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>;

export const BasicInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  BasicInputProps
>((props, ref) => {
  const {
    label,
    value,
    onChange,
    error,
    placeholder,
    multiline = false,
    maxLength,
    rows = 3,
    rightIcon,
    ...rest
  } = props;

  const inputId = useId();
  const errorId = useId();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : "";

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (multiline && textareaRef.current) {
      const textarea = textareaRef.current;
      // Сбрасываем высоту перед расчётом scrollHeight
      textarea.style.height = "auto";
      // Устанавливаем новую высоту
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, multiline, rows]);

  const renderInput = () => {
    const inputClassName = clsx(
      styles.input,
      multiline && styles.textarea,
      hasError && styles.error,
      rightIcon && styles.inputWithRightIcon,
    );

    if (multiline) {
      return (
        <textarea
          ref={(node) => {
            // Сохраняем ref для textarea
            if (node) {
              textareaRef.current = node;
            }
            // Пробрасываем ref наружу
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              (
                ref as React.MutableRefObject<HTMLTextAreaElement | null>
              ).current = node;
            }
          }}
          id={inputId}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={inputClassName}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
      );
    }

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        id={inputId}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClassName}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...rest}
      />
    );
  };

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputContainer}>
        {renderInput()}
        {rightIcon && <div className={styles.rightIcon}>{rightIcon}</div>}
      </div>
      {hasError && errorMessage && (
        <p id={errorId} className={styles.errorText} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

BasicInput.displayName = "BasicInput";
