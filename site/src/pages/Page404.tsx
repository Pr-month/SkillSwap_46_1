import React from "react";
import { ErrorContent } from "../shared/ui/error-content";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css"; // если есть, иначе можно не использовать

const Page404: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <ErrorContent
        code={404}
        image="/src/assets/images/error-404.svg"
        message="Запрашиваемая страница не существует. Проверьте адрес или вернитесь на главную."
        actionText="На главную"
        onActionClick={handleGoHome}
        align="center"
      />
    </div>
  );
};

export default Page404;
