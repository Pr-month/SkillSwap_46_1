import React from "react";
import clsx from "clsx";
import { Button } from "../button";
import { Icon } from "../icon";
import styles from "./notification-item.module.css";

import type { TNotificationItemProps } from "./types";

export const NotificationItem: React.FC<TNotificationItemProps> = ({
  title,
  description,
  dateLabel,
  isRead = false,
  actionLabel = "Перейти",
  onActionClick,
  className = "",
}) => {
  const showActionButton = !isRead;

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onActionClick?.();
  };

  return (
    <article
      className={clsx(
        styles.notificationItem,
        isRead ? styles.read : styles.unread,
        className,
      )}
    >
      <div className={styles.iconWrapper}>
        <Icon name="idea" size={40} className={styles.icon} />
      </div>

      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h4 className={styles.title}>{title}</h4>
            <span className={styles.date}>{dateLabel}</span>
          </div>

          <p className={styles.description}>{description}</p>
        </div>

        {showActionButton && (
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={handleActionClick}
              className={styles.actionButton}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
};
