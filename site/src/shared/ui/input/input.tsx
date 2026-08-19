import { forwardRef, useState, useEffect, useCallback, useRef } from "react";
import type {
  ChangeEvent,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
} from "react";
import clsx from "clsx";
import styles from "./input.module.css";
import { Icon } from "../icon"; // используем общий компонент иконок

type BaseProps = {
  /** Тип поля */
  type?: "text" | "email" | "password" | "search" | "tel" | "url" | "number";
  /** Сообщение об ошибке (визуально меняет стиль) */
  error?: boolean;
  /** Отключенное состояние */
  disabled?: boolean;
  /** CSS-класс для дополнительной стилизации */
  className?: string;
  /** Многострочный режим (textarea) */
  multiline?: boolean;
  /** Иконка поиска (только для type="search") */
  withSearchIcon?: boolean;
  /** Обязательное поле */
  required?: boolean;
  /** Максимальная длина (символы) */
  maxLength?: number;
  /** Регулярное выражение для проверки формата */
  pattern?: string;
  /** Функция кастомной валидации. Возвращает строку с ошибкой или null. */
  validate?: (value: string) => string | null;
  /** Показывать ли ошибку (например, после отправки формы) */
  showError?: boolean;
  /** Кастомное сообщение об ошибке (если не задано, генерируется автоматически) */
  errorMessage?: string;
  /** Вызывать валидацию при потере фокуса */
  validateOnBlur?: boolean;
  /** Вызывать валидацию при изменении */
  validateOnChange?: boolean;
  /** Иконка слева (ReactNode) */
  leftIcon?: ReactNode;
  /** Иконка справа (ReactNode). Если не задана, для password показывается глаз, для search — крестик при наличии текста. */
  rightIcon?: ReactNode;
  /** Показывать кнопку очистки при наличии текста */
  clearable?: boolean;
  /** Варианты автодополнения */
  autocompleteOptions?: string[];
  /** Callback при выборе варианта автодополнения */
  onAutocompleteSelect?: (value: string) => void;
};

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">;
type TextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "type">;

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps | TextareaProps
>((props, ref) => {
  const {
    type = "text",
    error: externalError = false,
    disabled = false,
    className,
    multiline = false,
    withSearchIcon = type === "search",
    required = false,
    maxLength,
    pattern,
    validate,
    showError = false,
    errorMessage: externalErrorMessage,
    validateOnBlur = true,
    validateOnChange = false,
    leftIcon,
    rightIcon,
    clearable = false,
    autocompleteOptions = [],
    onAutocompleteSelect,
    onChange,
    onBlur,
    onFocus,
    value,
    defaultValue,
    placeholder,
    ...rest
  } = props;

  const [internalError, setInternalError] = useState(false);
  const [internalErrorMessage, setInternalErrorMessage] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Функция валидации
  const validateField = useCallback(
    (val: string): boolean => {
      let error = "";
      if (required && !val.trim()) {
        error = "Это поле обязательно для заполнения";
      } else if (maxLength && val.length > maxLength) {
        error = `Максимальная длина — ${maxLength} символов`;
      } else if (pattern && val) {
        const regex = new RegExp(pattern);
        if (!regex.test(val)) {
          error = "Неверный формат";
        }
      } else if (validate) {
        const customError = validate(val);
        if (customError) error = customError;
      }
      // Специфичные проверки по типу
      if (type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        error = "Введите корректный email";
      }
      if (type === "tel" && val && !/^[\d\s+\-()]+$/.test(val)) {
        error = "Введите корректный номер телефона";
      }
      if (type === "password" && val && val.length < 6) {
        error = "Пароль должен содержать не менее 6 символов";
      }

      setInternalErrorMessage(error);
      const hasError = !!error;
      setInternalError(hasError);
      return hasError;
    },
    [required, maxLength, pattern, validate, type],
  );

  // Эффект для внешнего управления ошибкой
  useEffect(() => {
    if (externalError || showError) {
      validateField(String(value || ""));
    }
  }, [externalError, showError, validateField, value]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = e.target.value;
    if (validateOnChange) {
      validateField(newValue);
    }
    if (autocompleteOptions.length > 0) {
      setShowAutocomplete(true);
      setSelectedOptionIndex(-1);
    }
    onChange?.(e as ChangeEvent<HTMLInputElement>);
  };

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // Закрыть автодополнение с задержкой, чтобы клик по варианту успел обработаться
    setTimeout(() => setShowAutocomplete(false), 200);
    if (validateOnBlur) {
      validateField(e.target.value);
    }
    if (onBlur) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onBlur(e as any);
    }
  };

  const handleFocus = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (autocompleteOptions.length > 0) {
      setShowAutocomplete(true);
    }
    if (onFocus) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onFocus(e as any);
    }
  };

  const handleClear = () => {
    if (disabled) return;
    const input = inputRef.current;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, "");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (onChange) {
        const event = { target: input } as ChangeEvent<HTMLInputElement>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange(event as any);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!showAutocomplete || autocompleteOptions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedOptionIndex((prev) =>
        prev < autocompleteOptions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedOptionIndex((prev) =>
        prev > 0 ? prev - 1 : autocompleteOptions.length - 1,
      );
    } else if (e.key === "Enter" && selectedOptionIndex >= 0) {
      e.preventDefault();
      const selected = autocompleteOptions[selectedOptionIndex];
      if (onAutocompleteSelect) onAutocompleteSelect(selected);
      if (onChange) {
        const event = {
          target: { value: selected },
        } as ChangeEvent<HTMLInputElement>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange(event as any);
      }
      setShowAutocomplete(false);
    }
  };

  const handleOptionClick = (option: string) => {
    if (onAutocompleteSelect) onAutocompleteSelect(option);
    if (onChange) {
      const event = {
        target: { value: option },
      } as ChangeEvent<HTMLInputElement>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange(event as any);
    }
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  const hasError = externalError || internalError;
  const errorMessage = externalErrorMessage || internalErrorMessage;
  const inputValue = value ?? defaultValue;
  const showClearButton = clearable && inputValue && !disabled;
  const isPassword = type === "password";
  const effectiveType = isPassword && passwordVisible ? "text" : type;

  // Определяем, какие иконки показывать
  let leftIconElement = leftIcon;
  let rightIconElement = rightIcon;

  if (withSearchIcon && type === "search" && !leftIcon) {
    leftIconElement = (
      <Icon
        name="search"
        size={20}
        className={styles.leftIcon}
        aria-hidden="true"
      />
    );
  }

  if (isPassword && !rightIcon) {
    rightIconElement = (
      <div
        className={styles.rightIcon}
        onClick={togglePasswordVisibility}
        role="button"
        tabIndex={0}
        aria-label={passwordVisible ? "Скрыть пароль" : "Показать пароль"}
      >
        <Icon
          name={passwordVisible ? "eye-slash" : "eye"}
          size={20}
          aria-hidden="true"
        />
      </div>
    );
  } else if (showClearButton && !rightIcon) {
    rightIconElement = (
      <Icon
        name="cross"
        size={20}
        className={styles.rightIcon}
        aria-hidden="true"
      />
    );
  }

  const hasLeftIcon = !!leftIconElement;
  const hasRightIcon = !!rightIconElement;

  const commonClasses = clsx(
    multiline ? styles.textarea : styles.input,
    hasLeftIcon && styles.inputWithLeftIcon,
    hasRightIcon && styles.inputWithRightIcon,
    hasError && styles.error,
    disabled && styles.disabled,
    className,
  );

  const inputProps = {
    ref: (node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLInputElement>).current = node;
    },
    type: effectiveType,
    className: commonClasses,
    disabled,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    value,
    defaultValue,
    placeholder,
    required,
    maxLength,
    ...(pattern ? { pattern } : {}),
    ...(rest as InputHTMLAttributes<HTMLInputElement>),
  };

  const textareaProps = {
    ref: (node: HTMLTextAreaElement) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement>).current = node;
    },
    className: commonClasses,
    disabled,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    value,
    defaultValue,
    placeholder,
    required,
    maxLength,
    ...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>),
  };

  const renderInput = () => {
    if (multiline) {
      return <textarea {...textareaProps} />;
    }

    return <input {...inputProps} />;
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {hasLeftIcon && <div className={styles.leftIcon}>{leftIconElement}</div>}
      {renderInput()}
      {hasRightIcon &&
        (isPassword && !rightIcon ? (
          // Для пароля используем VisibilityToggle, который уже содержит кнопку
          rightIconElement
        ) : (
          <div
            className={styles.rightIcon}
            onClick={handleClear}
            role="button"
            tabIndex={0}
            aria-label="Очистить"
          >
            {rightIconElement}
          </div>
        ))}
      {showAutocomplete && autocompleteOptions.length > 0 && (
        <ul className={styles.autocompleteList}>
          {autocompleteOptions.map((option, index) => (
            <li
              key={option}
              className={clsx(
                styles.autocompleteItem,
                index === selectedOptionIndex && styles.selected,
              )}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setSelectedOptionIndex(index)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      {hasError && errorMessage && (
        <p className={styles.errorText} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export type { InputProps, TextareaProps };
