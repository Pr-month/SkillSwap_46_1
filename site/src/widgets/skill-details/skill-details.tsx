import clsx from "clsx";
import styles from "./skill-details.module.css";
import type { SkillDetailsProps } from "./types";

import { ImageGallery } from "../../features/image-gallery/image-gallery";
import { Button } from "../../shared/ui/button";

export const SkillDetails = ({
  title,
  category,
  subcategory,
  description,
  images,
  mode,
  exchangeProposed = false,
  onExchangeClick,
  onEditClick,
  onDoneClick,
  className,
}: SkillDetailsProps) => {
  const categoryLabel =
    category && subcategory && category !== subcategory
      ? `${category} / ${subcategory}`
      : category || subcategory || "";

  return (
    <section className={clsx(styles.root, className)}>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.textContent}>
            <div className={styles.header}>
              <h2 title={title} className={styles.title}>
                {title}
              </h2>

              {categoryLabel && (
                <p className={styles.category}>{categoryLabel}</p>
              )}
            </div>

            {description && (
              <div
                className={styles.descriptionWrapper}
                tabIndex={0}
                aria-label="Описание навыка"
              >
                <p className={styles.description}>{description}</p>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {mode === "catalog" && (
              <Button
                variant={exchangeProposed ? "secondary" : "primary"}
                onClick={exchangeProposed ? undefined : onExchangeClick}
                className={clsx(
                  styles.actionButton,
                  exchangeProposed && styles.actionButtonStatus,
                )}
                icon={exchangeProposed ? "clock" : undefined}
                iconPosition="left"
                fullWidth
              >
                {exchangeProposed ? "Обмен предложен" : "Предложить обмен"}
              </Button>
            )}

            {mode === "registration" && (
              <>
                <Button
                  variant="secondary"
                  onClick={onEditClick}
                  className={styles.actionButton}
                  icon="edit"
                  iconPosition="right"
                  iconSize={20}
                  fullWidth
                >
                  Редактировать
                </Button>

                <Button
                  variant="primary"
                  onClick={onDoneClick}
                  className={styles.actionButton}
                  fullWidth
                >
                  Готово
                </Button>
              </>
            )}
          </div>
        </div>

        {images && (
          <div className={styles.rightColumn}>
            <ImageGallery images={images} />
          </div>
        )}
      </div>
    </section>
  );
};
