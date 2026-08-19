import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconName } from "../icon";

export type TButtonVariant = "primary" | "secondary" | "text";
export type TIconPosition = "left" | "right";

export type TButtonProps = {
  /** Содержимое кнопки (текст) */
  children?: ReactNode;
  /** Вариант отображения */
  variant?: TButtonVariant;
  /** Отключенное состояние */
  disabled?: boolean;
  /** Тип кнопки для форм */
  type?: "button" | "submit" | "reset";
  /** Дополнительные CSS-классы */
  className?: string;
  /** Название иконки из библиотеки */
  icon?: IconName;
  /** Размер иконки (по умолчанию 20px) */
  iconSize?: number;
  /** Позиция иконки */
  iconPosition?: TIconPosition;
  /** Растянуть на всю ширину контейнера */
  fullWidth?: boolean;
  /** Обработчик клика */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "disabled" | "onClick"
>;
