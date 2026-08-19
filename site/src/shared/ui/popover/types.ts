import type { ReactNode } from "react";

export type PopoverPosition = "bottom" | "top" | "left" | "right";

export type PopoverRenderProps = {
  close: () => void;
};

export type PopoverProps = {
  children: ReactNode | ((props: { close: () => void }) => React.ReactNode);
  trigger: ReactNode;
  position?: PopoverPosition;
  offset?: number;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  panelClassName?: string;
  zIndex?: number;
  backdropType?: "default" | "transparent" | "none";
  onOpen?: () => void;
  onClose?: () => void;
};
