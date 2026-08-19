import type { ReactNode } from "react";

export type ModalUIProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  // default - стандартная ширина окна
  // wide - широкая модалка, используется для подтверждения навыка после регистрации
  size?: "default" | "wide";
  // если true - окно должно закрываться, а если false - нет
  // например, модалка для подтверждения навыка не должна закрываться,
  // т.к. нужно выбрать "Готово" или "Редактировать"
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
};
