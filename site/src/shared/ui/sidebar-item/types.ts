import type { IconName } from "../icon";

export type TSidebarItemProps = {
  key: string;
  text: string;
  icon: IconName;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};
