import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "../../services/store";
import { fetchUsers } from "../../services/user/actions";
import { buildUsersFilterParams } from "../../services/user/filters";
import { USERS_PAGE_LIMIT } from "./useUsersInfiniteScroll";

/**
 * Загружает первую страницу пользователей при первичном монтировании и
 * повторяет запрос при изменении фильтров/поиска. Поиск debounce'ится,
 * чтобы не дёргать сервер на каждый ввод символа.
 */
export const useFilteredUsersFetch = () => {
  const dispatch = useDispatch();

  const skillOption = useSelector((state) => state.filter.skillOption);
  const gender = useSelector((state) => state.filter.gender);
  const subCategoryIds = useSelector((state) => state.filter.subCategoryIds);
  const cities = useSelector((state) => state.filter.cities);
  const searchQuery = useSelector((state) => state.filter.searchQuery);

  const lastNonSearchKey = useRef<string | null>(null);
  const filtersRef = useRef({ skillOption, gender, subCategoryIds, cities });
  filtersRef.current = { skillOption, gender, subCategoryIds, cities };

  // Не-поисковые фильтры + первичная загрузка: выполняются сразу.
  // Пропускаем повторный dispatch с теми же фильтрами (например, повторный
  // вызов эффекта из-за React StrictMode в dev-режиме).
  useEffect(() => {
    const key = JSON.stringify([
      skillOption,
      gender,
      [...subCategoryIds].sort(),
      [...cities].sort(),
    ]);

    if (lastNonSearchKey.current === key) {
      return;
    }
    lastNonSearchKey.current = key;

    dispatch(
      fetchUsers({
        page: 1,
        limit: USERS_PAGE_LIMIT,
        ...buildUsersFilterParams({
          skillOption,
          gender,
          subCategoryIds,
          cities,
          searchQuery,
        }),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillOption, gender, subCategoryIds, cities]);

  const previousSearchQuery = useRef(searchQuery);

  // Поиск: debounce. Срабатывает только при фактическом изменении searchQuery,
  // поэтому не дублирует первичную загрузку (в т.ч. при StrictMode).
  useEffect(() => {
    if (previousSearchQuery.current === searchQuery) {
      return;
    }
    previousSearchQuery.current = searchQuery;

    const handler = setTimeout(() => {
      dispatch(
        fetchUsers({
          page: 1,
          limit: USERS_PAGE_LIMIT,
          ...buildUsersFilterParams({
            ...filtersRef.current,
            searchQuery,
          }),
        }),
      );
    }, 300);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
};
