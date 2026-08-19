import {
  Popover as HeadlessPopover,
  PopoverButton,
  PopoverPanel,
  PopoverBackdrop,
} from "@headlessui/react";
import type { PopoverProps } from "./types";
import { useRef } from "react";
import styles from "./popover.module.css";
import clsx from "clsx";

export const Popover = ({
  children,
  trigger,
  position = "bottom",
  offset = 8,
  closeOnOverlayClick = true,
  backdropType = "default",
  className,
  panelClassName,
  zIndex = 99,
  onOpen,
  onClose,
}: PopoverProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const anchorPosition = {
    bottom: "bottom",
    top: "top",
    left: "left",
    right: "right",
  }[position] as "bottom" | "top" | "left" | "right";

  const showBackdrop = closeOnOverlayClick && backdropType !== "none";

  return (
    <HeadlessPopover className={clsx(styles.popover, className)}>
      {({ open, close }) => {
        if (open) {
          onOpen?.();
        } else {
          onClose?.();
        }

        return (
          <>
            <PopoverButton ref={buttonRef} as="div" className={styles.trigger}>
              {trigger}
            </PopoverButton>

            {showBackdrop && (
              <PopoverBackdrop
                className={clsx(
                  styles.backdrop,
                  backdropType === "transparent" && styles.transparent,
                )}
                style={{ zIndex }}
                onClick={() => {
                  if (closeOnOverlayClick) {
                    close();
                  }
                }}
              />
            )}

            <PopoverPanel
              anchor={{
                to: anchorPosition,
                gap: offset,
              }}
              className={clsx(styles.panel, panelClassName)}
              style={{ zIndex: zIndex + 1 }}
              transition
            >
              {typeof children === "function" ? children({ close }) : children}
            </PopoverPanel>
          </>
        );
      }}
    </HeadlessPopover>
  );
};
