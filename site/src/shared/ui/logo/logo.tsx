import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./logo.module.css";
import type { LogoProps } from "./types";
import defaultLogo from "../../../assets/images/logo.png";

export function Logo({
  src = defaultLogo,
  alt = "Логотип SkillSwap",
  size = "md",
}: LogoProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  let sizeClass = "";
  let inlineSize = {};

  if (typeof size === "string") {
    sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];
  } else {
    inlineSize = { width: `${size}px`, height: `${size}px` };
  }

  const imageClass = `${styles.logoImage} ${sizeClass}`.trim();

  const logoContent = hasError ? (
    <span className={styles.fallbackText} style={inlineSize}>
      Логотип
    </span>
  ) : (
    <div className={styles.logoWithText}>
      <img
        className={imageClass}
        src={src}
        alt={alt}
        onError={handleError}
        style={inlineSize}
      />
      <span className={styles.logoText}>SkillSwap</span>
    </div>
  );

  return (
    <Link to="/" className={styles.logo} aria-label="SkillSwap — на главную">
      {logoContent}
    </Link>
  );
}
