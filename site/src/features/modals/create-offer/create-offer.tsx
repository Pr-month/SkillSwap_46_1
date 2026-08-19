import styles from "./create-offer.module.css";
import type { CreateOfferProps, CreateOfferVariant } from "./types";
import type { IconName } from "../../../shared/ui/icon";
import { Button } from "../../../shared/ui/button";
import { Icon } from "../../../shared/ui/icon";

type CreateOfferContent = {
  title: string;
  description: string;
  buttonText: string;
  iconName: IconName;
};

const contentMap: Record<CreateOfferVariant, CreateOfferContent> = {
  accepted: {
    title: "Ваше предложение создано",
    description: "Теперь вы можете предложить обмен",
    buttonText: "Готово",
    iconName: "done",
  },
  created: {
    title: "Ваше предложение создано",
    description: "Теперь вы можете предложить обмен",
    buttonText: "Готово",
    iconName: "user-circle",
  },
  registration: {
    title: "Необходимо зарегистрироваться",
    description: "Для создания предложения необходимо зарегистрироваться",
    buttonText: "Продолжить",
    iconName: "user-circle",
  },
  sent: {
    title: "Вы предложили обмен",
    description: "Теперь дождитесь подтверждения. Вам придёт уведомление",
    buttonText: "Готово",
    iconName: "notification",
  },
};

export const CreateOffer = ({ variant, onActionClick }: CreateOfferProps) => {
  const currentContent = contentMap[variant];

  return (
    <div className={styles.root}>
      <div className={styles.iconWrapper}>
        <Icon name={currentContent.iconName} size={100} />
      </div>

      <div className={styles.textBlock}>
        <h2 className={styles.title}>{currentContent.title}</h2>
        <p className={styles.description}>{currentContent.description}</p>
      </div>

      <Button onClick={onActionClick} className={styles.button} fullWidth>
        {currentContent.buttonText}
      </Button>
    </div>
  );
};
