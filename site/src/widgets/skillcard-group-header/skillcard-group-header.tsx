import clsx from "clsx";

import { Icon } from "../../shared/ui/icon";

import styles from "./skillcard-group-header.module.css";
import type { SkillCardGroupHeaderProps } from "./types";

export const SkillCardGroupHeader = ({
  title,
  actionText = "Смотреть все",
  onActionClick,
  hideAction = false,
  isSorted,
  sortOrder,
  setSortOrder,
  className,
}: SkillCardGroupHeaderProps) => {
  const shouldShowAction = !hideAction;

  return (
    <div className={clsx(styles.header, className)}>
      <h2 className={styles.title}>{title}</h2>

      {shouldShowAction && (
        <button className={styles.action} type="button" onClick={onActionClick}>
          <span>{actionText}</span>
          <Icon name="chevron-right" size={20} className={styles.actionIcon} />
        </button>
      )}
      {isSorted && (
        <button
          className={styles.action}
          type="button"
          onClick={() =>
            setSortOrder((prev) => (prev === "new" ? "old" : "new"))
          }
        >
          <Icon name="sort" size={20} />
          <span>
            {sortOrder === "new" ? "Сначала новые" : "Сначала старые"}
          </span>
        </button>
      )}
    </div>
  );
};
