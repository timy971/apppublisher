import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Hammer, Check, FolderOpen, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppStore, useActiveProject, useSettings } from "@/core/store/app-store";
import { runWorkflow, wait } from "@/core/workflow/engine";
import { WorkflowView } from "@/components/workflow-view";
import type { Workflow } from "@/core/types";
import { HistoryService } from "@/core/history/service";
import { toast } from "sonner";

export const Route = createFileRoute("/build")({
  component: BuildPage,
});

function BuildPage() {
  const project = useActiveProject();
  const settings = useSettings();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [artifact, setArtifact] = useState<string | null>(null);

  if (!project) {
    return (
      <div>
        <PageHeader title="Construire Android" />
        <Card className="p-8 text-center shadow-soft">
          <div className="text-lg font-semibold">Aucun projet actif</div>
          <Button asChild className="mt-4">
            <Link to="/projects">Aller aux projets</Link>
          </Button>
        </Card>
      </div>
    );
  }

  async function build() {
    if (!project) return;
    const start = performance.now();
    setArtifact(null);
    const wf = await runWorkflow({
      id: "build-android",
      title: "Construction de l'application Android",
      onUpdate: setWorkflow,
      steps: [
        { id: "check", title: "Vérification du projet", run: async () => (await wait(500), { status: "success" }) },
        { id: "prep", title: "Préparation de l'application Android", run: async () => (await wait(800), { status: "success" }) },
        { id: "compile", title: "Compilation de l'application", run: async () => (await wait(1400), { status: "success" }) },
        { id: "sign", title: "Signature de l'application", run: async () => (await wait(700), { status: "success" }) },
        { id: "package", title: "Création du fichier final", run: async () => (await wait(500), { status: "success" }) },
      ],
    });
    const name = `${project.name.toLowerCase().replace(/\s+/g, "-")}-v${project.currentVersion}.aab`;
    setArtifact(name);
    setWorkflow(wf);
    HistoryService.record({
      projectId: project.id,
      projectName: project.name,
      version: project.currentVersion,
      build: project.currentBuild,
      user: settings.userName || "vous",
      durationMs: performance.now() - start,
      outcome: "success",
      message: "Construction Android",
    });
    toast.success("Application construite", { description: name });
    AppStore.refreshProjects();
  }

  return (
    <div>
      <PageHeader
        title="Construire Android"
        subtitle="AppPublisher fabrique le fichier prêt à être envoyé sur Google Play."
        help={{
          title: "À propos de la construction",
          content:
            "Cette étape produit un fichier .aab, le format demandé par Google Play. Vous n'avez rien à faire de manuel : chaque étape est exécutée pour vous.",
        }}
      />

      <div className="mb-6 rounded-xl border bg-muted/40 p-4 text-sm">
        Projet actuel · <strong>{project.name}</strong> · Version{" "}
        <span className="tabular-nums font-semibold">{project.currentVersion}</span> · Build{" "}
        <span className="tabular-nums font-semibold">{project.currentBuild}</span>
      </div>

      {!workflow && (
        <Card className="p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Hammer className="h-7 w-7" />
          </div>
          <div className="text-lg font-semibold">Prêt à construire</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Cela prend quelques instants. Vous n'avez rien à surveiller.
          </div>
          <Button size="lg" className="mt-6" onClick={build}>
            Lancer la construction
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {workflow && (
        <>
          <WorkflowView workflow={workflow} />

          {artifact && (
            <Card className="mt-6 p-6 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">Application construite avec succès</div>
                  <div className="mt-1 text-sm text-muted-foreground font-mono">{artifact}</div>
                </div>
                <Button variant="outline" onClick={() => toast.info("Ouverture du dossier disponible en Phase 2")}>
                  <FolderOpen className="h-4 w-4" />
                  Ouvrir le dossier
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
