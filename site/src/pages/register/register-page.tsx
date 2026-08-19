import { useState, type FC } from "react";
import {
  AccountRegister,
  AuthorRegister,
  SkillRegister,
} from "../../shared/ui/register";
import type { OptionType } from "../../shared/ui/dropdown/types";
import { handleError } from "../../utils/errors/errorUtils";
import { useNavigate, useLocation } from "react-router-dom";
import type { IRegisterUserData, TGender, TSkillData } from "../../utils/types";
import {
  fetchCheckUser,
  fetchLogin,
  fetchRegister,
  fetchUpdateCurrentUser,
} from "../../services/auth/actions";
import { appendSkill } from "../../services/skill/actions";
import { useDispatch } from "../../services/store";
import { tokenService } from "../../utils/tokenService";

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

  const attemptRecovery = async (): Promise<boolean> => {
    setRegistrationError(null);

    try {
      const loginResult = await dispatch(
        fetchLogin({ email, password }),
      ).unwrap();

      tokenService.set(loginResult.access_token);

      const skillData: TSkillData = {
        title: skillName,
        description: skillDescription,
        skillSubcategory: String(skillSubcategory?.value),
        images: skillImages,
      };

      const skillResult = await dispatch(appendSkill(skillData)).unwrap();
      const skillId = skillResult.data.id;

      await dispatch(
        fetchUpdateCurrentUser({
          userSkill: skillId,
          interestedSkillsSubcategoriesIds: learningSkills,
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
      const registerData: IRegisterUserData = {
        email,
        password,
        name,
        birthDate,
        gender: gender?.value as TGender,
        city: city?.title as string,
        avatar,
      };

      await dispatch(fetchRegister(registerData));

      const skillData: TSkillData = {
        title: skillName,
        description: skillDescription,
        skillSubcategory: String(skillSubcategory.value),
        images: skillImages,
      };

      const skillResult = await dispatch(appendSkill(skillData)).unwrap();
      const skillId = skillResult.data.id;

      await dispatch(
        fetchUpdateCurrentUser({
          userSkill: skillId,
          interestedSkillsSubcategoriesIds: learningSkills,
        }),
      );

      navigate(from, {
        replace: true,
        state: { showRegistrationSuccess: true },
      });
    } catch (err) {
      try {
        await dispatch(fetchCheckUser({ email, password })).unwrap();
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } catch (error: any) {
        const status =
          error?.status || error?.statusCode || error?.response?.status;
        if (status === 409) {
          const recoverySuccess = await attemptRecovery();
          if (recoverySuccess) {
            navigate(from, {
              replace: true,
              state: { showRegistrationSuccess: true },
            });
          }
        }
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
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
