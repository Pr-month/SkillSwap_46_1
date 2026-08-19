import React, { useState, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import styles from "./tag.module.css";

const DEFAULT_MAX_VISIBLE = 2;

export interface TagProps {
  /** Текст тега */
  label: string;
  /** Цвет фона тега */
  backgroundColor?: string;
  /** Цвет текста тега */
  textColor?: string;
  /** Дополнительный CSS класс */
  className?: string;
  /** ARIA метка */
  ariaLabel?: string;
  /** Обработчик клика */
  onClick?: () => void;
}

export const Tag = ({
  label,
  backgroundColor,
  textColor,
  className,
  ariaLabel,
  onClick,
}: TagProps) => {
  const tagClasses = clsx(styles.tag, className);
  const tagStyle: React.CSSProperties = {};

  if (backgroundColor) tagStyle.backgroundColor = backgroundColor;
  if (textColor) tagStyle.color = textColor;

  return (
    <div
      className={tagClasses}
      style={tagStyle}
      role={onClick ? "button" : "listitem"}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || label}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span
        className={styles.text}
        style={textColor ? { color: textColor } : undefined}
      >
        {label}
      </span>
    </div>
  );
};

export interface TagGroupProps {
  /** Массив тегов */
  tags: Array<Omit<TagProps, "onClick">>;
  /** Максимальное количество видимых тегов (по умолчанию 2) */
  maxVisible?: number;
  /** Текст для тега more */
  moreLabel?: string;
  /** Дополнительный CSS класс */
  className?: string;
  /** Цвет фона для тега more */
  moreBackgroundColor?: string;
  /** Цвет текста для тега more */
  moreTextColor?: string;
}

export const TagGroup = ({
  tags,
  maxVisible = DEFAULT_MAX_VISIBLE,
  moreLabel = "+{count}",
  className,
  moreBackgroundColor,
  moreTextColor,
}: TagGroupProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const moreTagRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPopupOpen) {
        setIsPopupOpen(false);
        moreTagRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isPopupOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreTagRef.current &&
        !moreTagRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMoreTagClick = useCallback(() => {
    setIsPopupOpen((prev) => !prev);
  }, []);

  const handleMoreTagKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsPopupOpen((prev) => !prev);
    }
  }, []);

  if (!Array.isArray(tags) || tags.length === 0) {
    console.warn("Группе тегов требуется непустой массив тэгов!");
    return null;
  }

  const effectiveMaxVisible =
    maxVisible <= 0 ? DEFAULT_MAX_VISIBLE : maxVisible;
  const visibleTags = tags.slice(0, effectiveMaxVisible);
  const hiddenTags = tags.slice(effectiveMaxVisible);
  const hiddenCount = hiddenTags.length;
  const showMoreTag = hiddenCount > 0;
  const moreTagText = moreLabel.replace("{count}", hiddenCount.toString());

  return (
    <div
      className={clsx(styles.group, className)}
      role="list"
      aria-label="Группа тегов"
    >
      {visibleTags.map((tag, index) => (
        <Tag key={`${tag.label}-${index}`} {...tag} />
      ))}

      {showMoreTag && (
        <div
          ref={moreTagRef}
          className={styles.moreTagContainer}
          onClick={handleMoreTagClick}
          onKeyDown={handleMoreTagKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Показать ещё ${hiddenCount} тегов`}
          aria-expanded={isPopupOpen}
          aria-haspopup="true"
        >
          <div
            className={clsx(styles.tag, styles.categoryMore)}
            style={{
              backgroundColor: moreBackgroundColor,
              color: moreTextColor,
            }}
          >
            <span
              className={styles.text}
              style={moreTextColor ? { color: moreTextColor } : undefined}
            >
              {moreTagText}
            </span>
          </div>

          {isPopupOpen && (
            <div
              ref={popupRef}
              className={styles.popup}
              role="dialog"
              aria-label="Скрытые теги"
            >
              <div className={styles.hiddenTagsContainer}>
                {hiddenTags.map((tag, index) => (
                  <Tag key={`hidden-${tag.label}-${index}`} {...tag} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
