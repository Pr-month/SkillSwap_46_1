import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "../../services/store";
import { fetchSkills } from "../../services/skill/actions";
import { fetchCategories } from "../../services/category/actions";
import { fetchMyRequests } from "../../services/request/actions";

export const useInitialDataLoader = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const sentRequests = useSelector((state) => state.requests.sent);
  const receivedRequests = useSelector((state) => state.requests.received);

  // Справочные данные (навыки, категории, подкатегории) загружаем один раз.
  // useRef защищает от повторного dispatch при двойном вызове эффекта
  // в React StrictMode (dev-режим).
  const staticDataLoaded = useRef(false);

  useEffect(() => {
    if (staticDataLoaded.current) {
      return;
    }
    staticDataLoaded.current = true;

    dispatch(fetchSkills());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Личные заявки грузим при наличии авторизованного пользователя и только
  // пока данных нет. Дополнительно защищаемся от дублирования в StrictMode.
  const requestsLoadedForUser = useRef<typeof currentUser | null>(null);

  useEffect(() => {
    if (
      !currentUser ||
      sentRequests.length !== 0 ||
      receivedRequests.length !== 0
    ) {
      return;
    }

    if (requestsLoadedForUser.current === currentUser) {
      return;
    }
    requestsLoadedForUser.current = currentUser;

    dispatch(fetchMyRequests());
  }, [dispatch, currentUser, sentRequests.length, receivedRequests.length]);
};
