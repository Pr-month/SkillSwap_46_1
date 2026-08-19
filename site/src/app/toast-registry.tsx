import { useEffect } from "react";
import { useToast } from "../shared/ui/toast";
import { registerToastHandler } from "../utils/toast";

export const ToastRegistry = () => {
  const { showToast } = useToast();

  useEffect(() => {
    registerToastHandler(showToast);
  }, [showToast]);

  return null;
};
