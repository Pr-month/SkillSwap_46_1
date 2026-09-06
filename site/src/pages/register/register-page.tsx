import { useEffect, useRef, useState, type FC } from "react";
import {
  AccountRegister,
  AuthorRegister,
  SkillRegister,
} from "../../shared/ui/register";
import type { OptionType } from "../../shared/ui/dropdown/types";
import { handleError } from "../../utils/errors/errorUtils";
import type { Error as ApiError } from "../../utils/errors/types";
import { useNavigate, useLocation } from "react-router-dom";
import type { IRegisterUserData, TGender } from "../../utils/types";
import {
  fetchCheckUser,
  fetchLogin,
  fetchRegister,
  fetchUpdateCurrentUser,
} from "../../services/auth/actions";
import { useDispatch, useSelector } from "../../services/store";
import { fetchCategories } from "../../services/category/actions";
import {
  selectCategories,
  selectSubCategoriesByCategoryId,
} from "../../services/category/slice";

export const Register: FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<OptionType | null>(null);
  const [city, setCity] = useState<OptionType | null>(null);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);

  const [skillName, setSkillName] = useState("");
  const [skillSubcategory, setSkillSubcategory] = useState<OptionType | null>(
    null,
  );
  const [skillDescription, setSkillDescription] = useState("");
  const [skillImages, setSkillImages] = useState<string[]>([]);

  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  const dispatch = useDispatch();

  const categories = useSelector(selectCategories);
  const getSubcategoriesByCategoryId = useSelector(
    selectSubCategoriesByCategoryId,
  );

  const categoriesRequested = useRef(false);

  useEffect(() => {
    if (categoriesRequested.current || categories.length !== 0) {
      return;
    }
    categoriesRequested.current = true;
    dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  const convertSubcategoriesToCategories = (
    subcategoryIds: string[],
  ): string[] => {
    const categoryIds = new Set<string>();

    subcategoryIds.forEach((subcategoryId) => {
      for (const category of categories) {
        const subcategory = getSubcategoriesByCategoryId(category.id).find(
          (sub) => sub.id === subcategoryId,
        );
        if (subcategory) {
          categoryIds.add(category.id);
          break;
        }
      }
    });

    return Array.from(categoryIds);
  };

  const attemptRecovery = async (): Promise<boolean> => {
    setRegistrationError(null);

    try {
      const loginResult = await dispatch(
        fetchLogin({ email, password }),
      ).unwrap();

      await dispatch(
        fetchUpdateCurrentUser({
          interestedSkillsSubcategoriesIds: learningSkills,
          userSkill: String(skillSubcategory?.value),
        }),
      ).unwrap();

      return true;
    } catch (recoveryErr) {
      const recoveryError = handleError(recoveryErr);
      setRegistrationError(
        `Не удалось завершить регистрацию: ${recoveryError.message}`,
      );
      return false;
    }
  };

  const handleSubmit = async () => {
    setRegistrationError(null);

    if (!skillSubcategory) return;

    try {
      const categoryIds = convertSubcategoriesToCategories(learningSkills);

      const registerData: IRegisterUserData = {
        email,
        password,
        name,
        birthdate: birthDate,
        gender: (gender?.value as TGender) || "OTHER",
        cityId: city?.value as string,
        avatar: avatar,
        wantToLearn: categoryIds,
        skills: [String(skillSubcategory.value)],
        title: skillName,
        description: skillDescription,
        images: skillImages,
        interestedSkillsSubcategoriesIds: learningSkills,
      };

      console.log("Register data:", registerData);

      await dispatch(fetchRegister(registerData)).unwrap();

      navigate(from, {
        replace: true,
        state: { showRegistrationSuccess: true },
      });
    } catch (err) {
      console.error("Registration error:", err);

      try {
        await dispatch(fetchCheckUser({ email, password })).unwrap();
      } catch (error) {
        const apiError = error as ApiError;
        const status = apiError?.statusCode;
        if (status === 409) {
          const recoverySuccess = await attemptRecovery();
          if (recoverySuccess) {
            navigate(from, {
              replace: true,
              state: { showRegistrationSuccess: true },
            });
            return;
          }
        }
      }

      setRegistrationError(handleError(err).message);
    }
  };

  if (step === 1) {
    return (
      <AccountRegister
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onNext={() => setStep(2)}
      />
    );
  }

  if (step === 2) {
    return (
      <AuthorRegister
        avatar={avatar}
        setAvatar={setAvatar}
        name={name}
        setName={setName}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        gender={gender}
        setGender={setGender}
        city={city}
        setCity={setCity}
        learningSkills={learningSkills}
        setLearningSkills={setLearningSkills}
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
      />
    );
  }

  if (step === 3) {
    return (
      <SkillRegister
        skillName={skillName}
        setSkillName={setSkillName}
        skillSubcategory={skillSubcategory}
        setSkillSubcategory={setSkillSubcategory}
        skillDescription={skillDescription}
        setSkillDescription={setSkillDescription}
        skillImages={skillImages}
        setSkillImages={setSkillImages}
        onBack={() => setStep(2)}
        onSubmit={handleSubmit}
        errorText={registrationError || ""}
      />
    );
  }
};
