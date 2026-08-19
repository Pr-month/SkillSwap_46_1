import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { Toast, ToastType } from "./types";
import { ToastContainer } from "./toast-container";

interface ToastContextValue {
  showToast: (message: string, type: ToastType, code?: string) => void;
  hideToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, code?: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, code }]);

      setTimeout(() => {
        hideToast(id);
      }, 3000);
    },
    [hideToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {createPortal(
        <ToastContainer toasts={toasts} onHide={hideToast} />,
        document.body,
      )}
    </ToastContext.Provider>
  );
};
