import { SidebarItem } from "../sidebar-item";
import type { TSidebarItemProps } from "../sidebar-item/types";
import styles from "./ProfileSidebar.module.css";
export const profileSidebarItems: TSidebarItemProps[] = [
  {
    key: "requests",
    text: "Заявки",
    icon: "request",
  },
  {
    key: "exchanges",
    text: "Мои обмены",
    icon: "message-text",
  },
  {
    key: "favorites",
    text: "Избранное",
    icon: "like",
  },
  {
    key: "mySkills",
    text: "Мои навыки",
    icon: "idea",
  },
  {
    key: "personalData",
    text: "Личные данные",
    icon: "user",
  },
];

type ProfileSidebarProps = {
  items?: Array<TSidebarItemProps>;
};

export const ProfileSidebar = ({
  items = profileSidebarItems,
}: ProfileSidebarProps) => (
  <div className={styles.container}>
    {items.map((item) => (
      <SidebarItem
        key={item.key}
        text={item.text}
        icon={item.icon}
        onClick={item.onClick}
        isActive={item.isActive}
      />
    ))}
  </div>
);
