import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/app";
import "./app/styles/index.css";
import store from "./services/store";
import { ToastProvider } from "./shared/ui/toast";
import { setupApiInterceptors } from "./api/setup";

setupApiInterceptors();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </ToastProvider>
  </StrictMode>,
);
