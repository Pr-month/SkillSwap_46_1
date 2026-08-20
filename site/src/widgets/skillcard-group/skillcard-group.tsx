import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { SkillCard } from "../skillcard";
import { SkillCardGroupHeader } from "../skillcard-group-header";

import styles from "./skillcard-group.module.css";
import type { SkillCardGroupProps } from "./types";

const PAGE_SIZE = 6;

export const SkillCardGroup = ({
  title,
  cards,
  actionText = "Смотреть все",
  onActionClick,
  hideAction = false,
  className,
  initialVisibleCount = 3,
  isSorted,
  sortOrder,
  setSortOrder,
  infiniteScroll = false,
}: SkillCardGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(
    infiniteScroll ? PAGE_SIZE * 2 : initialVisibleCount,
  );
  const [prevCardsLength, setPrevCardsLength] = useState(cards.length);
  const [prevInitialVisibleCount, setPrevInitialVisibleCount] =
    useState(initialVisibleCount);
  const [prevInfiniteScroll, setPrevInfiniteScroll] = useState(infiniteScroll);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const shouldCollapse = !hideAction && cards.length > initialVisibleCount;
  const shouldShowAction = !hideAction && shouldCollapse;
  const scrollEnabled = infiniteScroll || isExpanded;

  // Сбрасываем состояние при изменении входящих параметров (adjusting state during render)
  if (
    cards.length !== prevCardsLength ||
    initialVisibleCount !== prevInitialVisibleCount ||
    infiniteScroll !== prevInfiniteScroll
  ) {
    setPrevCardsLength(cards.length);
    setPrevInitialVisibleCount(initialVisibleCount);
    setPrevInfiniteScroll(infiniteScroll);
    setVisibleCount(infiniteScroll ? PAGE_SIZE * 2 : initialVisibleCount);
    setIsExpanded(false);
  }

  // Чистим nodeRefs от удалённых карточек
  useEffect(() => {
    const newKeys = new Set(cards.map((c) => String(c.id)));
    for (const key in nodeRefs.current) {
      if (!newKeys.has(key)) delete nodeRefs.current[key];
    }
  }, [cards]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, cards.length));
  }, [cards.length]);

  useEffect(() => {
    if (!scrollEnabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, scrollEnabled]);

  const visibleCards = useMemo(() => {
    if (!scrollEnabled) return cards.slice(0, initialVisibleCount);
    return cards.slice(0, visibleCount);
  }, [cards, visibleCount, scrollEnabled, initialVisibleCount]);

  const currentActionText = isExpanded ? "Свернуть" : actionText;

  const handleActionClick = () => {
    if (!shouldCollapse) return;
    if (isExpanded) {
      setIsExpanded(false);
      setVisibleCount(initialVisibleCount);
    } else {
      setIsExpanded(true);
      setVisibleCount(PAGE_SIZE * 2);
    }
    onActionClick?.();
  };

  const hasMore = scrollEnabled && visibleCount < cards.length;

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className={clsx(styles.group, className)}>
      <SkillCardGroupHeader
        title={title}
        actionText={currentActionText}
        onActionClick={handleActionClick}
        hideAction={!shouldShowAction}
        isSorted={isSorted}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <TransitionGroup component="div" className={styles.grid}>
        {visibleCards.map((card, index) => {
          const cardKey =
            card.id ?? `${card.name}-${card.city}-${card.age}-${index}`;

          return (
            <CSSTransition
              key={cardKey}
              timeout={300}
              nodeRef={{
                get current() {
                  return nodeRefs.current[String(cardKey)];
                },
              }}
              classNames={{
                enter: styles.cardEnter,
                enterActive: styles.cardEnterActive,
                exit: styles.cardExit,
                exitActive: styles.cardExitActive,
              }}
            >
              <div
                ref={(node) => {
                  nodeRefs.current[String(cardKey)] = node;
                }}
                className={styles.cardItem}
              >
                <SkillCard {...card} />
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      {hasMore && (
        <div ref={sentinelRef} style={{ height: 1, marginTop: -1 }} />
      )}
    </section>
  );
};
