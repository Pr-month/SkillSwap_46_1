import styles from "./footer.module.css";
import { Logo } from "../../shared/ui/logo";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoColumn}>
          <Logo />

          <p className={styles.copyright}>SkillSwap — 2026</p>
        </div>

        <nav className={styles.nav} aria-label="Навигация в подвале">
          <ul className={styles.linkWithMarkers}>
            <li>
              <a className={styles.link} href="#">
                О проекте
              </a>
            </li>
            <li>
              <a className={styles.link} href="#">
                Все навыки
              </a>
            </li>
          </ul>

          <ul className={styles.linkColumn}>
            <li>
              <a className={styles.link} href="#">
                Контакты
              </a>
            </li>
            <li>
              <a className={styles.link} href="#">
                Блог
              </a>
            </li>
          </ul>

          <ul className={styles.linkColumn}>
            <li>
              <a className={styles.link} href="#">
                Политика конфиденциальности
              </a>
            </li>
            <li>
              <a className={styles.link} href="#">
                Пользовательское соглашение
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
