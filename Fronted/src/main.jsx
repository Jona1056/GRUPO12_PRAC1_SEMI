
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { createRoot } from "react-dom/client";


const appRoot = document.getElementById("root");

createRoot(appRoot).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);