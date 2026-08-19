export type TImagePickerProps = {
  imageUrls: string[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
  isUploading?: boolean;
  uploadError?: string | null;
};
