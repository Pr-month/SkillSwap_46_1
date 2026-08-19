import type { Dispatch, SetStateAction } from "react";

export type AccountRegisterProps = {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  onNext: () => void;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
};
