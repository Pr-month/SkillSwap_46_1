import { ProtectedRoute } from "../shared/protected-route/protected-route";
import { Outlet } from "react-router-dom";

export const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

export const PublicLayout = () => (
  <ProtectedRoute onlyUnAuth>
    <Outlet />
  </ProtectedRoute>
);
