import { useRef, useState } from "react";
import Slider from "react-slick";
import type { Settings } from "react-slick";

import { SkillCard } from "../skillcard";
import type { SkillCardProps } from "../skillcard";

import styles from "./skillcard-slider.module.css";

export type SkillCardSliderProps = {
  cards: SkillCardProps[];
};

const VISIBLE_CARDS_COUNT = 4;

export function SkillCardSlider({ cards }: SkillCardSliderProps) {
  const sliderRef = useRef<Slider | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const shouldShowSlider = cards.length > VISIBLE_CARDS_COUNT;
  const lastSlideIndex = Math.max(cards.length - VISIBLE_CARDS_COUNT, 0);

  const settings: Settings = {
    infinite: false,
    dots: false,
    arrows: false,
    speed: 500,
    slidesToScroll: 1,
    variableWidth: true,
    centerMode: false,
    afterChange: (index) => {
      setCurrentSlide(index);
    },
  };

  const handleNextClick = () => {
    if (!shouldShowSlider) {
      return;
    }

    if (currentSlide >= lastSlideIndex) {
      sliderRef.current?.slickGoTo(0);
      return;
    }

    sliderRef.current?.slickNext();
  };

  if (!shouldShowSlider) {
    return (
      <div className={styles.staticGrid}>
        {cards.map((card, index) => (
          <div
            key={card.id ?? `${card.name}-${card.city}-${card.age}-${index}`}
            className={styles.staticCard}
          >
            <SkillCard {...card} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderViewport}>
        <Slider ref={sliderRef} {...settings}>
          {cards.map((card, index) => (
            <div
              key={card.id ?? `${card.name}-${card.city}-${card.age}-${index}`}
              className={styles.slide}
            >
              <SkillCard {...card} />
            </div>
          ))}
        </Slider>
      </div>

      <button
        className={`${styles.arrow} ${styles.arrowNext}`}
        type="button"
        onClick={handleNextClick}
        aria-label="Следующие карточки"
      >
        <span className={styles.arrowIcon} aria-hidden="true" />
      </button>
    </div>
  );
}
