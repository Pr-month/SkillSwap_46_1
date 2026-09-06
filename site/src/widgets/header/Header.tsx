import { useLocation, useNavigate } from "react-router-dom";
import { setSearchQuery } from "../../services/filter/slice.ts";
import { useDispatch, useSelector } from "../../services/store.ts";
import { Avatar } from "../../shared/ui/avatar";
import { Button } from "../../shared/ui/button";
import { Logo } from "../../shared/ui/logo";
import { Popover } from "../../shared/ui/popover";
import { ProfileMenu } from "../../shared/ui/profile-menu";
import { Search } from "../../shared/ui/search";
import { SkillCategoryGroup } from "../../shared/ui/skill-category-group";
import { DeveloperCardGroup } from "../developer-card";
import styles from "./header.module.css";
import { logout } from "../../services/auth/slice";
import { HeaderIcons } from "../../shared/ui/header-icons";
import { developers } from "../../shared/constants/developers";
import { fetchLogout } from "../../services/auth/actions";

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state) => !!state.auth.currentUser);
  const user = useSelector((state) => state.auth.currentUser);

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));

    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleClear = () => {
    dispatch(setSearchQuery(""));
  };

  const handleLogoutClick = async () => {
    await dispatch(fetchLogout());
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <header className={styles.header}>
      <Logo />

      <nav className={styles.nav} aria-label="Основная навигация">
        <ul className={styles.navList}>
          <li>
            <Popover
              trigger={
                <Button variant="text" className={styles.navLink}>
                  О проекте
                </Button>
              }
              position="bottom"
              offset={8}
              closeOnEscape={true}
              closeOnOverlayClick={true}
            >
              <DeveloperCardGroup developers={developers} />
            </Popover>
          </li>

          <li>
            <Popover
              trigger={
                <Button
                  variant="text"
                  className={styles.catalogButton}
                  icon="chevron-down"
                  iconPosition="right"
                  iconSize={20}
                >
                  Все навыки
                </Button>
              }
              position="bottom"
              offset={12}
              closeOnEscape={true}
              closeOnOverlayClick={true}
              backdropType="transparent"
            >
              <div
                style={{
                  padding: "32px",
                  maxWidth: "1136px",
                  minWidth: "800px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  backgroundColor: "var(--color-bg-card)",
                  borderRadius: "12px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 24px 0",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Категории навыков
                </h3>
                <SkillCategoryGroup categories={[]} />
              </div>
            </Popover>
          </li>
        </ul>
      </nav>

      <div className={styles.searchWrapper}>
        <Search
          onSearch={handleSearch}
          onClear={handleClear}
          placeholder="Искать навык"
          aria-label="Поиск навыков"
        />
      </div>

      <HeaderIcons isUserAuth={isAuthenticated} />

      {isAuthenticated ? (
        <Popover
          trigger={
            <div className={styles.userTrigger}>
              <span className={styles.userName}>{user?.name}</span>
              <Avatar
                size="small"
                src={user?.avatar}
                name={user?.name}
                isAuthorized={true}
              />
            </div>
          }
          position="bottom"
          offset={8}
          closeOnEscape={true}
          closeOnOverlayClick={true}
          backdropType="transparent"
        >
          {({ close }) => (
            <ProfileMenu
              onLogoutClick={handleLogoutClick}
              onClosePopover={close}
            />
          )}
        </Popover>
      ) : (
        <div className={styles.authButtons}>
          <Button
            variant="secondary"
            className={styles.loginButton}
            onClick={() =>
              navigate("/login", { state: { from: location.pathname } })
            }
          >
            Войти
          </Button>

          <Button
            variant="primary"
            className={styles.registerButton}
            onClick={() =>
              navigate("/registration", { state: { from: location.pathname } })
            }
          >
            Зарегистрироваться
          </Button>
        </div>
      )}
    </header>
  );
}
