export type SkillDetailsMode = "catalog" | "registration";

export interface SkillDetailsProps {
  title: string;
  category?: string;
  subcategory?: string;
  description?: string;
  images?: string[];
  mode: SkillDetailsMode;
  exchangeProposed?: boolean;
  onExchangeClick?: () => void;
  onEditClick?: () => void;
  onDoneClick?: () => void;
  className?: string;
}
