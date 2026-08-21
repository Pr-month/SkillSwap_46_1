import { useMemo, type FC } from "react";
import styles from "./home-page.module.css";
import { useInitialDataLoader } from "../shared/hooks/useInitialDataLoader";
import {
  selectNewestUsers,
  selectPopularUsers,
  selectRecommendedUsers,
  selectUsers,
} from "../services/user/selectors";
import { FilterBar } from "../widgets/filter-bar";
import { UserSection } from "../widgets/user-section/user-section";
import { selectCategories } from "../services/category/slice";
import { getActiveFilters } from "../utils/filter/getActiveFilters";
import { useFilterActions } from "../shared/hooks/useFilterActions";
import { useUsersInfiniteScroll } from "../shared/hooks/useUsersInfiniteScroll";
import { useFilteredUsersFetch } from "../shared/hooks/useFilteredUsersFetch";
import { ECity } from "../shared/constants/cities";
import { SelectedFilters } from "../widgets/filter-bar/selected-filters";
import { genderOptions, skillOptions } from "../widgets/filter-bar";
import { useSelector } from "../services/store";

const CITY_LABELS: Record<string, string> = Object.entries(ECity).reduce(
  (acc, [, value]) => {
    acc[value] = value;
    return acc;
  },
  {} as Record<string, string>,
);

export const HomePage: FC = () => {
  useInitialDataLoader();
  useFilteredUsersFetch();
  const usersSentinelRef = useUsersInfiniteScroll();

  const users = useSelector(selectUsers);
  const popular = useSelector(selectPopularUsers);
  const newest = useSelector(selectNewestUsers);
  const recommended = useSelector(selectRecommendedUsers);

  const filterState = useSelector((state) => state.filter);
  const categories = useSelector(selectCategories);

  const activeFilters = useMemo(() => {
    return getActiveFilters({
      filterState,
      categories,
      skillOptions,
      genderOptions,
      cityLabels: CITY_LABELS,
    });
  }, [filterState, categories]);

  const hasActiveFilters = activeFilters.length > 0;

  const hasSearchQuery = !!filterState.searchQuery?.trim();

  const { handleResetFilters, handleRemoveFilter } =
    useFilterActions(activeFilters);

  let content = null;

  if (hasSearchQuery) {
    content = (
      <div className={styles.content}>
        {activeFilters.length > 0 && (
          <SelectedFilters
            filters={activeFilters}
            onReset={handleResetFilters}
            onRemove={handleRemoveFilter}
          />
        )}
        <UserSection
          title={`Подходящие предложения: ${users.length}`}
          users={users}
          emptyMessage="Ничего не найдено по вашему запросу"
          isSorted={true}
        />
      </div>
    );
  } else if (hasActiveFilters) {
    content = (
      <div className={styles.content}>
        <SelectedFilters
          filters={activeFilters}
          onReset={handleResetFilters}
          onRemove={handleRemoveFilter}
        />
        <UserSection
          title={`Подходящие предложения: ${users.length}`}
          users={users}
          emptyMessage="Не найдено пользователей по выбранным фильтрам"
          isSorted={true}
        />
      </div>
    );
  } else {
    content = (
      <div className={styles.content}>
        <UserSection
          title="Популярное"
          users={popular}
          actionText="Смотреть все"
          onActionClick={() => {}}
        />

        <UserSection
          title="Новое"
          users={newest}
          actionText="Смотреть все"
          onActionClick={() => {}}
        />

        <UserSection
          title="Рекомендуем"
          users={recommended}
          emptyMessage="Нет рекомендаций для вас"
        />
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <FilterBar />
      {content}
      <div ref={usersSentinelRef} aria-hidden="true" />
    </main>
  );
};
