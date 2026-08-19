import styles from "./confirm-offer.module.css";
import type { ConfirmOfferProps } from "./types";
import { SkillDetails } from "../../../widgets/skill-details/skill-details";

export const ConfirmOffer = ({
  skillTitle,
  category,
  subcategory,
  description,
  images,
  onEditClick,
  onDoneClick,
}: ConfirmOfferProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ваше предложение</h2>
        <p className={styles.description}>
          Пожалуйста, проверьте и подтвердите правильность данных
        </p>
      </div>
      <div className={styles.content}>
        <SkillDetails
          title={skillTitle}
          category={category}
          subcategory={subcategory}
          description={description}
          images={images}
          mode="registration"
          onEditClick={onEditClick}
          onDoneClick={onDoneClick}
        />
      </div>
    </div>
  );
};
