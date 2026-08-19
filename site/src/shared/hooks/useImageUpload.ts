import { useState } from "react";
import { uploadImage } from "../../api/imageApi.ts";
import type { UploadResponse } from "../../utils/types.ts";

export const useImageUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadSingle = async (file: File): Promise<UploadResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await uploadImage(file);
    } catch {
      setError("Ошибка загрузки");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadMany = async (files: File[]): Promise<UploadResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(files.map(uploadImage));
      const responses = results
        .filter(
          (r): r is PromiseFulfilledResult<UploadResponse> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value);

      if (responses.length < files.length) {
        setError(`Загружено ${responses.length} из ${files.length} файлов`);
      }
      return responses;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadSingle, uploadMany, isLoading, error };
};
