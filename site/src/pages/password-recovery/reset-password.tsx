import { useState, type FC, type SyntheticEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "../../services/store";
import { fetchResetPassword } from "../../services/auth/actions";
import { handleError } from "../../utils/errors/errorUtils";
import { AuthLayout } from "../../shared/ui/auth-layout";
import { PasswordInput } from "../../shared/ui/input";
import { Button } from "../../shared/ui/button";
import lightBulb from "../../assets/images/light-bulb.svg";
import styles from "./password-recovery.module.css";

export const ResetPassword: FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Токен не найден");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await dispatch(
        fetchResetPassword({ token, newPassword: password }),
      ).unwrap();
      setSuccess(true);
    } catch (err) {
      setError(handleError(err).message);
    }
  };

  if (success) {
    return (
      <AuthLayout
        type="login"
        title="Пароль изменен"
        image={lightBulb}
        description={{
          title: "Готово!",
          text: "Ваш пароль успешно обновлен",
        }}
      >
        <div className={styles.success}>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Войти
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      type="login"
      title="Новый пароль"
      image={lightBulb}
      description={{
        title: "Установите новый пароль",
        text: "Придумайте новый пароль для вашего аккаунта",
      }}
    >
      <div className={styles.login__form}>
        <form
          className={styles.form}
          name="reset-password"
          onSubmit={handleSubmit}
        >
          <div className={styles.form__with__error}>
            <div className={styles.form__fields}>
              <PasswordInput
                label="Новый пароль"
                placeholder="Введите новый пароль"
                onChange={(value) => setPassword(value)}
                value={password}
                error={!!error && !password}
                required
              />
              <PasswordInput
                label="Повторите пароль"
                placeholder="Повторите новый пароль"
                onChange={(value) => setConfirmPassword(value)}
                value={confirmPassword}
                error={!!error && !confirmPassword}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <div className={styles.forms__buttons}>
            <Button variant="primary" type="submit">
              Сохранить пароль
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
