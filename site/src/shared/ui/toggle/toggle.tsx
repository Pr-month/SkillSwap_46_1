import React from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../icon";
import styles from "./toggle.module.css";

export interface ToggleProps {
  /** Состояние переключателя */
  checked: boolean;
  /* * Колбэк при изменении */
  onChange: (checked: boolean) => void;
  /** Блокировка */
  disabled?: boolean;
  /** Дополнительный CSS класс */
  className?: string;
  /** Название иконки для включенного состояния (из библиотеки иконок) */
  checkedIcon?: IconName;
  /** Цвет иконки для включенного состояния */
  checkedIconColor?: string;
  /** Название иконки для выключенного состояния (из библиотеки иконок) */
  uncheckedIcon?: IconName;
  /** Цвет иконки для выключенного состояния */
  uncheckedIconColor?: string;
  /** Размер иконок */
  iconSize?: number;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
  checkedIcon,
  checkedIconColor = "currentColor",
  uncheckedIcon,
  uncheckedIconColor = "currentColor",
  iconSize = 24,
}) => {
  const hasCustomIcons = checkedIcon && uncheckedIcon;
  const checkedIconToUse = hasCustomIcons
    ? checkedIcon
    : "toggle-default-checked";

  const uncheckedIconToUse = hasCustomIcons
    ? uncheckedIcon
    : "toggle-default-unchecked";

  const content = (
    <Icon
      name={checked ? checkedIconToUse : uncheckedIconToUse}
      size={iconSize}
      color={checked ? checkedIconColor : uncheckedIconColor}
    />
  );
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        styles.button,
        disabled && styles.disabled,
        hasCustomIcons && styles.iconButton,
        className,
      )}
      disabled={disabled}
      type="button"
      aria-pressed={checked}
    >
      {content}
    </button>
  );
};
