import type { OptionType } from "../dropdown/types";

export interface UserInfoProps {
  user?: {
    email: string;
    name: string;
    birthDate: string; // формат "YYYY-MM-DD"
    gender: OptionType | null;
    city: string;
    about: string;
    avatar?: string;
  };
  onSave?: (data: {
    email: string;
    name: string;
    birthDate: string;
    gender: OptionType | null;
    city: string;
    about: string;
  }) => void;
  errors?: {
    email?: string;
    name?: string;
    birthDate?: string;
    gender?: string;
    city?: string;
    about?: string;
  };
  loading?: boolean;
  onAvatarEdit?: () => void;
}
