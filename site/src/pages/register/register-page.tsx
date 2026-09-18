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
  fetchRegister,
  fetchRegisterOAuth,
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

  const [oauthPendingId, setOauthPendingId] = useState<string | null>(null);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pendingId = params.get("oauth_pending");

    if (pendingId) {
      setOauthPendingId(pendingId);
      setStep(2);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

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

      const commonData = {
        name,
        birthdate: birthDate,
        gender: (gender?.value as TGender) || "OTHER",
        cityId: city?.value as string,
        avatar,
        wantToLearn: categoryIds,
        skills: [String(skillSubcategory.value)],
        title: skillName,
        description: skillDescription,
        images: skillImages,
        interestedSkillsSubcategoriesIds: learningSkills,
      };

      if (oauthPendingId) {
        await dispatch(
          fetchRegisterOAuth({ ...commonData, pendingId: oauthPendingId }),
        ).unwrap();

        navigate(from, {
          replace: true,
          state: { showRegistrationSuccess: true },
        });
        return;
      }

      const registerData: IRegisterUserData = {
        email,
        password,
        ...commonData,
      };

      await dispatch(fetchRegister(registerData)).unwrap();

      navigate(from, {
        replace: true,
        state: { showRegistrationSuccess: true },
      });
    } catch (err) {
      console.error("Registration error:", err);

      const apiError = err as ApiError;

      if (apiError?.code === "auth:oauth-pending-expired") {
        setOauthPendingId(null);
        setStep(1);
        setRegistrationError(
          "Сессия регистрации истекла. Попробуйте войти через Google или Яндекс заново.",
        );
        return;
      }

      if (apiError?.statusCode === 409) {
        if (oauthPendingId) {
          setRegistrationError(
            "Этот email уже зарегистрирован. Войдите в аккаунт.",
          );
          return;
        }

        try {
          await dispatch(fetchCheckUser({ email, password })).unwrap();
        } catch (error) {
          const checkError = error as ApiError;
          if (checkError?.statusCode === 409) {
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
        onBack={() => {
          if (oauthPendingId) {
            navigate("/login");
            return;
          }
          setStep(1);
        }}
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
