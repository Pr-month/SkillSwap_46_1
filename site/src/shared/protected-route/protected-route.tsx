import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "../../services/store";
// import { Preloader } from "../ui";

export interface ProtectedRouteProps extends PropsWithChildren {
  onlyUnAuth?: boolean;
}

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: ProtectedRouteProps): React.JSX.Element => {
  // const loading = useSelector((state) => state.auth.loading); // статус: авторизация/регистрация выполняется?
  const user = useSelector((state) => state.auth.currentUser); // данные пользователя
  const location = useLocation();

  // Если авторизация/регистрация не завершена, то показываем Preloader
  // if (loading) {
  //   return <Preloader />;
  // }

  /** ВАРИАНТЫ "ТИП МАРШРУТА - ТИП ПОЛЬЗОВАТЕЛЯ"*/

  // 1. Если маршрут для авторизованного пользователя, но он НЕ авторизован, то редирект на /login
  if (!onlyUnAuth && !user) {
    // если пользователя в хранилище нет, то редирект на страницу автоирзации
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // 2. Если маршрут для НЕавторизованного пользователя, но он авторизован, то при обратном
  // редиректе получаем данные о месте назначения редиректа из объекта location.state, либо
  // при их отсутствии - редирект на главную страницу
  if (onlyUnAuth && user) {
    // Перенаправляем пользователя туда, куда он хотел (если есть state) или на главную страницу
    const from = location.state?.from || "/";
    return <Navigate to={from} />;
  }

  // 3. Если маршрут для НЕавторизованных пользователей и пользователь НЕ авторизован
  // ИЛИ
  // 4. Если маршрут для авторизованных пользователей и пользователь авторизован
  // ТО рендер children-компонента

  return <>{children}</>;
};
