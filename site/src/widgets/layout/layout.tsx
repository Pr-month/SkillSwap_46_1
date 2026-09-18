import { useEffect, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../header";
import { Footer } from "../footer";
import { confirmEmail } from "../../api/authApi";
import { fetchProfile } from "../../services/auth/actions";
import { useDispatch } from "../../services/store";
import { showToast } from "../../utils/toast";
import styles from "./layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;

    confirmEmail(token)
      .then(() => {
        showToast("Email подтвержден!", "success");
        // Обновляем профиль, чтобы кнопка подтверждения почты сменила
        // состояние без перезагрузки страницы.
        dispatch(fetchProfile());
      })
      .catch(() => {
        showToast("Не удалось подтвердить email", "error");
      })
      .finally(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("token");
        navigate({ search: newParams.toString() }, { replace: true });
      });
  }, [token, navigate, searchParams, dispatch]);

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
