export interface ConfirmOfferProps {
  skillTitle: string;
  category?: string;
  subcategory?: string;
  description?: string;
  images?: string[];

  onEditClick?: () => void;
  onDoneClick?: () => void;
}
