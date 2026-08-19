import {
  useEffect,
  useMemo,
  useState,
  type FC,
  type SyntheticEvent,
} from "react";
import { format, subYears, isBefore, isAfter, parse } from "date-fns";
import { cityOptions, genderOptions, type AuthorRegisterProps } from "./types";
import styles from "./author-register.module.css";
import userInfo from "../../../../assets/images/user-info.svg";
import { Button } from "../../button";
import { BasicInput } from "../../input/basic-input";
import { AuthLayout } from "../../auth-layout";
import { Avatar } from "../../avatar";
import { Dropdown } from "../../dropdown";
import type { OptionType } from "../../dropdown/types";
import { DatePicker } from "../../datepicker";
import { useDispatch, useSelector } from "../../../../services/store";
import {
  selectCategories,
  selectSubCategoriesByCategoryId,
} from "../../../../services/category/slice";
import {
  fetchCategories,
  fetchSubCategories,
} from "../../../../services/category/actions";
import { useImageUpload } from "../../../hooks/useImageUpload";

const CATEGORY_CSS_VARS: Record<string, string> = {
  "Творчество и искусство": "var(--color-category-creative)",
  "Иностранные языки": "var(--color-category-languages)",
  "Бизнес и карьера": "var(--color-category-business)",
  "Образование и развитие": "var(--color-category-education)",
  "Дом и уют": "var(--color-category-home)",
  "Здоровье и лайфстайл": "var(--color-category-health)",
  other: "var(--color-tag-plus)",
};

export const AuthorRegister: FC<AuthorRegisterProps> = ({
  avatar,
  setAvatar,
  name,
  setName,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  city,
  setCity,
  learningSkills,
  setLearningSkills,
  onNext,
  onBack,
}) => {
  const dispatch = useDispatch();

  const categories = useSelector(selectCategories);
  const getSubcategoriesByCategoryId = useSelector(
    selectSubCategoriesByCategoryId,
  );

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
  }, [dispatch]);

  const { uploadSingle } = useImageUpload();

  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(
    null,
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<OptionType | null>(null);

  const today = new Date();
  const minBirthDateObject = subYears(today, 112);
  const maxBirthDateObject = subYears(today, 18);

  const minBirthDate = format(minBirthDateObject, "yyyy-MM-dd");
  const maxBirthDate = format(maxBirthDateObject, "yyyy-MM-dd");

  const birthDateError = useMemo(() => {
    if (!birthDate) {
      return "";
    }

    const parsed = parse(birthDate, "yyyy-MM-dd", new Date());

    if (Number.isNaN(parsed.getTime())) {
      return "Введите корректную дату";
    }

    if (
      isBefore(parsed, minBirthDateObject) ||
      isAfter(parsed, maxBirthDateObject)
    ) {
      return "Можно указать возраст только от 18 до 112 лет";
    }

    return "";
  }, [birthDate, minBirthDateObject, maxBirthDateObject]);

  const handleAvatarEdit = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const result = await uploadSingle(file);
        if (result?.url) {
          setAvatar(result.url);
        }
      }
    };
    input.click();
  };

  const availableCategories = useMemo(() => {
    return categories.filter((category) => {
      const allSubcategories = getSubcategoriesByCategoryId(category.id);
      const availableSubs = allSubcategories.filter(
        (sub) => !learningSkills.includes(sub.id),
      );
      return availableSubs.length > 0;
    });
  }, [categories, learningSkills, getSubcategoriesByCategoryId]);

  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];

    const allSubcategories = getSubcategoriesByCategoryId(
      selectedCategory.value,
    );

    return allSubcategories
      .filter((sub) => !learningSkills.includes(sub.id))
      .map((sub) => ({
        value: sub.id,
        title: sub.name,
      }));
  }, [selectedCategory, learningSkills, getSubcategoriesByCategoryId]);

  const handleAddSkill = () => {
    if (!selectedSubcategory) return;

    setLearningSkills((prev) => [...prev, String(selectedSubcategory.value)]);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleRemoveSkill = (subcategoryId: string) => {
    setLearningSkills((prev) => prev.filter((id) => id !== subcategoryId));
  };

  const getTagColor = (categoryName: string): string => {
    return CATEGORY_CSS_VARS[categoryName] || CATEGORY_CSS_VARS.other;
  };

  const getSkillDisplay = (subcategoryId: string) => {
    for (const category of categories) {
      const subcategory = getSubcategoriesByCategoryId(category.id).find(
        (sub) => sub.id === subcategoryId,
      );

      if (subcategory) {
        return {
          name: subcategory.name,
          categoryName: category.name,
          categoryId: category.id,
        };
      }
    }

    return {
      name: "Неизвестная подкатегория",
      categoryName: "",
      categoryId: "other",
    };
  };

  const isDisabled =
    !name.trim() ||
    !birthDate ||
    Boolean(birthDateError) ||
    !gender?.value ||
    !city?.value ||
    learningSkills.length === 0 ||
    !avatar;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    if (!isDisabled) {
      onNext();
    }
  };

  return (
    <AuthLayout
      type="register"
      currentStep={2}
      totalSteps={3}
      image={userInfo}
      description={{
        title: "Расскажите немного о себе",
        text: "Это поможет другим людям лучше вас узнать, чтобы выбрать для обмена",
      }}
    >
      <form className={styles.form} name="register" onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <Avatar
            src={avatar}
            size="large"
            isEditable={true}
            onEdit={handleAvatarEdit}
            className={styles.avatar}
          />
          <BasicInput
            label="Имя"
            placeholder="Введите ваше имя"
            onChange={(value) => setName(value)}
            value={name}
            required
          />
          <div className={styles.birthDate__sex__fields}>
            <div className={styles.form__field}>
              <label className={styles.label}>Дата рождения</label>
              <DatePicker
                placeholder="дд.мм.гггг"
                value={birthDate}
                onChange={setBirthDate}
                minDate={minBirthDate}
                maxDate={maxBirthDate}
                error={Boolean(birthDateError)}
                helperText={birthDateError}
                required
              />
            </div>
            <Dropdown
              title="Пол"
              placeholder="Не указан"
              options={genderOptions}
              selected={gender}
              onChange={setGender}
            />
          </div>
          <Dropdown
            title="Город"
            placeholder="Не указан"
            options={cityOptions}
            selected={city}
            onChange={setCity}
            searchable
            searchPlaceholder="Введите город"
          />
          <Dropdown
            title="Категория навыка, которому хотите научиться"
            placeholder="Выберите категорию"
            options={availableCategories.map((cat) => ({
              value: cat.id,
              title: cat.name,
            }))}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
          <Dropdown
            title="Подкатегория навыка, которому хотите научиться"
            placeholder="Выберите подкатегорию"
            options={availableSubcategories}
            selected={selectedSubcategory}
            onChange={setSelectedSubcategory}
            disabled={!selectedCategory}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleAddSkill}
            disabled={!selectedCategory || !selectedSubcategory}
            className={styles.addButton}
          >
            Добавить
          </Button>

          {learningSkills.length > 0 && (
            <div className={styles.selectedSkills}>
              <h4 className={styles.selectedSkillsTitle}>Выбранные навыки:</h4>
              <div className={styles.skillTags}>
                {learningSkills.map((subcategoryId) => {
                  const { name, categoryName } = getSkillDisplay(subcategoryId);
                  const colorVar = getTagColor(categoryName);

                  return (
                    <div
                      key={subcategoryId}
                      className={styles.skillTag}
                      style={{ backgroundColor: colorVar }}
                    >
                      <span className={styles.skillTagName}>{name}</span>
                      <button
                        type="button"
                        className={styles.skillTagRemove}
                        onClick={() => handleRemoveSkill(subcategoryId)}
                        aria-label={`Удалить ${name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className={styles.buttons}>
          <Button
            variant="secondary"
            onClick={onBack}
            className={styles.button}
          >
            Назад
          </Button>
          <Button
            variant="primary"
            type="submit"
            className={styles.button}
            disabled={isDisabled}
          >
            Продолжить
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};
