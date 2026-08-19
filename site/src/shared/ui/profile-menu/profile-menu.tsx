import { type FC } from "react";
import { Link } from "react-router-dom";
import { Button } from "../button";
import styles from "./profile-menu.module.css";
import type { ProfileMenuProps } from "./types";
import { useNavigate } from "react-router-dom";

export const ProfileMenu: FC<
  ProfileMenuProps & { onClosePopover?: () => void }
> = ({
  onProfileClick,
  onLogoutClick,
  onRequestClose,
  className,
  onClosePopover,
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

  return (
    <div
      className={`${styles.menu} ${className || ""}`}
      role="menu"
      aria-label="Меню профиля"
    >
      <Link
        to="/profile"
        className={styles.menuItem}
        onClick={handleProfileClick}
        aria-label="Личный кабинет"
        role="menuitem"
      >
        <span className={styles.menuItemText}>Личный кабинет</span>
      </Link>

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
