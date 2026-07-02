import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusDot } from "@/components/status-dot";
import { DiagnosticService } from "@/core/diagnostic/service";
import type { HealthCheck } from "@/core/types";
import { useActiveProject } from "@/core/store/app-store";

export const Route = createFileRoute("/diagnostic")({
  component: DiagnosticPage,
});

function DiagnosticPage() {
  const project = useActiveProject();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [running, setRunning] = useState(false);

  async function refresh() {
    setRunning(true);
    try {
      setChecks(await DiagnosticService.run(project));
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const okCount = checks.filter((c) => c.status === "ok").length;

  return (
    <div>
      <PageHeader
        title="Santé du projet"
        subtitle={
          project
            ? `Vérifications automatiques sur « ${project.name} ». Aucun jargon, uniquement l'essentiel.`
            : "Ajoutez un projet pour lancer une vérification."
        }
        help={{
          title: "À propos du diagnostic",
          content: (
            <>
              🟢 Tout va bien · 🟠 Attention, action recommandée · 🔴 Problème
              bloquant. Nous ne montrons jamais de message technique — chaque
              alerte est accompagnée d'une explication en français.
            </>
          ),
        }}
        actions={
          <Button variant="outline" onClick={refresh} disabled={running}>
            <RefreshCw className={running ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Relancer
          </Button>
        }
      />

      {checks.length > 0 && (
        <div className="mb-4 text-sm text-muted-foreground">
          {okCount} sur {checks.length} vérifications au vert.
        </div>
      )}

      <div className="grid gap-3">
        {checks.map((c) => (
          <Card key={c.id} className="p-4 shadow-soft">
            <div className="flex items-start gap-4">
              <StatusDot status={c.status} className="mt-1.5" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.label}</div>
                {c.detail && (
                  <div className="mt-1 text-sm text-muted-foreground">{c.detail}</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
