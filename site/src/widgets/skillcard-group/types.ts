import type { Dispatch, SetStateAction } from "react";
import type { SkillCardProps } from "../skillcard";

export type SkillCardGroupProps = {
  title: string;
  cards: SkillCardProps[];
  actionText?: string;
  onActionClick?: () => void;
  hideAction?: boolean;
  className?: string;
  initialVisibleCount?: number;
  isSorted: boolean;
  sortOrder: "new" | "old";
  setSortOrder: Dispatch<SetStateAction<"new" | "old">>;
  infiniteScroll?: boolean;
};
