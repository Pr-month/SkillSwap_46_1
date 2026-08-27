import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type SyntheticEvent,
} from "react";
import type { SkillRegisterProps } from "./types";
import styles from "./skill-register.module.css";
import schoolBoard from "../../../../assets/images/school-board.svg";
import { Button } from "../../button";
import { BasicInput } from "../../input/basic-input";
import { AuthLayout } from "../../auth-layout";
import { Dropdown } from "../../dropdown";
import type { OptionType } from "../../dropdown/types";
import { ModalUI } from "../../modal-ui";
import { SkillDetails } from "../../../../widgets/skill-details";
import { useDispatch, useSelector } from "../../../../services/store";
import {
  selectCategories,
  selectSubCategoriesByCategoryId,
} from "../../../../services/category/slice";
import {
  fetchCategories,
} from "../../../../services/category/actions";
import { ImagePicker } from "../../image-picker";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { USE_TOAST } from "../../../../config/apiConfig";

export const SkillRegister: FC<SkillRegisterProps> = ({
  skillName,
  setSkillName,
  skillSubcategory,
  setSkillSubcategory,
  skillDescription,
  setSkillDescription,
  skillImages,
  setSkillImages,
  onBack,
  onSubmit,
  errorText,
}) => {
  const dispatch = useDispatch();

  const categories = useSelector(selectCategories);
  const getSubcategoriesByCategoryId = useSelector(
    selectSubCategoriesByCategoryId,
  );

  const { uploadMany, isLoading, error } = useImageUpload();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(
    null,
  );

  const categoryOptions: OptionType[] = useMemo(() => {
    return categories.map((cat) => ({ value: cat.id, title: cat.name }));
  }, [categories]);

  const subcategoryOptions: OptionType[] = useMemo(() => {
    if (!selectedCategory) return [];

    const allSubcategories = getSubcategoriesByCategoryId(
      selectedCategory.value,
    );
    return allSubcategories.map((sub) => ({ value: sub.id, title: sub.name }));
  }, [selectedCategory, getSubcategoriesByCategoryId]);

  const handleCategoryChange = (option: OptionType | null) => {
    setSelectedCategory(option);
    setSkillSubcategory(null);
  };

  const handleImageChange = useCallback(
    (payload: File[] | string[]) => {
      if (payload.length === 0) {
        setSkillImages([]);
        return;
      }

      if (typeof payload[0] === "string") {
        setSkillImages(payload as string[]);
        return;
      }

      const files = payload as File[];

      uploadMany(files).then((results) => {
        const urls = results.map((res) => res.url).filter(Boolean) as string[];

        if (urls.length > 0) {
          setSkillImages((prev) => [...prev, ...urls]);
        }
      });
    },
    [uploadMany, setSkillImages],
  );

  const isDisabled =
    isLoading || !skillName.trim() || !skillSubcategory || !skillDescription;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      setIsPreviewModalOpen(true);
    }
  };

  return (
    <>
      <AuthLayout
        type="register"
        currentStep={3}
        totalSteps={3}
        image={schoolBoard}
        description={{
          title: "Укажите, чем вы готовы поделиться",
          text: "Так другие люди смогут увидеть ваши предложения и предложить вам обмен!",
        }}
      >
        <form className={styles.form} name="register" onSubmit={handleSubmit}>
          <div className={styles.fields}>
            <BasicInput
              label="Название навыка"
              placeholder="Введите название вашего навыка"
              onChange={(value) => setSkillName(value)}
              value={skillName}
              required
            />
            <Dropdown
              title="Категория навыка"
              placeholder="Выберите категорию навыка"
              options={categoryOptions}
              selected={selectedCategory}
              onChange={handleCategoryChange}
            />
            <Dropdown
              title="Подкатегория навыка"
              placeholder="Выберите подкатегорию навыка"
              options={subcategoryOptions}
              selected={skillSubcategory}
              onChange={setSkillSubcategory}
              disabled={!selectedCategory}
            />
            <BasicInput
              label="Описание"
              placeholder="Коротко опишите, чему можете научить"
              onChange={(value) => setSkillDescription(value)}
              value={skillDescription}
              multiline
              maxLength={500}
              rows={6}
              className={styles.description}
              required
            />
            <ImagePicker
              imageUrls={skillImages}
              onChange={handleImageChange}
              isUploading={isLoading}
              uploadError={error}
            />
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
          {errorText && !USE_TOAST && (
            <p className={styles.error}>{errorText}</p>
          )}
        </form>
      </AuthLayout>

      <ModalUI
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        size="wide"
      >
        <div className={styles.modalContent}>
          <SkillDetails
            title={skillName}
            category={selectedCategory?.title}
            subcategory={skillSubcategory?.title}
            description={skillDescription}
            images={skillImages}
            mode="registration"
            onEditClick={() => setIsPreviewModalOpen(false)}
            onDoneClick={onSubmit}
            className={styles.skillPreview}
          />
        </div>
      </ModalUI>
    </>
  );
};
