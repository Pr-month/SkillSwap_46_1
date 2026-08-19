import type { ReactNode } from "react";

export type AuthLayoutType = "login" | "register";

export type AuthLayoutProps = {
  type: AuthLayoutType;
  title?: string;
  currentStep?: number;
  totalSteps?: number;
  children: ReactNode;
  image: string;
  description?: {
    title: string;
    text: string;
  };
};
