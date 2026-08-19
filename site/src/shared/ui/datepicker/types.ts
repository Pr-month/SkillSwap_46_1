import type { FocusEventHandler } from "react";

export type TDatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  intlLocale?: string;
  datepickerLocale?: string;
};
