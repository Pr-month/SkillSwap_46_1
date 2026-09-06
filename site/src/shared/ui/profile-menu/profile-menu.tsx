import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../button";
import styles from "./profile-menu.module.css";
import type { ProfileMenuProps } from "./types";
import { Icon } from "../icon";

export const ProfileMenu: FC<
  ProfileMenuProps & { onClosePopover?: () => void }
> = ({
  onProfileClick,
  onLogoutClick,
  onRequestClose,
  className,
  onClosePopover,
  isEmailConfirmed,
  onConfirmEmailClick,
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    onRequestClose?.();
    onProfileClick?.();
    onClosePopover?.();
  };

  const handleLogoutClick = async () => {
    if (onLogoutClick) {
      await onLogoutClick();
    }
    onClosePopover?.();
    navigate("/");
  };

  const handleConfirmEmailClick = async () => {
    if (onConfirmEmailClick) {
      await onConfirmEmailClick();
    }
    onClosePopover?.();
  };

  return (
    <div
      className={`${styles.menu} ${className || ""}`}
      role="menu"
      aria-label="Меню профиля"
    >
      <Button
        variant="text"
        className={styles.menuItem}
        onClick={handleProfileClick}
        icon="user"
        iconPosition="right"
        iconSize={20}
        aria-label="Личный кабинет"
        role="menuitem"
      >
        <span className={styles.menuItemText}>Личный кабинет</span>
      </Button>

      {isEmailConfirmed ? (
        <div className={styles.menuItem}>
          <span className={styles.menuItemText}>Почта подтверждена</span>
          <Icon name="like-filled" size={20} />
        </div>
      ) : (
        <Button
          variant="text"
          className={styles.menuItem}
          onClick={handleConfirmEmailClick}
          icon="notification-alert"
          iconPosition="right"
          iconSize={20}
          aria-label="Подтвердить почту"
          role="menuitem"
        >
          <span className={styles.menuItemText}>Подтвердить почту</span>
        </Button>
      )}

      <Button
        variant="text"
        className={styles.menuItem}
        onClick={handleLogoutClick}
        icon="logout"
        iconPosition="right"
        aria-label="Выйти из аккаунта"
        role="menuitem"
      >
        <span className={styles.menuItemText}>Выйти из аккаунта</span>
      </Button>
    </div>
  );
};
