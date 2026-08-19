import type { Dispatch, SetStateAction } from "react";
import type { OptionType } from "../../dropdown/types";

export type SkillRegisterProps = {
  skillName: string;
  setSkillName: Dispatch<SetStateAction<string>>;
  skillSubcategory: OptionType | null;
  setSkillSubcategory: Dispatch<SetStateAction<OptionType | null>>;
  skillDescription: string;
  setSkillDescription: Dispatch<SetStateAction<string>>;
  skillImages: string[];
  setSkillImages: Dispatch<SetStateAction<string[]>>;
  onBack: () => void;
  onSubmit: () => void;
  errorText: string;
};
