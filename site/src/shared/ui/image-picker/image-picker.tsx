import React, { useRef, useState } from "react";
import clsx from "clsx";
import styles from "./image-picker.module.css";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import type { TImagePickerProps } from "./types";

export const ImagePicker: React.FC<TImagePickerProps> = ({
  imageUrls,
  onChange,
  maxFiles = 4,
  accept = ".png,.jpg,.jpeg",
  className,
  isUploading = false,
  uploadError = null,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState("");

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isMaxReached = imageUrls.length >= maxFiles;

  const visibleError = error || uploadError;

  const handleFiles = (incomingFiles: File[]) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    const validFiles = incomingFiles.filter((file) =>
      allowedTypes.includes(file.type),
    );
    const invalidFilesCount = incomingFiles.length - validFiles.length;
    const availableSlots = Math.max(maxFiles - imageUrls.length, 0);
    const filesToAdd = validFiles.slice(0, availableSlots);
    const overflowCount = Math.max(validFiles.length - availableSlots, 0);

    if (filesToAdd.length > 0) {
      onChange(filesToAdd);
    }

    if (invalidFilesCount > 0 && overflowCount > 0) {
      setError(
        `Можно загрузить не более ${maxFiles} изображений. Только PNG, JPG, JPEG.`,
      );
      return;
    }
    if (invalidFilesCount > 0) {
      setError("Поддерживаются только PNG, JPG и JPEG.");
      return;
    }
    if (overflowCount > 0) {
      setError(`Можно загрузить не более ${maxFiles} изображений.`);
      return;
    }
    setError("");
  };

  const handleClick = () => {
    if (isMaxReached || isUploading) return;
    inputRef.current?.click();
  };

  const handleAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading || !event.target.files) return;
    handleFiles(Array.from(event.target.files));
    event.target.value = "";
  };

  const handleRemove = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    onChange(updatedUrls as unknown as File[]);
    if (error) setError("");
  };

  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const target = e.target as HTMLElement;
      if (target?.classList.contains(styles.item)) {
        target.style.opacity = "0.5";
      }
    }, 0);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex !== null && draggedIndex !== index) {
      const newUrls = [...imageUrls];
      const [draggedItem] = newUrls.splice(draggedIndex, 1);
      newUrls.splice(index, 0, draggedItem);

      setDraggedIndex(index);
      onChange(newUrls as unknown as File[]);
    }
  };

  const handleItemDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    const target = e.target as HTMLElement;
    if (target?.classList.contains(styles.item)) {
      target.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isMaxReached || isUploading) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (isMaxReached || isUploading) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div
        className={clsx(styles.dropzone, isDragActive && styles.dragActive)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isMaxReached ? (
          <div className={styles.addBlock}>
            <p className={styles.text}>
              Перетащите или выберите изображения навыка
            </p>
            <button
              type="button"
              className={styles.button}
              onClick={handleClick}
            >
              <Icon
                name="gallery-add"
                className={styles.buttonIcon}
                size={24}
              />
              Выбрать изображения
            </button>
          </div>
        ) : (
          <p className={styles.limitText}>
            Вы загрузили максимальное количество изображений
          </p>
        )}

        {imageUrls.length > 0 && (
          <ul className={styles.list}>
            {imageUrls.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className={clsx(
                  styles.item,
                  draggedIndex === index && styles.dragging,
                )}
                draggable
                onDragStart={(e) => handleItemDragStart(e, index)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDragEnd={handleItemDragEnd}
              >
                <img
                  src={url}
                  alt="preview"
                  className={styles.previewImage}
                  loading="lazy"
                />

                <button
                  type="button"
                  className={styles.remove}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  aria-label="Удалить изображение"
                >
                  <Icon name="cross" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {isUploading && (
          <div className={styles.loadingOverlay}>
            <Spinner size="large" />
          </div>
        )}
      </div>
      {visibleError && <p className={styles.errorText}>{visibleError}</p>}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className={styles.input}
        onChange={handleAdd}
      />
    </div>
  );
};
