export type TSkillOption = "all" | "want-to-learn" | "can-teach";

export type TSkillOptionRadioGroupProps = {
  value?: TSkillOption;
  onChange?: (value: TSkillOption) => void;
};

export type TGenderOption = "all" | "male" | "female";

export type TGenderFilterProps = {
  value?: TGenderOption;
  onChange?: (value: TGenderOption) => void;
};
