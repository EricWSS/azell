import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./theme/ThemeProvider";
import { TrashProvider } from "./context/TrashContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <TrashProvider>
        <App />
      </TrashProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
