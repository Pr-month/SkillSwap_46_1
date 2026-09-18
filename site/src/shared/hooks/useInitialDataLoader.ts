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
  const skills = useSelector((state) => state.skills.data);
  const categories = useSelector((state) => state.category.categories);

  // Справочные данные (навыки, категории, подкатегории) загружаем один раз.
  // useRef защищает от повторного dispatch при двойном вызове эффекта
  // в React StrictMode (dev-режим). Дополнительно сверяемся со стором:
  // при пере-монтировании (например, после navigate(..., replace: true))
  // ref сбрасывается, но данные уже загружены — лишний запрос не делаем.
  const staticDataLoaded = useRef(false);

  useEffect(() => {
    if (staticDataLoaded.current) {
      return;
    }

    if (skills.length !== 0 && categories.length !== 0) {
      return;
    }

    staticDataLoaded.current = true;

    if (skills.length === 0) {
      dispatch(fetchSkills());
    }
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, skills.length, categories.length]);

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
