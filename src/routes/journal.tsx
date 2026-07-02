import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JournalService } from "@/core/journal/logger";
import type { JournalEntry } from "@/core/types";
import { toast } from "sonner";

export const Route = createFileRoute("/journal")({
  component: JournalPage,
});

function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => JournalService.list());

  return (
    <div>
      <PageHeader
        title="Journal technique"
        subtitle="Réservé à l'assistance. Ce contenu n'est jamais nécessaire pour utiliser AppPublisher."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              JournalService.clear();
              setEntries([]);
              toast.success("Journal effacé");
            }}
          >
            Effacer
          </Button>
        }
      />

      {entries.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground shadow-soft">
          Le journal est vide.
        </Card>
      ) : (
        <Card className="p-4 shadow-soft">
          <ul className="divide-y">
            {entries.map((e) => (
              <li key={e.id} className="py-2 text-sm font-mono">
                <span className="text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleTimeString("fr-FR")}
                </span>{" "}
                <span
                  className={
                    e.level === "error"
                      ? "text-danger"
                      : e.level === "warn"
                        ? "text-warning"
                        : e.level === "command"
                          ? "text-primary"
                          : ""
                  }
                >
                  [{e.level}]
                </span>{" "}
                {e.message}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
