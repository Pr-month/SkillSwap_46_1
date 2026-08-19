import { useState, type FC } from "react";
import clsx from "clsx";
import { Avatar } from "../avatar";
import { BasicInput } from "../input/basic-input";
import { DatePicker } from "../datepicker";
import { Dropdown } from "../dropdown";
import { Button } from "../button";
import { Icon } from "../icon";
import { PasswordInput } from "../input";
import type { UserInfoProps } from "./types";
import type { OptionType } from "../dropdown/types";
import { ECity } from "../../constants/cities";
import { useDispatch } from "../../../services/store";
import { updatePassword } from "../../../services/auth/actions";
import styles from "./user-info.module.css";

const genderOptions: OptionType[] = [
  { value: "male", title: "Мужской" },
  { value: "female", title: "Женский" },
  { value: "other", title: "Другой" },
];

const cityOptions: OptionType[] = Object.entries(ECity).map(([key, value]) => ({
  value: key,
  title: value,
}));

const validatePassword = (password: string): string => {
  if (!password) {
    return "Пароль обязателен";
  }

  if (password.length < 8) {
    return "Минимум 8 символов";
  }

  if (!/[A-Z]/.test(password)) {
    return "Должна быть заглавная буква";
  }

  if (!/[0-9]/.test(password)) {
    return "Должна быть цифра";
  }

  return "";
};

export const UserInfo: FC<UserInfoProps> = ({
  user,
  onSave,
  errors = {},
  loading = false,
  onAvatarEdit,
}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "");
  const [gender, setGender] = useState<OptionType | null>(user?.gender ?? null);
  const [city, setCity] = useState(user?.city ?? "");
  const [about, setAbout] = useState(user?.about ?? "");

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const selectedCityOption =
    cityOptions.find((option) => option.title === city) ?? null;

  const handleSave = () => {
    onSave?.({
      email,
      name,
      birthDate,
      gender,
      city,
      about,
    });
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordChange(false);
    setNewPassword("");
    setPasswordError("");
  };

  const handlePasswordSave = async () => {
    const validationError = validatePassword(newPassword);

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      await dispatch(updatePassword(newPassword)).unwrap();
      handleCancelPasswordChange();
    } catch {
      setPasswordError("Не удалось изменить пароль");
    }
  };

  return (
    <div className={clsx(styles.userInfo, loading && styles.loading)}>
      <div className={styles.avatarContainer}>
        <Avatar
          size="profile"
          src={user?.avatar}
          name={name}
          isAuthorized={true}
          isEditable={true}
          onEdit={onAvatarEdit}
        />
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        aria-label="Редактирование профиля пользователя"
      >
        <div className={styles.field}>
          <BasicInput
            label="Почта"
            placeholder="Введите email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            required
            rightIcon={
              <Icon
                name="edit"
                size={24}
                className={styles.editIcon}
                alt="Редактирование поля почты"
              />
            }
          />

          <button
            type="button"
            className={styles.changePasswordLink}
            onClick={() => {
              setShowPasswordChange(!showPasswordChange);
              setPasswordError("");
              setNewPassword("");
            }}
            aria-expanded={showPasswordChange}
            aria-controls="password-change-container"
          >
            Изменить пароль
          </button>

          {showPasswordChange && (
            <div
              id="password-change-container"
              className={styles.passwordChangeContainer}
            >
              <PasswordInput
                label="Новый пароль"
                placeholder="Придумайте новый пароль"
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  setPasswordError("");
                }}
                error={passwordError}
                required
              />

              <div className={styles.passwordActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelPasswordChange}
                >
                  Отмена
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handlePasswordSave}
                  disabled={loading}
                >
                  Сохранить пароль
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <BasicInput
            label="Имя"
            placeholder="Введите ваше имя"
            value={name}
            onChange={setName}
            error={errors.name}
            required
            rightIcon={
              <Icon
                name="edit"
                size={24}
                className={styles.editIcon}
                alt="Редактирование поля имени"
              />
            }
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Дата рождения</div>
            <DatePicker
              value={birthDate}
              onChange={setBirthDate}
              placeholder="дд.мм.гггг"
              error={Boolean(errors.birthDate)}
              helperText={errors.birthDate}
              disableFuture
            />
          </div>

          <div className={styles.field}>
            <Dropdown
              title="Пол"
              placeholder="Выберите пол"
              options={genderOptions}
              selected={gender}
              onChange={setGender}
              error={Boolean(errors.gender)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <Dropdown
            title="Город"
            placeholder="Выберите город"
            options={cityOptions}
            selected={selectedCityOption}
            onChange={(option) => setCity(option?.title ?? "")}
            error={Boolean(errors.city)}
            searchable
            searchPlaceholder="Введите город"
          />
        </div>

        <div className={styles.field}>
          <BasicInput
            label="О себе"
            placeholder="Расскажите о себе"
            value={about}
            onChange={setAbout}
            error={errors.about}
            multiline
            rows={4}
            rightIcon={
              <Icon
                name="edit"
                size={24}
                className={styles.editIcon}
                alt="Редактирование поля о себе"
              />
            }
          />
        </div>

        <div className={styles.actions}>
          <Button variant="primary" type="submit" disabled={loading} fullWidth>
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
};
