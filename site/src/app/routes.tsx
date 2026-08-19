import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import { SkillPage } from "../pages/skill-page/skill-page";
import { ErrorDetails } from "../widgets/error-details/error-details";
import { Layout } from "../widgets/layout";
import { errorConfig } from "./error-config";
import { ProfilePage } from "../pages/profil-page/profile-page";
import { FavoritesPage } from "../pages/favorites-page/favorites-page";
import { ProtectedLayout, PublicLayout } from "./route-layout";
import { ScrollToTop } from "./scroll-to-top";

/** КОНФИГУРАЦИЯ РОУТЕРА */
export const router = createBrowserRouter([
  // Маршруты с общим Layout (хедер, футер и т.д.)
  {
    element: (
      <>
        <ScrollToTop />
        <Layout>
          <Outlet />
        </Layout>
      </>
    ),
    children: [
      // Главная страница
      {
        index: true,
        element: <HomePage />,
      },

      // Детали навыка
      {
        path: "/skill/:id",
        element: <SkillPage />,
      },

      // Защищенные маршруты (требуют авторизации)
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/skill/create",
            element: <SkillPage />,
          },
          {
            path: "/skill/edit/:id",
            element: <SkillPage />,
          },
          {
            path: "/profile/favorites",
            element: <FavoritesPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
        ],
      },

      // Динамические маршруты для ошибок
      ...Object.entries(errorConfig).map(([code, config]) => ({
        path: `/${code}`,
        element: (
          <ErrorDetails
            image={config.image}
            title={config.title}
            message={config.message}
            onHomeClick={() => (window.location.href = "/")}
            onReportClick={() => console.log(`Сообщить об ошибке ${code}`)}
          />
        ),
      })),
    ],
  },

  // Маршруты без Layout (для страниц авторизации)
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/registration",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },

  // Страница ошибки
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
]);
