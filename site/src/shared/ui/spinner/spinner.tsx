import type { FC } from "react";
import clsx from "clsx";
import styles from "./spinner.module.css";

type SpinnerProps = {
  className?: string;
  size?: "small" | "medium" | "large";
};

export const Spinner: FC<SpinnerProps> = ({ className, size = "medium" }) => {
  return (
    <span
      className={clsx(
        styles.spinner,
        styles[`spinner_size_${size}`],
        className,
      )}
      aria-label="Загрузка"
    />
  );
};
