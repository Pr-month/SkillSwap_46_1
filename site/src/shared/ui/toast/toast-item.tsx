import React, { useEffect, useState } from "react";
import styles from "./toast.module.css";
import type { Toast, ToastType } from "./types";
import { Icon } from "../icon";
import type { IconName } from "../icon";

interface ToastItemProps {
  toast: Toast;
  onHide: (id: number) => void;
}

const iconMap: Record<ToastType, IconName> = {
  success: "lifestyle",
  error: "global",
  info: "idea",
};

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onHide(toast.id);
    }, 200);
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isVisible ? styles.visible : ""}`}
      role="status"
      aria-live="polite"
    >
      <Icon name={iconMap[toast.type]} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className={styles.message}>{toast.message}</span>
        {toast.code && (
          <span className={styles.message}>Код ошибки: {toast.code}</span>
        )}
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Закрыть уведомление"
      >
        <Icon name={"cross"} />
      </button>
    </div>
  );
};
