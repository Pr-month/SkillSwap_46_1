import { useEffect } from "react";
import { fetchProfile } from "../services/auth/actions";
import { useDispatch, useSelector } from "../services/store";
import { router } from "./routes";
import { ThemeProvider } from "./theme-provider";
import { ToastRegistry } from "./toast-registry";
import { RouterProvider } from "react-router-dom";

function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    if (!currentUser) dispatch(fetchProfile());
  }, [dispatch, currentUser]);

  return (
    <ThemeProvider>
      <ToastRegistry />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
