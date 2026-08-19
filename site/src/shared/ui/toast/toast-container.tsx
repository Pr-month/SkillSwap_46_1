import React from "react";
import styles from "./toast.module.css";
import type { Toast } from "./types";
import { ToastItem } from "./toast-item";

interface ToastContainerProps {
  toasts: Toast[];
  onHide: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onHide,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
};
