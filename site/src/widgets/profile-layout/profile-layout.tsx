import { type FC, type ReactNode, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileSidebar } from "../../shared/ui/profile-sidebar";
import { profileSidebarItems } from "../../shared/ui/profile-sidebar/ProfileSidebar";
import styles from "./profile-layout.module.css";

type ProfileLayoutProps = {
  children: ReactNode;
};

export const ProfileLayout: FC<ProfileLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = useMemo(
    () =>
      profileSidebarItems.map((item) => ({
        ...item,
        isActive:
          (item.key === "personalData" && location.pathname === "/profile") ||
          (item.key === "favorites" &&
            location.pathname === "/profile/favorites"),
        onClick: () => {
          if (item.key === "favorites") {
            navigate("/profile/favorites");
            return;
          }

          if (item.key === "personalData") {
            navigate("/profile");
            return;
          }

          console.log(`Раздел пока не подключен: ${item.key}`);
        },
      })),
    [location.pathname, navigate],
  );

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <ProfileSidebar items={sidebarItems} />
        </aside>

        <div className={styles.main}>{children}</div>
      </div>
    </section>
  );
};
