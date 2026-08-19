import { memo } from "react";
import { NavLink } from "react-router-dom";
import styles from "./skillcard.module.css";
import { Button } from "../../shared/ui/button";
import { Tag } from "../../shared/ui/tag";
import { Toggle } from "../../shared/ui/toggle";
import type { TId } from "../../utils/types";

export type SkillCardProps = {
  id?: TId;
  avatar: string;
  name: string;
  city: string;
  age: number;
  canTeach: string;
  wantsToLearn: string[];
  isFavorite?: boolean;
  onFavoriteClick?: (id: TId) => void;
  teachColor?: string;
  wantsToLearnColors?: string[];
  disableDetails?: boolean;
  exchangeProposed?: boolean;
};

function getAgeLabel(age: number): string {
  const lastTwoDigits = age % 100;
  const lastDigit = age % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${age} лет`;
  }

  if (lastDigit === 1) {
    return `${age} год`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${age} года`;
  }

  return `${age} лет`;
}

export const SkillCard = memo(function SkillCard({
  id,
  avatar,
  name,
  city,
  age,
  canTeach,
  wantsToLearn,
  isFavorite = false,
  onFavoriteClick,
  teachColor,
  wantsToLearnColors = [],
  disableDetails = false,
  exchangeProposed = false,
}: SkillCardProps) {
  const ageLabel = getAgeLabel(age);

  const handleFavoriteChange = (): void => {
    if (id === undefined) {
      return;
    }

    onFavoriteClick?.(id);
  };

  const visibleLearnTags = wantsToLearn.slice(0, 2);
  const hiddenTagsCount = Math.max(wantsToLearn.length - 2, 0);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <img className={styles.avatar} src={avatar} alt={name} />

          <div className={styles.userInfo}>
            <h3 className={styles.name} title={name}>
              {name}
            </h3>

            <p className={styles.meta}>
              <span className={styles.metaCity}>{city}</span>
              <span className={styles.metaAge}>{ageLabel}</span>
            </p>
          </div>
        </div>

        <Toggle
          checked={isFavorite}
          onChange={handleFavoriteChange}
          checkedIcon="like-filled"
          checkedIconColor="#ABD27A"
          uncheckedIcon="like"
          uncheckedIconColor="currentColor"
          iconSize={24}
          className={styles.favoriteButton}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.skills}>
          <div className={styles.section}>
            <p className={styles.label}>Может научить:</p>

            <div className={styles.tags}>
              <Tag
                label={canTeach}
                className={`${styles.tag} ${styles.teachTag}`}
                backgroundColor={teachColor}
              />
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.label}>Хочет научиться:</p>

            <div className={`${styles.tags} ${styles.learnTags}`}>
              {visibleLearnTags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className={`${styles.tag} ${styles.learnTagItem}`}
                  style={{
                    backgroundColor: wantsToLearnColors[index],
                  }}
                  title={tag}
                >
                  <span className={styles.tagText}>{tag}</span>
                </span>
              ))}

              {hiddenTagsCount > 0 && (
                <span
                  className={`${styles.tag} ${styles.tagCount}`}
                  style={{ backgroundColor: "var(--color-tag-plus)" }}
                >
                  +{hiddenTagsCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {exchangeProposed && id && !disableDetails ? (
          <NavLink to={`/skill/${id}`} className={styles.detailsLink}>
            <Button
              className={`${styles.detailsButton} ${styles.exchangeButton}`}
              variant="secondary"
              icon="clock"
              iconPosition="left"
              fullWidth
            >
              Обмен предложен
            </Button>
          </NavLink>
        ) : id && !disableDetails ? (
          <NavLink to={`/skill/${id}`} className={styles.detailsLink}>
            <Button
              className={styles.detailsButton}
              variant="primary"
              fullWidth
            >
              Подробнее
            </Button>
          </NavLink>
        ) : (
          <Button
            className={styles.detailsButton}
            variant="primary"
            fullWidth
            disabled
          >
            Подробнее
          </Button>
        )}
      </div>
    </article>
  );
});
