import type { TNotificationItemProps } from "../notification-item/types";

export type TNotificationGroupItem = TNotificationItemProps & {
  id: string;
};

export type TNotificationGroupProps = {
  notifications: TNotificationGroupItem[];
  onReadAll?: () => void;
  onClearRead?: () => void;
  className?: string;
};
