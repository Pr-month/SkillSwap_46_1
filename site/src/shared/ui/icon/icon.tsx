//#region imports
import React from "react";
import clsx from "clsx";
import styles from "./icon.module.css";
import ArrowLeftIcon from "../../../assets/icons/arrow-left.svg?react";
import ArrowSquareLeftIcon from "../../../assets/icons/arrow-square-left.svg?react";
import ArrowSquareRightIcon from "../../../assets/icons/arrow-square-right.svg?react";
import AddIcon from "../../../assets/icons/add.svg?react";
import BookIcon from "../../../assets/icons/book.svg?react";
import BriefcaseIcon from "../../../assets/icons/briefcase.svg?react";
import CalendarIcon from "../../../assets/icons/calendar.svg?react";
import CheckboxDoneIcon from "../../../assets/icons/checkbox-done.svg?react";
import CheckboxEmptyIcon from "../../../assets/icons/checkbox-empty.svg?react";
import CheckboxRemoveIcon from "../../../assets/icons/checkbox-remove.svg?react";
import ChevronDownIcon from "../../../assets/icons/chevron-down.svg?react";
import ChevronUpIcon from "../../../assets/icons/chevron-up.svg?react";
import ChevronRightIcon from "../../../assets/icons/chevron-right.svg?react";
import ChevronLeftIcon from "../../../assets/icons/chevron-left.svg?react";
import ClockIcon from "../../../assets/icons/clock.svg?react";
import CountIcon from "../../../assets/icons/count.svg?react";
import CrossIcon from "../../../assets/icons/cross.svg?react";
import DoneIcon from "../../../assets/icons/done.svg?react";
import EditIcon from "../../../assets/icons/edit.svg?react";
import EyeIcon from "../../../assets/icons/eye.svg?react";
import EyeSlashIcon from "../../../assets/icons/eye-slash.svg?react";
import FilterSquareIcon from "../../../assets/icons/filter-square.svg?react";
import GalleryAddIcon from "../../../assets/icons/gallery-add.svg?react";
import GalleryEditIcon from "../../../assets/icons/gallery-edit.svg?react";
import GlobalIcon from "../../../assets/icons/global.svg?react";
import HomeIcon from "../../../assets/icons/home.svg?react";
import IdeaIcon from "../../../assets/icons/idea.svg?react";
import LifestyleIcon from "../../../assets/icons/lifestyle.svg?react";
import LikeIcon from "../../../assets/icons/like.svg?react";
import LikeFilledIcon from "../../../assets/icons/like-filled.svg?react";
import LogoutIcon from "../../../assets/icons/logout.svg?react";
import MoonIcon from "../../../assets/icons/moon.svg?react";
import MoreSquareIcon from "../../../assets/icons/more-square.svg?react";
import NotificationIcon from "../../../assets/icons/notification.svg?react";
import NotificationAlertIcon from "../../../assets/icons/notification-alert.svg?react";
import PaletteIcon from "../../../assets/icons/palette.svg?react";
import PlusCircleIcon from "../../../assets/icons/plus-circle.svg?react";
import RadiobuttonActiveIcon from "../../../assets/icons/radiobutton-active.svg?react";
import RadiobuttonEmptyIcon from "../../../assets/icons/radiobutton-empty.svg?react";
import RequestIcon from "../../../assets/icons/request.svg?react";
import ScrollIcon from "../../../assets/icons/scroll.svg?react";
import ScrollSquareIcon from "../../../assets/icons/scroll-square.svg?react";
import SearchIcon from "../../../assets/icons/search.svg?react";
import ShareIcon from "../../../assets/icons/share.svg?react";
import SortIcon from "../../../assets/icons/sort.svg?react";
import SunIcon from "../../../assets/icons/sun.svg?react";
import ToggleDefaultCheckedIcon from "../../../assets/icons/toggle-default-checked.svg?react";
import ToggleDefaultUncheckedIcon from "../../../assets/icons/toggle-default-unchecked.svg?react";
import UserIcon from "../../../assets/icons/user.svg?react";
import UserCircleIcon from "../../../assets/icons/user-circle.svg?react";
import GithubIcon from "../../../assets/icons/github.svg?react";
import MessageTextIcon from "../../../assets/icons/message-text.svg?react";
import AppleIcon from "../../../assets/images/Apple.svg?react";
//#endregion imports

export const ICON_NAMES = [
  "arrow-left",
  "arrow-square-left",
  "arrow-square-right",
  "apple",
  "add",
  "book",
  "briefcase",
  "calendar",
  "checkbox-done",
  "checkbox-empty",
  "checkbox-remove",
  "chevron-down",
  "chevron-up",
  "chevron-right",
  "chevron-left",
  "clock",
  "count",
  "cross",
  "done",
  "edit",
  "eye",
  "eye-slash",
  "filter-square",
  "gallery-add",
  "gallery-edit",
  "github",
  "global",
  "home",
  "idea",
  "lifestyle",
  "like",
  "like-filled",
  "logout",
  "moon",
  "more-square",
  "notification",
  "notification-alert",
  "palette",
  "plus-circle",
  "radiobutton-active",
  "radiobutton-empty",
  "request",
  "scroll",
  "scroll-square",
  "search",
  "share",
  "sort",
  "sun",
  "toggle-default-checked",
  "toggle-default-unchecked",
  "user",
  "user-circle",
  "message-text",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
  alt?: string;
}

const iconMap: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  "arrow-left": ArrowLeftIcon,
  "arrow-square-left": ArrowSquareLeftIcon,
  "arrow-square-right": ArrowSquareRightIcon,
  apple: AppleIcon,
  add: AddIcon,
  book: BookIcon,
  briefcase: BriefcaseIcon,
  calendar: CalendarIcon,
  "checkbox-done": CheckboxDoneIcon,
  "checkbox-empty": CheckboxEmptyIcon,
  "checkbox-remove": CheckboxRemoveIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-up": ChevronUpIcon,
  "chevron-right": ChevronRightIcon,
  "chevron-left": ChevronLeftIcon,
  clock: ClockIcon,
  count: CountIcon,
  cross: CrossIcon,
  done: DoneIcon,
  edit: EditIcon,
  eye: EyeIcon,
  "eye-slash": EyeSlashIcon,
  "filter-square": FilterSquareIcon,
  "gallery-add": GalleryAddIcon,
  "gallery-edit": GalleryEditIcon,
  github: GithubIcon,
  global: GlobalIcon,
  home: HomeIcon,
  idea: IdeaIcon,
  lifestyle: LifestyleIcon,
  like: LikeIcon,
  "like-filled": LikeFilledIcon,
  logout: LogoutIcon,
  moon: MoonIcon,
  "more-square": MoreSquareIcon,
  notification: NotificationIcon,
  "notification-alert": NotificationAlertIcon,
  palette: PaletteIcon,
  "plus-circle": PlusCircleIcon,
  "radiobutton-active": RadiobuttonActiveIcon,
  "radiobutton-empty": RadiobuttonEmptyIcon,
  request: RequestIcon,
  scroll: ScrollIcon,
  "scroll-square": ScrollSquareIcon,
  search: SearchIcon,
  share: ShareIcon,
  sort: SortIcon,
  sun: SunIcon,
  "toggle-default-checked": ToggleDefaultCheckedIcon,
  "toggle-default-unchecked": ToggleDefaultUncheckedIcon,
  user: UserIcon,
  "user-circle": UserCircleIcon,
  "message-text": MessageTextIcon,
};

export const Icon = ({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  alt = "",
  style,
  ...props
}: IconProps) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Иконка "${name}" не найдена!`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={clsx(styles.icon, className)}
      style={{
        ...style,
      }}
      color={color}
      aria-label={alt}
      aria-hidden={!alt}
      {...props}
    />
  );
};
