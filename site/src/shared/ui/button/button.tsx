import { Icon } from "../icon";
import styles from "./button.module.css";
import clsx from "clsx";

import type { TButtonProps } from "./types";

export const Button: React.FC<TButtonProps> = ({
  children,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
  icon,
  iconSize = 20,
  iconPosition = "left",
  fullWidth = false,
  onClick,
  ...restProps
}) => {
  const buttonClasses = clsx(
    styles.button,
    styles[`button_type_${variant}`],
    {
      [styles.button_disabled]: disabled,
      [styles.button_full_width]: fullWidth,
      [styles.button_with_icon]: icon,
      [styles.button_icon_left]: icon && iconPosition === "left",
      [styles.button_icon_right]: icon && iconPosition === "right",
    },
    className,
  );

  const iconElement = icon ? (
    <span className={styles.button__icon} aria-hidden="true">
      <Icon
        name={icon}
        size={iconSize}
        className={styles.button__icon_svg}
        color="currentColor"
      />
    </span>
  ) : null;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      {...restProps}
    >
      {iconElement && iconPosition === "left" && iconElement}
      <span className={styles.button__text}>{children}</span>
      {iconElement && iconPosition === "right" && iconElement}
    </button>
  );
};

Button.displayName = "Button";
