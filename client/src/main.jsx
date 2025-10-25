import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ActiveUserProvider } from './contexts/ActiveUserContext'
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ActiveUserProvider>
        <App />
      </ActiveUserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
