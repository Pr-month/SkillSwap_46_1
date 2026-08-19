import React, { useState } from "react";
import clsx from "clsx";

import { Icon } from "../icon";
import styles from "./avatar.module.css";

import type { TAvatarProps } from "./types";
import type { IconName } from "../icon";

export const Avatar: React.FC<TAvatarProps> = ({
  src,
  name,
  alt,
  size = "large",
  isAuthorized = true,
  fallbackIcon = "user",
  className = "",
  isEditable = false,
  onEdit,
  ...restProps
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  const hasSource = Boolean(src);
  const shouldShowUnauthorizedIcon = size === "small" && !isAuthorized;
  const shouldShowImage =
    hasSource && !hasImageError && !shouldShowUnauthorizedIcon;

  const rootClasses = clsx(
    styles.avatar,
    styles[`avatar_size_${size}`],
    className,
  );

  const iconName: IconName = shouldShowUnauthorizedIcon ? "user" : fallbackIcon;

  const iconSize = size === "profile" ? 64 : size === "large" ? 32 : 20;

  const editIconSize = size === "profile" ? 24 : size === "large" ? 16 : 14;

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      className={rootClasses}
      aria-label={name || "Аватар пользователя"}
      {...restProps}
    >
      {shouldShowImage ? (
        <img
          key={src}
          className={styles.avatar__image}
          src={src}
          alt={alt || name || "Аватар пользователя"}
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span className={styles.avatar__icon} aria-hidden="true">
          <Icon name={iconName} size={iconSize} />
        </span>
      )}

      {isEditable && (
        <button
          type="button"
          className={clsx(
            styles.avatar__editButton,
            styles[`avatar__editButton_size_${size}`],
          )}
          aria-label="Редактировать изображение профиля"
          onClick={handleEditClick}
        >
          <Icon name="gallery-edit" size={editIconSize} />
        </button>
      )}
    </div>
  );
};
