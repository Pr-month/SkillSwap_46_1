import { useEffect, useState, type FC } from "react";
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
import { useDispatch, useSelector } from "../../../services/store";
import { updatePassword } from "../../../services/auth/actions";
import {
  fetchPopularCities,
  fetchSearchCities,
} from "../../../services/city/actions";
import {
  MIN_CITY_SEARCH_LENGTH,
  selectCitySearchResults,
  selectPopularCities,
} from "../../../services/city/slice";
import styles from "./user-info.module.css";

const genderOptions: OptionType[] = [
  { value: "MALE", title: "Мужской" },
  { value: "FEMALE", title: "Женский" },
  { value: "OTHER", title: "Другой" },
];

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

  const email = user?.email ?? "";
  const [name, setName] = useState(user?.name ?? "");
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "");
  const [gender, setGender] = useState<OptionType | null>(user?.gender ?? null);
  const [city, setCity] = useState<OptionType | null>(() => {
    // `city` может прийти строкой (название) или объектом City (после login/register),
    // поэтому нормализуем значение до названия города, чтобы title всегда был строкой.
    const rawCity = user?.city as unknown;
    const cityName =
      typeof rawCity === "string"
        ? rawCity
        : rawCity && typeof rawCity === "object" && "name" in rawCity
          ? String((rawCity as { name?: unknown }).name ?? "")
          : "";

    if (user?.cityId) {
      return { value: user.cityId, title: cityName };
    }

    if (cityName) {
      return { value: "", title: cityName };
    }

    return null;
  });
  const [about, setAbout] = useState(user?.about ?? "");

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const popularCities = useSelector(selectPopularCities);
  const citySearchResults = useSelector(selectCitySearchResults);

  const [citySearchQuery, setCitySearchQuery] = useState("");

  useEffect(() => {
    if (popularCities.length === 0) {
      dispatch(fetchPopularCities());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const query = citySearchQuery.trim();

    if (query.length < MIN_CITY_SEARCH_LENGTH) return;

    const timeoutId = window.setTimeout(() => {
      dispatch(fetchSearchCities(query));
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [citySearchQuery, dispatch]);

  const isSearching = citySearchQuery.trim().length >= MIN_CITY_SEARCH_LENGTH;
  const cityOptions: OptionType[] = (
    isSearching ? citySearchResults : popularCities
  ).map((cityItem) => ({ value: cityItem.id, title: cityItem.name }));

  const handleSave = () => {
    onSave?.({
      name,
      birthdate: birthDate,
      gender,
      ...(city?.value ? { cityId: city.value } : {}),
      about,
    });
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordChange(false);
    setCurrentPassword("");
    setNewPassword("");
    setCurrentPasswordError("");
    setPasswordError("");
  };

  const handlePasswordSave = async () => {
    const currentError = currentPassword ? "" : "Введите текущий пароль";
    const newError = validatePassword(newPassword);

    setCurrentPasswordError(currentError);
    setPasswordError(newError);

    if (currentError || newError) {
      return;
    }

    try {
      await dispatch(updatePassword({ currentPassword, newPassword })).unwrap();
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
            error={errors.email}
            disabled
          />

          <button
            type="button"
            className={styles.changePasswordLink}
            onClick={() => {
              setShowPasswordChange(!showPasswordChange);
              setCurrentPassword("");
              setNewPassword("");
              setCurrentPasswordError("");
              setPasswordError("");
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
                label="Текущий пароль"
                placeholder="Введите текущий пароль"
                value={currentPassword}
                onChange={(value) => {
                  setCurrentPassword(value);
                  setCurrentPasswordError("");
                }}
                error={currentPasswordError}
                required
              />

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
            selected={city}
            onChange={setCity}
            error={Boolean(errors.city)}
            searchable
            searchPlaceholder="Введите город"
            onSearchChange={setCitySearchQuery}
            onClose={() => setCitySearchQuery("")}
            filterOptions={!isSearching}
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
