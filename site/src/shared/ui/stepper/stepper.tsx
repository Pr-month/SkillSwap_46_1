import clsx from "clsx";
import styles from "./stepper.module.css";

type StepperProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export const Stepper = ({
  currentStep,
  totalSteps,
  className,
}: StepperProps) => {
  const validTotalSteps = Math.max(1, totalSteps);
  const validCurrentStep = Math.min(Math.max(currentStep, 1), validTotalSteps);

  const steps = Array.from(
    { length: validTotalSteps },
    (_, index) => index + 1,
  );

  return (
    <div className={clsx(styles.container, className)}>
      <p className={styles.label}>
        Шаг {validCurrentStep} из {validTotalSteps}
      </p>

      <div className={styles.steps}>
        {steps.map((step) => (
          <span
            key={step}
            className={clsx(
              styles.step,
              step <= validCurrentStep && styles.active,
            )}
          />
        ))}
      </div>
    </div>
  );
};
