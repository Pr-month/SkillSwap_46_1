export type ProfileMenuProps = {
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
  onRequestClose?: () => void;
  className?: string;
  onClosePopover?: () => void;
  isEmailConfirmed: boolean;
  onConfirmEmailClick?: () => Promise<void>;
};
