import type { HTMLAttributes } from "react";
import type { IconName } from "../icon";

export type TAvatarSize = "large" | "small" | "profile";

export type TAvatarProps = {
  src?: string;
  name?: string;
  alt?: string;
  size?: TAvatarSize;
  isAuthorized?: boolean;
  fallbackIcon?: IconName;
  className?: string;
  isEditable?: boolean;
  onEdit?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;
