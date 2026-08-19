import type { MouseEvent } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ModalUIProps } from "./types";
import clsx from "clsx";
import styles from "./modal-ui.module.css";

export const ModalUI = ({
  isOpen,
  onClose,
  children,
  size = "default",
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalUIProps) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  // защита от закрытия по клику внутри модального окна
  const handleModalClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={clsx(styles.modal, {
          [styles.modal_size_default]: size === "default",
          [styles.modal_size_wide]: size === "wide",
        })}
        onClick={handleModalClick}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
