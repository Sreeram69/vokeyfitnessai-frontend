import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

import { store } from "./app/store";
import { ThemeProvider } from "./context/ThemeContext";

/* =========================
   ROOT RENDER
========================= */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with ID 'root' not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />

          {/* =========================
              GLOBAL TOASTER
          ========================= */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            containerStyle={{
              top: 80,
              right: 20,
            }}
            toastOptions={{
              duration: 3000,

              style: {
                background: "var(--card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "18px",
                padding: "14px 20px",
                fontSize: "13px",
                fontFamily: "Space Grotesk, system-ui, sans-serif",
                fontWeight: "600",
                boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.12)",
                backdropFilter: "blur(16px)",
              },

              success: {
                iconTheme: {
                  primary: "var(--success)",
                  secondary: "var(--card)",
                },
                style: {
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                },
              },

              error: {
                iconTheme: {
                  primary: "var(--danger)",
                  secondary: "var(--card)",
                },
                style: {
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);