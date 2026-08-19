export type StepImageProps = {
  /** Путь к изображению (URL или импорт) */
  imageSrc: string;
  /** Заголовок под изображением */
  title?: string;
  /** Сообщение под заголовком */
  message?: string;
  /** Дополнительный класс для контейнера */
  className?: string;
  /** Альтернативный текст для изображения */
  alt?: string;
};
