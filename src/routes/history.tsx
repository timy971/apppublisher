import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { HistoryService } from "@/core/history/service";
import { useState } from "react";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [records] = useState(() => HistoryService.list());

  return (
    <div>
      <PageHeader
        title="Historique"
        subtitle="Toutes vos publications, dans l'ordre chronologique."
        help={{
          title: "À propos de l'historique",
          content:
            "Chaque action de mise à jour ou de construction est enregistrée ici, avec sa durée et son résultat. Utile pour retrouver rapidement une version publiée.",
        }}
      />

      {records.length === 0 ? (
        <Card className="p-10 text-center shadow-soft">
          <div className="text-lg font-semibold">Rien à afficher pour l'instant</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Dès votre première mise à jour, elle apparaîtra ici.
          </div>
        </Card>
      ) : (
        <div className="grid gap-2">
          {records.map((r) => (
            <Card key={r.id} className="p-4 shadow-soft">
              <div className="flex items-center gap-4">
                <div
                  className={
                    "flex h-9 w-9 items-center justify-center rounded-full " +
                    (r.outcome === "success" ? "bg-success/15 text-success" : "bg-danger/15 text-danger")
                  }
                >
                  {r.outcome === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {r.projectName} · v{r.version} · Build {r.build}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("fr-FR")} · par {r.user} ·{" "}
                    {(r.durationMs / 1000).toFixed(1)} s
                    {r.message ? ` · ${r.message}` : ""}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
