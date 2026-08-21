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

  // Не-поисковые фильтры + первичная загрузка: выполняются сразу.
  useEffect(() => {
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

  const isFirstSearchRender = useRef(true);

  // Поиск: debounce; первичный рендер пропускаем — его уже покрывает эффект выше.
  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
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
    }, 300);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
};
