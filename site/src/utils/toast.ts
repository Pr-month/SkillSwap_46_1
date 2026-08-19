type ToastType = "success" | "error" | "info";
type ToastHandler = (message: string, type: ToastType, code?: string) => void;

let toastHandler: ToastHandler | null = null;
let isToastActive = false;

export const registerToastHandler = (handler: ToastHandler) => {
  toastHandler = handler;
};

export const showToast = (
  message: string,
  type: ToastType = "info",
  code?: string,
) => {
  if (!toastHandler) {
    return;
  }

  if (isToastActive) {
    return;
  }

  isToastActive = true;
  toastHandler(message, type, code);

  setTimeout(() => {
    isToastActive = false;
  }, 5000);
};
