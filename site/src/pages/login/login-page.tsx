import { useEffect, useState, type FC, type SyntheticEvent } from "react";
import { LoginUI } from "../../shared/ui/login";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, type RootState } from "../../services/store";
import { fetchLogin } from "../../services/auth/actions";
import { handleError } from "../../utils/errors/errorUtils";

export const Login: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = (location.state as { from?: string })?.from || "/";

  // Если пользователь уже авторизован, произойдет редирект на главную
  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await dispatch(fetchLogin({ email, password })).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      setError(handleError(err).message);
    }
  };

  return (
    <LoginUI
      errorText={error || ""}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
