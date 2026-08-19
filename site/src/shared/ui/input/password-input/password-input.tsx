import { useState, useId } from "react";
import { Icon } from "../../icon";
import clsx from "clsx";
import styles from "./password-input.module.css";

export interface PasswordInputProps {
  /** Значение поля ввода */
  value?: string;
  /** Обработчик изменения значения */
  onChange?: (value: string) => void;
  /** Метка поля */
  label?: string;
  /** Ошибка валидации (текст или boolean) */
  error?: boolean | string;
  /** Плейсхолдер */
  placeholder?: string;
  /** Отключено ли поле */
  disabled?: boolean;
  /** Видим ли пароль (управляемое состояние) */
  visible?: boolean;
  /** Обработчик переключения видимости (для управляемого состояния) */
  onToggle?: () => void;
  /** Дополнительный CSS-класс для контейнера */
  className?: string;
  /** Дополнительные атрибуты input */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  required?: boolean;
}

export const PasswordInput = ({
  value,
  onChange,
  label,
  error,
  placeholder,
  disabled = false,
  visible: controlledVisible,
  onToggle,
  className,
  inputProps,
  required,
}: PasswordInputProps) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const isControlled = controlledVisible !== undefined;
  const visible = isControlled ? controlledVisible : internalVisible;

  const handleToggle = () => {
    if (disabled) return;
    if (!isControlled) {
      setInternalVisible(!visible);
    }
    onToggle?.();
  };

  const inputId = useId();
  const errorId = useId();
  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : "";

  const toggleButton = (
    <button
      type="button"
      className={clsx(
        styles.toggleButton,
        hasError && styles.toggleButtonError,
      )}
      onClick={handleToggle}
      disabled={disabled}
      aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
      aria-pressed={visible}
      tabIndex={0}
    >
      <Icon name={visible ? "eye-slash" : "eye"} size={20} aria-hidden="true" />
    </button>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={clsx(styles.container, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(styles.input, hasError && styles.error)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          {...inputProps}
          required={required}
        />
        {toggleButton}
      </div>
      {hasError && errorMessage && (
        <p id={errorId} className={styles.errorText} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
