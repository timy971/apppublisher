import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSettings } from "@/core/store/app-store";

/**
 * Aide contextuelle : présente sur chaque écran, jamais intrusive.
 * Se cache si l'utilisateur a désactivé l'aide contextuelle dans Paramètres.
 */
export function ContextualHelp({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const settings = useSettings();
  if (!settings.contextualHelpEnabled) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Aide sur cet écran"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-2">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {children}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
