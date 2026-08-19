export type CreateOfferVariant =
  | "accepted"
  | "created"
  | "registration"
  | "sent";

export interface CreateOfferProps {
  variant: CreateOfferVariant;
  onActionClick: () => void;
}
