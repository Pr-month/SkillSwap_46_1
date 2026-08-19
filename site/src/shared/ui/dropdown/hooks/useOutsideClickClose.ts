import { useEffect } from "react";

type UseOutsideClickClose = {
  isOpen: boolean;
  onChange: (newValue: boolean) => void;
  onClose?: () => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
};

export const useOutsideClickClose = ({
  isOpen,
  rootRef,
  onClose,
  onChange,
}: UseOutsideClickClose) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const { target } = event;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        if (isOpen && onClose) {
          onClose();
        }
        onChange?.(false);
      }
    };

    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [onClose, onChange, isOpen, rootRef]);
};
