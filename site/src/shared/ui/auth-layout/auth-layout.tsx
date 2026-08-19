import type { FC } from "react";
import styles from "./auth-layout.module.css";
import { Stepper } from "../stepper";
import type { AuthLayoutProps } from "./types";
import { Logo } from "../logo";
import { StepImage } from "../step-image";

export const AuthLayout: FC<AuthLayoutProps> = ({
  type,
  title,
  currentStep,
  totalSteps,
  children,
  image,
  description,
}) => (
  <div className={styles.container}>
    <Logo />
    <div className={styles.layout}>
      {type === "register" && totalSteps && currentStep ? (
        <Stepper currentStep={currentStep} totalSteps={totalSteps} />
      ) : (
        <h2 className={styles.title}>{title}</h2>
      )}
      <div className={styles.content}>
        <div className={styles.form__section}>{children}</div>
        <div className={styles.description__section}>
          <StepImage
            imageSrc={image}
            title={description?.title}
            message={description?.text}
          />
        </div>
      </div>
    </div>
  </div>
);
