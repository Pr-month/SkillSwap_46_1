import React from "react";
import { Button } from "../../shared/ui/button";
import styles from "./error-details.module.css";

export interface ErrorDetailsProps {
  /** Путь к изображению для ошибки */
  image?: string;
  /** Заголовок ошибки */
  title?: string;
  /** Сообщение об ошибке */
  message?: string;
  /** Обработчик для кнопки "На главную" */
  onHomeClick?: () => void;
  /** Обработчик для кнопки "Сообщить об ошибке" */
  onReportClick?: () => void;
  /** Дополнительный CSS класс */
  className?: string;
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({
  image,
  title = "Страница не найдена",
  message = "К сожалению, эта страница недоступна. Вернитесь на главную страницу или попробуйте позже.",
  onHomeClick,
  onReportClick,
  className = "",
}) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={`${styles.errorDetails} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={styles.errorDetails__content}>
        {image && !imageError && (
          <div className={styles.errorDetails__illustration}>
            <img
              src={image}
              alt={title}
              className={styles.errorDetails__image}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        <div className={styles.errorDetails__text}>
          <h1 className={styles.errorDetails__title}>{title}</h1>
          <p className={styles.errorDetails__message}>{message}</p>
        </div>

        <div className={styles.errorDetails__buttons}>
          <Button
            variant="secondary"
            onClick={onReportClick}
            className={styles.errorDetails__button}
            aria-label="Сообщить об ошибке"
          >
            Сообщить об ошибке
          </Button>
          <Button
            variant="primary"
            onClick={onHomeClick}
            className={styles.errorDetails__button}
            aria-label="Перейти на главную страницу"
          >
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};
