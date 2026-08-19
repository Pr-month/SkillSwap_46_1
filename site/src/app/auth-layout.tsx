import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "../shared/protected-route/protected-route";

/** КОМПОНЕНТ-ОБЕРТКА ДЛЯ АУТЕНТИФИКАЦИОННЫХ МАРШРУТОВ */
export const AuthLayout = () => (
  <ProtectedRoute onlyUnAuth>
    <Outlet />
  </ProtectedRoute>
);
