import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Bug, Check, Sparkles, Rocket, Eye } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppStore, useActiveProject, useSettings } from "@/core/store/app-store";
import { ProjectsService } from "@/core/projects/service";
import { VersionService } from "@/core/version/service";
import { HistoryService } from "@/core/history/service";
import type { VersionChangeType } from "@/core/types";
import { runWorkflow, wait } from "@/core/workflow/engine";
import { WorkflowView } from "@/components/workflow-view";
import type { Workflow } from "@/core/types";
import { toast } from "sonner";

export const Route = createFileRoute("/version")({
  component: VersionAssistant,
});

const CHOICES: {
  type: VersionChangeType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "bugfix", title: "Correction de bug", desc: "Petite amélioration ou correction.", icon: Bug },
  { type: "feature", title: "Nouvelle fonctionnalité", desc: "Ajout d'une nouveauté visible.", icon: Sparkles },
  { type: "major", title: "Nouvelle version majeure", desc: "Grand changement, refonte.", icon: Rocket },
  { type: "readonly", title: "Voir uniquement la version", desc: "Ne rien modifier.", icon: Eye },
];

function VersionAssistant() {
  const project = useActiveProject();
  const settings = useSettings();
  const [choice, setChoice] = useState<VersionChangeType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [done, setDone] = useState<{ from: string; to: string; build: number } | null>(null);

  if (!project) {
    return <NoProject />;
  }

  const preview = choice ? VersionService.preview(project, choice) : null;

  async function apply() {
    if (!choice || !preview || !project) return;
    setConfirmOpen(false);
    const start = performance.now();

    const wf = await runWorkflow({
      id: "version",
      title: "Mise à jour de la version",
      onUpdate: setWorkflow,
      steps: [
        {
          id: "version-json",
          title: "Mise à jour du numéro de version",
          run: async () => (await wait(500), { status: "success" }),
        },
        {
          id: "android",
          title: "Préparation de la version Android",
          run: async () => (await wait(600), { status: "success" }),
        },
        {
          id: "package",
          title: "Mise à jour des dépendances",
          run: async () => (await wait(400), { status: "success" }),
        },
        {
          id: "changelog",
          title: "Enregistrement des notes de version",
          run: async () => (await wait(300), { status: "success" }),
        },
        {
          id: "sync",
          title: "Préparation de l'application Android",
          run: async () => (await wait(700), { status: "success" }),
        },
      ],
    });

    if (choice !== "readonly") {
      ProjectsService.update(project.id, {
        currentVersion: preview.to,
        currentBuild: preview.newBuild,
      });
      AppStore.refreshProjects();
      HistoryService.record({
        projectId: project.id,
        projectName: project.name,
        version: preview.to,
        build: preview.newBuild,
        user: settings.userName || "vous",
        durationMs: performance.now() - start,
        outcome: "success",
        message: "Mise à jour de la version",
      });
      setDone({ from: preview.from, to: preview.to, build: preview.newBuild });
      toast.success("Version mise à jour", { description: `${preview.from} → ${preview.to}` });
    } else {
      toast.info("Aucune modification appliquée");
      setDone({ from: preview.from, to: preview.to, build: preview.newBuild });
    }
    setWorkflow(wf);
  }

  if (done) {
    return (
      <div>
        <PageHeader title="Version mise à jour" subtitle="Votre projet est prêt pour la prochaine étape." />
        <Card className="p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="h-7 w-7" />
          </div>
          <div className="text-sm text-muted-foreground">Nouvelle version</div>
          <div className="mt-1 text-4xl font-semibold tabular-nums">{done.to}</div>
          <div className="mt-1 text-sm text-muted-foreground">Build {done.build}</div>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/">Retour au tableau de bord</Link>
            </Button>
            <Button asChild>
              <Link to="/build">
                Construire Android
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (workflow) {
    return (
      <div>
        <PageHeader title="Mise à jour en cours" subtitle="Merci de patienter, chaque étape s'exécute automatiquement." />
        <WorkflowView workflow={workflow} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Modifier la version"
        subtitle="Choisissez le type de changement. AppPublisher calcule le nouveau numéro pour vous."
        help={{
          title: "À propos du versionning",
          content:
            "Le numéro de version indique aux utilisateurs l'ampleur des changements. Une correction augmente le dernier chiffre, une nouveauté le deuxième, une refonte majeure le premier.",
        }}
      />

      <div className="mb-6 rounded-xl border bg-muted/40 p-4 text-sm">
        Projet actuel · <strong>{project.name}</strong> · Version{" "}
        <span className="tabular-nums font-semibold">{project.currentVersion}</span> · Build{" "}
        <span className="tabular-nums font-semibold">{project.currentBuild}</span>
      </div>

      <div className="grid gap-3">
        {CHOICES.map((c) => {
          const selected = choice === c.type;
          const p = VersionService.preview(project, c.type);
          return (
            <button
              key={c.type}
              type="button"
              onClick={() => setChoice(c.type)}
              className={
                "flex items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated " +
                (selected ? "ring-2 ring-primary border-primary" : "")
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-muted-foreground">{c.desc}</div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-xs text-muted-foreground">Nouvelle version</div>
                <div className="text-base font-semibold">{p.to}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" disabled={!choice} onClick={() => setConfirmOpen(true)}>
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la mise à jour</AlertDialogTitle>
            <AlertDialogDescription>
              L'application va passer de <strong className="tabular-nums">{preview?.from}</strong>{" "}
              à <strong className="tabular-nums">{preview?.to}</strong>. Continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={apply}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NoProject() {
  return (
    <div>
      <PageHeader title="Modifier la version" />
      <Card className="p-8 text-center shadow-soft">
        <div className="text-lg font-semibold">Aucun projet actif</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Sélectionnez ou ajoutez un projet pour utiliser cet assistant.
        </div>
        <Button asChild className="mt-4">
          <Link to="/projects">Aller aux projets</Link>
        </Button>
      </Card>
    </div>
  );
}
