import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "../../services/store";
import { fetchUsers } from "../../services/user/actions";
import {
  selectUserHasMore,
  selectUserLoading,
  selectUserPage,
} from "../../services/user/selectors";

export const USERS_PAGE_LIMIT = 20;

/**
 * Возвращает ref для sentinel-элемента внизу страницы. При попадании sentinel
 * во viewport подгружает следующую страницу пользователей, пока есть ещё данные.
 * Запросы прекращаются автоматически, когда `hasMore === false` или идёт загрузка.
 */
export const useUsersInfiniteScroll = () => {
  const dispatch = useDispatch();
  const page = useSelector(selectUserPage);
  const hasMore = useSelector(selectUserHasMore);
  const loading = useSelector(selectUserLoading);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          dispatch(fetchUsers({ page: page + 1, limit: USERS_PAGE_LIMIT }));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, page, hasMore, loading]);

  return sentinelRef;
};
