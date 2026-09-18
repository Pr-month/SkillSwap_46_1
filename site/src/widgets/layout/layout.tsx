import { useEffect, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../header";
import { Footer } from "../footer";
import { confirmEmail } from "../../api/authApi";
import { showToast } from "../../utils/toast";
import styles from "./layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;

    confirmEmail(token)
      .then(() => {
        showToast("Email подтвержден!", "success");
      })
      .catch(() => {
        showToast("Не удалось подтвердить email", "error");
      })
      .finally(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("token");
        navigate({ search: newParams.toString() }, { replace: true });
      });
  }, [token, navigate, searchParams]);

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
