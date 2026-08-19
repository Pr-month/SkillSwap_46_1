import { useState } from "react";
import clsx from "clsx";
import styles from "./step-image.module.css";
import type { StepImageProps } from "./types";

export const StepImage = ({
  imageSrc,
  title = "Добро пожаловать в SkillSwap!",
  message = "Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми",
  className,
  alt = "Иллюстрация шага",
}: StepImageProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div
        className={clsx(styles.container, styles.fallbackContainer, className)}
      >
        <div
          className={styles.fallback}
          role="img"
          aria-label="Placeholder image"
        >
          <span className={styles.fallbackText}>StepImage</span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.imageContainer}>
        <img
          src={imageSrc}
          alt={alt}
          className={styles.image}
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      <div className={styles.textContainer}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

StepImage.displayName = "StepImage";
