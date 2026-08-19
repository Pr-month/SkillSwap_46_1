import { useContext, useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import type { THeaderIconsProps } from "./types";
import { ThemeContext } from "../../../app/theme-context";
import { Toggle } from "../toggle";
import { Icon } from "../icon";
import { Popover } from "../popover";
import { NotificationGroup } from "../notification-group";
import type { TNotificationGroupItem } from "../notification-group/types";
import styles from "./header.icons.module.css";
import { useDispatch, useSelector } from "../../../services/store";
import { fetchMyRequests } from "../../../services/request/actions";

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

type TNotificationWithRoute = TNotificationGroupItem & {
  targetUserId?: string;
};

const formatDateLabel = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  const currentDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const targetDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();

  const diffDays = Math.round((currentDay - targetDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "сегодня";
  if (diffDays === 1) return "вчера";

  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

const readStorageArray = (key: string | null) => {
  if (!key) return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStorageArray = (key: string | null, value: string[]) => {
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const HeaderIcons: React.FC<THeaderIconsProps> = ({ isUserAuth }) => {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const requestsReceived = useSelector((state) => state.requests.received);
  const requestsSent = useSelector((state) => state.requests.sent);
  const users = useSelector((state) => state.user.list);
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const readStorageKey = currentUser?.id
    ? `header-notifications-read-${currentUser.id}`
    : null;

  const hiddenStorageKey = currentUser?.id
    ? `header-notifications-hidden-${currentUser.id}`
    : null;

  const readNotificationIds = readStorageArray(readStorageKey);
  const hiddenNotificationIds = readStorageArray(hiddenStorageKey);

  useEffect(() => {
    if (isUserAuth) {
      dispatch(fetchMyRequests());
    }
  }, [dispatch, isUserAuth]);

  const notifications = useMemo<TNotificationWithRoute[]>(() => {
    const getUserNameById = (userId?: string) => {
      if (!userId) return "Пользователь";

      const user = users.find((item) => String(item.id) === String(userId));
      return user?.name || "Пользователь";
    };

    const receivedNotifications: TNotificationWithRoute[] = requestsReceived
      .filter((request) => request.status === "pending" || !request.status)
      .map((request) => ({
        id: `received-${request.id}`,
        title: `${getUserNameById(request.fromUserId)} предлагает вам обмен`,
        description: "Примите обмен, чтобы обсудить детали",
        dateLabel: formatDateLabel(request.createdAt),
        isRead: readNotificationIds.includes(`received-${request.id}`),
        actionLabel: "Перейти",
        onActionClick: undefined,
        targetUserId: request.fromUserId,
      }));

    const acceptedStatuses = ["accepted", "inProgress", "done"];

    const sentNotifications: TNotificationWithRoute[] = requestsSent
      .filter(
        (request) =>
          !!request.status && acceptedStatuses.includes(request.status),
      )
      .map((request) => ({
        id: `sent-${request.id}`,
        title: `${getUserNameById(request.toUserId)} принял ваш обмен`,
        description: "Перейдите в профиль, чтобы обсудить детали",
        dateLabel: formatDateLabel(request.updatedAt || request.createdAt),
        isRead: readNotificationIds.includes(`sent-${request.id}`),
        actionLabel: "Перейти",
        onActionClick: undefined,
        targetUserId: request.toUserId,
      }));

    return [...receivedNotifications, ...sentNotifications].filter(
      (notification) => !hiddenNotificationIds.includes(notification.id),
    );
  }, [
    requestsReceived,
    requestsSent,
    users,
    readNotificationIds,
    hiddenNotificationIds,
  ]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleReadAll = () => {
    const unreadIds = notifications
      .filter((item) => !item.isRead)
      .map((item) => item.id);

    const nextReadIds = [...new Set([...readNotificationIds, ...unreadIds])];
    writeStorageArray(readStorageKey, nextReadIds);
    forceUpdate();
  };

  const handleClearRead = () => {
    const readIds = notifications
      .filter((item) => item.isRead)
      .map((item) => item.id);

    const nextHiddenIds = [...new Set([...hiddenNotificationIds, ...readIds])];
    writeStorageArray(hiddenStorageKey, nextHiddenIds);
    forceUpdate();
  };

  const handleNotificationClick = (
    notification: TNotificationWithRoute,
    close: () => void,
  ) => {
    const nextReadIds = [...new Set([...readNotificationIds, notification.id])];
    writeStorageArray(readStorageKey, nextReadIds);

    close();
    forceUpdate();

    if (notification.targetUserId) {
      navigate(`/skill/${notification.targetUserId}`);
      return;
    }

    navigate("/profile");
  };

  const handleFavoritesClick = () => {
    navigate("/profile/favorites");
  };

  return (
    <>
      {!isUserAuth ? (
        <div className={styles.themeToggle}>
          <Toggle
            checked={isDarkTheme}
            onChange={toggleTheme}
            checkedIcon="moon"
            uncheckedIcon="sun"
            iconSize={24}
            aria-label="Переключить тему"
          />
        </div>
      ) : (
        <div className={clsx(styles.themeToggle, styles.items)}>
          <Toggle
            checked={isDarkTheme}
            onChange={toggleTheme}
            checkedIcon="moon"
            uncheckedIcon="sun"
            iconSize={24}
            aria-label="Переключить тему"
          />

          <Popover
            position="bottom"
            offset={12}
            panelClassName={styles.notificationPopover}
            trigger={
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Открыть уведомления"
              >
                <Icon
                  name={unreadCount > 0 ? "notification-alert" : "notification"}
                  size={24}
                />
              </button>
            }
          >
            {({ close }) => (
              <NotificationGroup
                notifications={notifications.map((item) => ({
                  ...item,
                  onActionClick: () => handleNotificationClick(item, close),
                }))}
                onReadAll={handleReadAll}
                onClearRead={handleClearRead}
              />
            )}
          </Popover>

          <button
            type="button"
            className={clsx(styles.iconButton, styles.favoriteButton)}
            aria-label="Перейти в избранное"
            onClick={handleFavoritesClick}
          >
            <Icon name="like" size={24} />
          </button>
        </div>
      )}
    </>
  );
};
