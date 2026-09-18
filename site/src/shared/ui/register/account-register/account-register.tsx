import { useState, type FC, type SyntheticEvent } from "react";
import type { AccountRegisterProps } from "./types";
import styles from "./account-register.module.css";
import lightBulb from "../../../../assets/images/light-bulb.svg";
import googleLogo from "../../../../assets/images/Google.svg";
import yandexLogo from "../../../../assets/images/Yandex_icon.svg";
import divider from "../../../../assets/images/Divider.svg";
import { Button } from "../../button";
import { BasicInput } from "../../input/basic-input";
import { AuthLayout } from "../../auth-layout";
import { PasswordInput } from "../../input";
import { useDispatch } from "../../../../services/store";

import { fetchCheckUser } from "../../../../services/auth/actions";
import { USE_TOAST } from "../../../../config/apiConfig";
import { Link } from "react-router-dom";

export const AccountRegister: FC<AccountRegisterProps> = ({
  email,
  setEmail,
  onNext,
  password,
  setPassword,
}) => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validate = () => {
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 8) {
      newErrors.password = "Минимум 8 символов";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Должна быть заглавная буква";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Должна быть цифра";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await dispatch(fetchCheckUser({ email, password })).unwrap();
      onNext();
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      const statusCode =
        error?.status || error?.statusCode || error?.response?.status;

      if (statusCode) {
        if (!USE_TOAST) {
          setErrors((prev) => ({
            ...prev,
            email: "Пользователь с таким email уже существует",
          }));
        }
      } else onNext();
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }
  };

  const isDisabled =
    !email.trim() || !password.trim() || !!errors.email || !!errors.password;

  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <AuthLayout
      type="register"
      currentStep={1}
      totalSteps={3}
      image={lightBulb}
    >
      <div className={styles.registration__form}>
        <div className={styles.accounts}>
          {/*
            Важно: это обычные <a>, а не fetch.
            Браузер должен полностью уйти на бэк, а тот — редиректнуть на Google/Yandex.
            fetch здесь не сработает: провайдер не покажет свою страницу логина,
            и куки не поставятся.
          */}
          <a
            href={`${API_URL}/api/auth/oauth/google`}
            className={styles.account__google}
          >
            <img src={googleLogo} alt="Логотип Google" />
            <span>Продолжить с Google</span>
          </a>
          <a
            href={`${API_URL}/api/auth/oauth/yandex`}
            className={styles.account__yandex}
          >
            <img src={yandexLogo} alt="Логотип Яндекс" />
            <span>Продолжить с Яндекс</span>
          </a>
        </div>
        <div className={styles.divider}>
          <img src={divider} alt="Разделитель" />
          <span>или</span>
          <img src={divider} alt="Разделитель" />
        </div>
        <form className={styles.form} name="register" onSubmit={handleSubmit}>
          <div className={styles.form__fields}>
            <BasicInput
              label="Email"
              placeholder="Введите email"
              onChange={(value) => {
                setEmail(value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              value={email}
              error={errors.email}
              required
            />
            <PasswordInput
              label="Пароль"
              placeholder="Придумайте надёжный пароль"
              onChange={(value) => {
                setPassword(value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              value={password}
              error={errors.password}
              required
            />
          </div>
          <div className={styles.forms__buttons}>
            <Button variant="primary" type="submit" disabled={isDisabled}>
              Далее
            </Button>
            <div className={styles.authLink}>
              <span className={styles.authLinkText}>Уже есть аккаунт?</span>
              <Link to="/login" className={styles.authLinkButton}>
                Войти
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
