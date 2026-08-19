import { request } from "./client";
import type { UploadResponse } from "../utils/types.ts";

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  return await request("/upload", {
    method: "POST",
    body: formData,
  });
};
