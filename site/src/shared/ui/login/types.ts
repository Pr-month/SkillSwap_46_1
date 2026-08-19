import { type Dispatch, type SetStateAction, type SyntheticEvent } from "react";

export type LoginUIProps = {
  errorText: string | undefined;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  handleSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
};
