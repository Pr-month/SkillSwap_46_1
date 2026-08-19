import { DeveloperCard } from "./developer-card";
import styles from "./developer-card-group.module.css";

interface Developer {
  name: string;
  role: string;
  avatar: string;
  github: string;
  contributions: string[];
}

interface DeveloperCardGroupProps {
  developers: Developer[];
  title?: string;
}

export const DeveloperCardGroup = ({
  developers,
  title = "Команда разработки SkillSwap",
}: DeveloperCardGroupProps) => {
  return (
    <div className={styles.container}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <div className={styles.grid}>
        {developers.map((dev, index) => (
          <DeveloperCard
            key={`${dev.github}-${index}`}
            name={dev.name}
            role={dev.role}
            avatar={dev.avatar}
            github={dev.github}
            contributions={dev.contributions}
          />
        ))}
      </div>
    </div>
  );
};
