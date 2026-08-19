import type { Dispatch, SetStateAction } from "react";

export type SkillCardGroupHeaderProps = {
  title: string;
  actionText?: string;
  onActionClick?: () => void;
  hideAction?: boolean;
  isSorted: boolean;
  sortOrder: "new" | "old";
  setSortOrder: Dispatch<SetStateAction<"new" | "old">>;
  className?: string;
};
