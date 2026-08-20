import { useMemo, type FC } from "react";
import styles from "./home-page.module.css";
import { useInitialDataLoader } from "../shared/hooks/useInitialDataLoader";
import {
  selectFilteredBySkillDescription,
  selectFilteredBySkillTitle,
  selectNewestUsers,
  selectPopularUsers,
  selectRecommendedUsers,
} from "../services/user/selectors";
import { FilterBar } from "../widgets/filter-bar";
import { UserSection } from "../widgets/user-section/user-section";
import { selectCategories } from "../services/category/slice";
import { getActiveFilters } from "../utils/filter/getActiveFilters";
import { useFilterActions } from "../shared/hooks/useFilterActions";
import { useUsersInfiniteScroll } from "../shared/hooks/useUsersInfiniteScroll";
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
  const usersSentinelRef = useUsersInfiniteScroll();

  const filteredUsersSkillName = useSelector(selectFilteredBySkillTitle);
  const filteredUsersSkillDescription = useSelector(
    selectFilteredBySkillDescription,
  );
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

  const searchResults = useMemo(() => {
    if (!hasSearchQuery) return [];

    const uniqueUsers = new Map();

    [...filteredUsersSkillName, ...filteredUsersSkillDescription].forEach(
      (user) => {
        if (!uniqueUsers.has(user.id)) {
          uniqueUsers.set(user.id, user);
        }
      },
    );

    return Array.from(uniqueUsers.values());
  }, [filteredUsersSkillName, filteredUsersSkillDescription, hasSearchQuery]);

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
          title={`Подходящие предложения: ${searchResults.length}`}
          users={searchResults}
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
          title={`Подходящие предложения: ${filteredUsersSkillName.length}`}
          users={filteredUsersSkillName}
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
