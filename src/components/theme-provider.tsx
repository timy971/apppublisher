import { useEffect } from "react";
import { useSettings } from "@/core/store/app-store";

/**
 * Applique le thème (clair / sombre / système) sur <html>.
 * Écoute les changements de préférences système en temps réel.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    const apply = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved =
        settings.theme === "system" ? (prefersDark ? "dark" : "light") : settings.theme;
      root.classList.toggle("dark", resolved === "dark");
    };

    apply();

    if (settings.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [settings.theme]);

  return <>{children}</>;
}
