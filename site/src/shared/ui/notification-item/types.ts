export type TNotificationItemProps = {
  title: string;
  description: string;
  dateLabel: string;
  isRead?: boolean;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
};
