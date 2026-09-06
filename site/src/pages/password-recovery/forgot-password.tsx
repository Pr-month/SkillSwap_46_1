import { useState, type FC, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "../../services/store";
import { fetchForgotPassword } from "../../services/auth/actions";
import { handleError } from "../../utils/errors/errorUtils";
import { AuthLayout } from "../../shared/ui/auth-layout";
import { BasicInput } from "../../shared/ui/input";
import { Button } from "../../shared/ui/button";
import styles from "./password-recovery.module.css";
import lightBulb from "../../assets/images/light-bulb.svg";

export const ForgotPassword: FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await dispatch(fetchForgotPassword(email)).unwrap();
      setSuccess(true);
    } catch (err) {
      setError(handleError(err).message);
    }
  };

  if (success) {
    return (
      <AuthLayout
        type="login"
        title="Письмо отправлено"
        image={lightBulb}
        description={{
          title: "Проверьте вашу почту",
          text: `Мы отправили ссылку для сброса пароля на ${email}`,
        }}
      >
        <div className={styles.success}>
          <p>Перейдите по ссылке из письма, чтобы установить новый пароль.</p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Вернуться ко входу
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      type="login"
      title="Восстановление пароля"
      image={lightBulb}
      description={{
        title: "Забыли пароль?",
        text: "Укажите email, и мы отправим ссылку для сброса пароля",
      }}
    >
      <div className={styles.login__form}>
        <form
          className={styles.form}
          name="forgot-password"
          onSubmit={handleSubmit}
        >
          <div className={styles.form__with__error}>
            <div className={styles.form__fields}>
              <BasicInput
                label="Email"
                placeholder="Введите email"
                onChange={(value) => setEmail(value)}
                value={email}
                error={!!error && !email}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <div className={styles.forms__buttons}>
            <Button variant="primary" type="submit">
              Отправить
            </Button>
            <Link to="/login" className={styles.backLink}>
              Назад ко входу
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
