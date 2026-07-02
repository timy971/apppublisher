import { useSettings, AppStore } from "@/core/store/app-store";
import { cn } from "@/lib/utils";

/**
 * Badge de bascule Mode Assistant / Mode Expert.
 * En Assistant : tout est guidé étape par étape, jargon masqué.
 * En Expert : détails techniques additionnels affichés dans les écrans avancés.
 */
export function ModeBadge({ className }: { className?: string }) {
  const settings = useSettings();
  const isAssistant = settings.mode === "assistant";
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border bg-muted/60 p-0.5 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label="Mode d'utilisation"
    >
      <button
        type="button"
        onClick={() => AppStore.updateSettings({ mode: "assistant" })}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          isAssistant ? "bg-background shadow-sm" : "text-muted-foreground",
        )}
      >
        Assistant
      </button>
      <button
        type="button"
        onClick={() => AppStore.updateSettings({ mode: "expert" })}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          !isAssistant ? "bg-background shadow-sm" : "text-muted-foreground",
        )}
      >
        Expert
      </button>
    </div>
  );
}
