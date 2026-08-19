import { Icon } from "../icon/icon";
import type { TSkillCategoryProps } from "./types";
import styles from "./skill-category.module.css";

export const SkillCategory = ({
  title,
  iconName,
  iconBackgroundColor,
  skills,
}: TSkillCategoryProps) => {
  return (
    <div className={styles.category}>
      <div className={styles.header}>
        <div
          className={styles.iconWrapper}
          style={{ backgroundColor: iconBackgroundColor }}
        >
          <Icon name={iconName} size={24} />
        </div>

        <h3 className={styles.title}>{title}</h3>
      </div>

      <ul className={styles.skillsList}>
        {skills.length === 0 ? (
          <li className={styles.skillItem}>Список навыков пуст</li>
        ) : (
          skills.map((skill) => (
            <li key={skill} className={styles.skillItem}>
              {skill}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
