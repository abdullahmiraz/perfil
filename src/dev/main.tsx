import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HarnessApp } from "@/dev/HarnessApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HarnessApp />
  </StrictMode>,
);
