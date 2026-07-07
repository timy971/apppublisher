/**
 * Point d'entrée SPA utilisé UNIQUEMENT pour le build Electron.
 *
 * Le web (Lovable) continue d'utiliser le pipeline SSR de
 * @lovable.dev/vite-tanstack-config avec src/server.ts + src/start.ts.
 * Ici, on monte le router côté client dans #root, on charge les styles
 * globaux, et on laisse Electron servir le tout en file://.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { routeTree } from "./routeTree.gen";
import "./styles.css";
import { diag } from "./core/diag/logger";

diag("boot", "main.electron.tsx loaded");

if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    diag("window:error", e.message || "unknown", {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      error: String(e.error?.stack ?? e.error ?? ""),
    });
  });
  window.addEventListener("unhandledrejection", (e) => {
    diag("window:unhandledrejection", String((e.reason as Error)?.message ?? e.reason), {
      stack: String((e.reason as Error)?.stack ?? ""),
    });
  });
}

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Élément #root introuvable dans index.html");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
