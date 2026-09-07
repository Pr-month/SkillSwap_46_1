import type { OptionType } from "../dropdown/types";

export interface UserInfoProps {
  user?: {
    email: string;
    name: string;
    birthDate: string; // формат "YYYY-MM-DD"
    gender: OptionType | null;
    city: string;
    cityId?: string | null;
    about: string;
    avatar?: string;
  };
  onSave?: (data: {
    name: string;
    birthdate: string;
    gender: OptionType | null;
    cityId?: string;
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
