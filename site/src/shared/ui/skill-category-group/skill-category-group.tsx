import { SkillCategory } from "../skill-category/skill-category";
import type { TSkillCategoryGroupProps } from "./types";
import styles from "./skill-category-group.module.css";

export const SkillCategoryGroup = ({
  categories,
}: TSkillCategoryGroupProps) => {
  return (
    <div className={styles.group}>
      {categories.map((category, index) => (
        <div key={index} className={styles.category}>
          <SkillCategory
            title={category.title}
            iconName={category.iconName}
            iconBackgroundColor={category.iconBackgroundColor}
            skills={category.skills}
          />
        </div>
      ))}
    </div>
  );
};
