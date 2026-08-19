import clsx from "clsx";
import { Button } from "../button";
import type { TSidebarItemProps } from "./types";
import styles from "./SidebarItem.module.css";

export const SidebarItem = (props: TSidebarItemProps) => {
  return (
    <Button
      variant="text"
      icon={props.icon}
      iconSize={24}
      iconPosition="left"
      onClick={props.onClick}
      className={clsx(styles.sidebar_item, props.isActive && styles.active)}
    >
      <span className={styles.label}>{props.text}</span>
    </Button>
  );
};
