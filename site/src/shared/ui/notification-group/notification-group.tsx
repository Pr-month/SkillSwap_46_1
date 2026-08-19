import React from "react";
import clsx from "clsx";
import { NotificationItem } from "../notification-item";
import styles from "./notification-group.module.css";

import type { TNotificationGroupProps } from "./types";

export const NotificationGroup: React.FC<TNotificationGroupProps> = ({
  notifications,
  onReadAll,
  onClearRead,
  className = "",
}) => {
  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead,
  );

  const readNotifications = notifications.filter(
    (notification) => notification.isRead,
  );

  return (
    <section className={clsx(styles.notificationGroup, className)}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Новые уведомления</h3>

          {unreadNotifications.length > 0 && (
            <button
              type="button"
              className={styles.sectionAction}
              onClick={onReadAll}
            >
              Прочитать все
            </button>
          )}
        </div>

        <div className={styles.list}>
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map(({ id, ...notification }) => (
              <NotificationItem
                key={id}
                {...notification}
                className={styles.item}
              />
            ))
          ) : (
            <p className={styles.emptyState}>Нет новых уведомлений</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Просмотренные</h3>

          {readNotifications.length > 0 && (
            <button
              type="button"
              className={styles.sectionAction}
              onClick={onClearRead}
            >
              Очистить
            </button>
          )}
        </div>

        <div className={styles.list}>
          {readNotifications.length > 0 ? (
            readNotifications.map(({ id, ...notification }) => (
              <NotificationItem
                key={id}
                {...notification}
                className={styles.item}
              />
            ))
          ) : (
            <p className={styles.emptyState}>Список уведомлений пуст</p>
          )}
        </div>
      </div>
    </section>
  );
};
