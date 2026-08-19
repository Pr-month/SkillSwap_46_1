import { useRef } from "react";
import clsx from "clsx";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Icon } from "../../shared/ui/icon";
import styles from "./image-gallery.module.css";

import "swiper/css";

export interface ImageGalleryProps {
  images: string[];
  className?: string;
  emptyText?: string;
}

export const ImageGallery = ({
  images,
  className,
  emptyText = "Нет изображений",
}: ImageGalleryProps) => {
  const swiperRef = useRef<SwiperType | null>(null);

  // заглушка для кейса, когда нет картинок
  if (!images.length) {
    return (
      <section className={clsx(styles.root, className)}>
        <div className={styles.empty}>
          <p className={styles.emptyText}>{emptyText}</p>
        </div>
      </section>
    );
  }

  // миниатюры справа (максимум 3)
  const previewImages = images.slice(1, 4);

  // если картинок больше 4 — показываем +N
  const hiddenCount = Math.max(images.length - 4, 0);

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <section className={clsx(styles.root, className)}>
      <div className={styles.main}>
        <Swiper
          slidesPerView={1}
          loop={images.length > 1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className={styles.swiper}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className={styles.slide}>
              <img
                className={styles.mainImage}
                src={image}
                alt={`Изображение ${index + 1}`}
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={clsx(styles.navButton, styles.prev)}
              onClick={handlePrev}
              aria-label="Предыдущее изображение"
            >
              <Icon
                name="chevron-left"
                size={16}
                className={styles.chevronLeft}
              />
            </button>

            <button
              type="button"
              className={clsx(styles.navButton, styles.next)}
              onClick={handleNext}
              aria-label="Следующее изображение"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.preview}>
          {previewImages.map((image, index) => {
            const previewIndex = index + 1;
            const isLastVisible = index === previewImages.length - 1;
            const showOverlay = isLastVisible && hiddenCount > 0;

            return (
              <div key={previewIndex} className={styles.previewItem}>
                <img
                  className={styles.previewImage}
                  src={image}
                  alt={`Миниатюра ${previewIndex + 1}`}
                  loading="lazy"
                />

                {showOverlay && (
                  <span className={styles.overlay}>+{hiddenCount}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
