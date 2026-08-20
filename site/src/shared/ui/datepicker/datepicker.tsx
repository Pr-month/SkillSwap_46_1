import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type MouseEvent,
  type ReactElement,
} from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import clsx from "clsx";

import { Button } from "../button";

import "react-datepicker/dist/react-datepicker.css";
import styles from "./datepicker.module.css";
import type { TDatePickerProps } from "./types";
import { Icon } from "../icon";

registerLocale("ru", ru);

const DEFAULT_INTL_LOCALE = "ru-RU";
const DEFAULT_DATEPICKER_LOCALE = "ru";
const DEFAULT_YEAR_RANGE = 100;
const DISPLAY_DATE_FORMAT = "dd.MM.yyyy";

const formatDateValue = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

const formatDisplayDateValue = (date: Date): string => {
  return format(date, DISPLAY_DATE_FORMAT);
};

const parseDateValue = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const parseDisplayDateValue = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();
  const match = normalizedValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayString, monthString, yearString] = match;

  const day = Number(dayString);
  const month = Number(monthString);
  const year = Number(yearString);

  if (!day || !month || !year) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const formatDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) {
    return day;
  }

  if (digits.length <= 4) {
    return `${day}.${month}`;
  }

  return `${day}.${month}.${year}`;
};

const autocorrectDisplayDateValue = (value: string): string => {
  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

  if (!match) {
    return value;
  }

  const [, dayString, monthString, yearString] = match;

  let day = Number(dayString);
  let month = Number(monthString);
  const year = Number(yearString);

  if (!year) {
    return value;
  }

  month = clamp(month, 1, 12);

  const maxDay = getDaysInMonth(year, month);
  day = clamp(day, 1, maxDay);

  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${yearString}`;
};

const isDateWithinRange = ({
  date,
  minDate,
  maxDate,
}: {
  date: Date;
  minDate: Date | null;
  maxDate: Date | null;
}): boolean => {
  const normalizedDate = getStartOfDay(date);

  if (minDate && normalizedDate.getTime() < minDate.getTime()) {
    return false;
  }

  if (maxDate && normalizedDate.getTime() > maxDate.getTime()) {
    return false;
  }

  return true;
};

const getEffectiveMinDate = ({
  minDate,
  disablePast,
}: {
  minDate?: string;
  disablePast?: boolean;
}): Date | null => {
  const parsedMinDate = parseDateValue(minDate);
  const today = getStartOfDay(new Date());

  if (disablePast && parsedMinDate) {
    return parsedMinDate.getTime() > today.getTime() ? parsedMinDate : today;
  }

  if (disablePast) {
    return today;
  }

  return parsedMinDate;
};

const getEffectiveMaxDate = ({
  maxDate,
  disableFuture,
}: {
  maxDate?: string;
  disableFuture?: boolean;
}): Date | null => {
  const parsedMaxDate = parseDateValue(maxDate);
  const today = getStartOfDay(new Date());

  if (disableFuture && parsedMaxDate) {
    return parsedMaxDate.getTime() < today.getTime() ? parsedMaxDate : today;
  }

  if (disableFuture) {
    return today;
  }

  return parsedMaxDate;
};

const getMonthOptions = (locale: string): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { month: "long" });

  return Array.from({ length: 12 }, (_, index) =>
    formatter.format(new Date(2026, index, 1)),
  );
};

const getYearOptions = ({
  minDate,
  maxDate,
  selectedDate,
}: {
  minDate: Date | null;
  maxDate: Date | null;
  selectedDate: Date | null;
}): number[] => {
  const currentYear = new Date().getFullYear();
  const fallbackEndYear = selectedDate?.getFullYear() ?? currentYear;
  const fallbackStartYear = fallbackEndYear - DEFAULT_YEAR_RANGE;

  const startYear = minDate?.getFullYear() ?? fallbackStartYear;
  const endYear = maxDate?.getFullYear() ?? fallbackEndYear;

  return Array.from(
    { length: Math.max(endYear - startYear + 1, 1) },
    (_, index) => startYear + index,
  );
};

const getOutOfRangeMessage = ({
  minDate,
  maxDate,
}: {
  minDate: Date | null;
  maxDate: Date | null;
}): string => {
  if (minDate && maxDate) {
    return `Укажите корректную дату: вам должно быть от 18 до 112 лет`;
  }

  if (minDate) {
    return `Введите дату не раньше ${formatDisplayDateValue(minDate)}`;
  }

  if (maxDate) {
    return `Введите дату не позже ${formatDisplayDateValue(maxDate)}`;
  }

  return "Введите допустимую дату";
};

export const DatePicker = ({
  value = "",
  onChange,
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  placeholder,
  helperText,
  disabled = false,
  error = false,
  className,
  name,
  required = false,
  autoFocus = false,
  onFocus,
  onBlur,
  intlLocale = DEFAULT_INTL_LOCALE,
  datepickerLocale = DEFAULT_DATEPICKER_LOCALE,
}: TDatePickerProps): ReactElement => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedDate = useMemo(() => parseDateValue(value), [value]);

  const effectiveMinDate = useMemo(() => {
    return getEffectiveMinDate({ minDate, disablePast });
  }, [minDate, disablePast]);

  const effectiveMaxDate = useMemo(() => {
    return getEffectiveMaxDate({ maxDate, disableFuture });
  }, [maxDate, disableFuture]);

  const monthOptions = useMemo(() => getMonthOptions(intlLocale), [intlLocale]);

  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | null>(selectedDate);
  const [inputValue, setInputValue] = useState<string>(
    selectedDate ? formatDisplayDateValue(selectedDate) : "",
  );
  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? new Date());
  const [internalErrorText, setInternalErrorText] = useState<string>("");

  useEffect(() => {
    setDraftDate(selectedDate);
    setInputValue(selectedDate ? formatDisplayDateValue(selectedDate) : "");
    setViewDate(selectedDate ?? new Date());
    setInternalErrorText("");
  }, [selectedDate]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentMouseDown = (event: globalThis.MouseEvent): void => {
      const target = event.target as Node | null;

      if (!target || !rootRef.current?.contains(target)) {
        setDraftDate(selectedDate);
        setInputValue(selectedDate ? formatDisplayDateValue(selectedDate) : "");
        setInternalErrorText("");
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [isOpen, selectedDate]);

  const yearOptions = useMemo(() => {
    return getYearOptions({
      minDate: effectiveMinDate,
      maxDate: effectiveMaxDate,
      selectedDate: draftDate ?? selectedDate,
    });
  }, [draftDate, effectiveMaxDate, effectiveMinDate, selectedDate]);

  const resolvedHelperText = internalErrorText || helperText;
  const resolvedError = Boolean(internalErrorText) || error;

  const openCalendar = (): void => {
    if (disabled) {
      return;
    }

    const nextDate =
      draftDate ?? selectedDate ?? effectiveMaxDate ?? new Date();

    setDraftDate(draftDate ?? selectedDate);
    setViewDate(nextDate);
    setIsOpen(true);
  };

  const closeCalendar = (): void => {
    setIsOpen(false);
  };

  const handleCancel = (): void => {
    setDraftDate(selectedDate);
    setInputValue(selectedDate ? formatDisplayDateValue(selectedDate) : "");
    setViewDate(selectedDate ?? new Date());
    setInternalErrorText("");
    closeCalendar();
  };

  const handleConfirm = (): void => {
    if (!draftDate) {
      setInternalErrorText("Выберите дату");
      return;
    }

    const normalizedDate = getStartOfDay(draftDate);

    if (
      !isDateWithinRange({
        date: normalizedDate,
        minDate: effectiveMinDate,
        maxDate: effectiveMaxDate,
      })
    ) {
      setInternalErrorText(
        getOutOfRangeMessage({
          minDate: effectiveMinDate,
          maxDate: effectiveMaxDate,
        }),
      );
      return;
    }

    setInternalErrorText("");
    onChange(formatDateValue(normalizedDate));
    setInputValue(formatDisplayDateValue(normalizedDate));
    setViewDate(normalizedDate);
    closeCalendar();
  };

  const handleCalendarChange = (date: Date | null): void => {
    if (!date) {
      return;
    }

    const normalizedDate = getStartOfDay(date);

    if (
      !isDateWithinRange({
        date: normalizedDate,
        minDate: effectiveMinDate,
        maxDate: effectiveMaxDate,
      })
    ) {
      setInternalErrorText(
        getOutOfRangeMessage({
          minDate: effectiveMinDate,
          maxDate: effectiveMaxDate,
        }),
      );
      return;
    }

    setInternalErrorText("");
    setDraftDate(normalizedDate);
    setInputValue(formatDisplayDateValue(normalizedDate));
    setViewDate(normalizedDate);
  };

  const commitInputValue = (): void => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      setDraftDate(null);
      setInternalErrorText("");
      onChange("");
      return;
    }

    const correctedValue = autocorrectDisplayDateValue(trimmedValue);
    setInputValue(correctedValue);

    const parsedDate = parseDisplayDateValue(correctedValue);

    if (!parsedDate) {
      setInternalErrorText("Введите корректную дату");
      return;
    }

    const normalizedDate = getStartOfDay(parsedDate);

    if (
      !isDateWithinRange({
        date: normalizedDate,
        minDate: effectiveMinDate,
        maxDate: effectiveMaxDate,
      })
    ) {
      setInternalErrorText(
        getOutOfRangeMessage({
          minDate: effectiveMinDate,
          maxDate: effectiveMaxDate,
        }),
      );
      return;
    }

    setInternalErrorText("");
    setDraftDate(normalizedDate);
    setViewDate(normalizedDate);
    setInputValue(formatDisplayDateValue(normalizedDate));
    onChange(formatDateValue(normalizedDate));
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ): void => {
    const formattedValue = formatDateInput(event.target.value);
    setInputValue(formattedValue);

    if (internalErrorText) {
      setInternalErrorText("");
    }

    if (!formattedValue) {
      setDraftDate(null);
      onChange("");
    }
  };

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = (
    event,
  ): void => {
    const nextFocusedNode = event.relatedTarget as Node | null;

    if (nextFocusedNode && rootRef.current?.contains(nextFocusedNode)) {
      return;
    }

    commitInputValue();
    onBlur?.(event);
  };

  const handleInputFocus: FocusEventHandler<HTMLInputElement> = (
    event,
  ): void => {
    onFocus?.(event);
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitInputValue();
      closeCalendar();
      (event.currentTarget as HTMLInputElement).blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
      (event.currentTarget as HTMLInputElement).blur();
    }
  };

  const handleIconMouseDown = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
  };

  const handleIconClick = (): void => {
    if (isOpen) {
      closeCalendar();
      return;
    }

    openCalendar();
  };

  return (
    <div ref={rootRef} className={clsx(styles.datepicker, className)}>
      <div className={styles.datepicker__inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder ?? "дд.мм.гггг"}
          disabled={disabled}
          name={name}
          required={required}
          autoFocus={autoFocus}
          className={clsx(styles.datepicker__input, {
            [styles.datepicker__input_error]: resolvedError,
            [styles.datepicker__input_disabled]: disabled,
          })}
        />

        <button
          type="button"
          className={styles.datepicker__iconButton}
          onMouseDown={handleIconMouseDown}
          onClick={handleIconClick}
          aria-label="Открыть календарь"
          disabled={disabled}
        >
          <Icon name="calendar" size={20} color="currentColor" />
        </button>
      </div>

      {isOpen ? (
        <div className={styles.datepicker__popper}>
          <div className={styles.datepicker__calendar}>
            <ReactDatePicker
              inline
              selected={draftDate}
              onChange={handleCalendarChange}
              minDate={effectiveMinDate ?? undefined}
              maxDate={effectiveMaxDate ?? undefined}
              disabled={disabled}
              locale={datepickerLocale}
              openToDate={viewDate}
              calendarStartDay={1}
              formatWeekDay={(dayName) => {
                const weekDayMap: Record<string, string> = {
                  понедельник: "Пн",
                  вторник: "Вт",
                  среда: "Ср",
                  четверг: "Чт",
                  пятница: "Пт",
                  суббота: "Сб",
                  воскресенье: "Вс",
                };

                return weekDayMap[dayName.toLowerCase()] ?? dayName.slice(0, 2);
              }}
              renderCustomHeader={({
                date,
                changeMonth,
                changeYear,
              }): ReactElement => {
                return (
                  <div className={styles.datepicker__header}>
                    <select
                      className={styles.datepicker__select}
                      value={date.getMonth()}
                      onChange={(event) => {
                        changeMonth(Number(event.target.value));
                        setViewDate(
                          new Date(
                            date.getFullYear(),
                            Number(event.target.value),
                            1,
                          ),
                        );
                      }}
                    >
                      {monthOptions.map((monthName, index) => (
                        <option key={monthName} value={index}>
                          {monthName[0].toUpperCase() + monthName.slice(1)}
                        </option>
                      ))}
                    </select>

                    <select
                      className={styles.datepicker__select}
                      value={date.getFullYear()}
                      onChange={(event) => {
                        changeYear(Number(event.target.value));
                        setViewDate(
                          new Date(
                            Number(event.target.value),
                            date.getMonth(),
                            1,
                          ),
                        );
                      }}
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }}
            />

            <div className={styles.datepicker__actions}>
              <Button
                variant="secondary"
                className={styles.datepicker__actionButton}
                onClick={handleCancel}
                type="button"
              >
                Отменить
              </Button>

              <Button
                variant="primary"
                className={styles.datepicker__actionButton}
                onClick={handleConfirm}
                type="button"
                disabled={!draftDate}
              >
                Выбрать
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {resolvedHelperText ? (
        <p
          className={clsx(styles.datepicker__helperText, {
            [styles.datepicker__helperText_error]: resolvedError,
          })}
        >
          {resolvedHelperText}
        </p>
      ) : null}
    </div>
  );
};
