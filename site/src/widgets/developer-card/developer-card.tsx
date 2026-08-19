import { Button } from "../../shared/ui/button";
import { Avatar } from "../../shared/ui/avatar";
import styles from "./developer-card.module.css";

interface DeveloperCardProps {
  name: string;
  role: string;
  avatar: string;
  github: string;
  contributions: string[];
}

export const DeveloperCard = ({
  name,
  role,
  avatar,
  github,
  contributions,
}: DeveloperCardProps) => {
  return (
    <div className={styles.card}>
      <Avatar
        src={avatar}
        name={name}
        size="large"
        fallbackIcon="user"
        className={styles.avatar}
      />

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.role}>{role}</p>

        <div className={styles.contributions}>
          <p className={styles.contributions_title}>Вклад в проект:</p>
          <ul className={styles.contributions_list}>
            {contributions.map((item, index) => (
              <li key={index} className={styles.contributions_item}>
                {item || "—"}
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="text"
          icon="github"
          iconPosition="left"
          iconSize={16}
          onClick={() => window.open(github, "_blank")}
          className={styles.github_button}
        >
          GitHub
        </Button>
      </div>
    </div>
  );
};
