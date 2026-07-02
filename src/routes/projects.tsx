import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, FolderPlus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { AppStore, useProjects, useSettings } from "@/core/store/app-store";
import { ProjectsService } from "@/core/projects/service";
import type { Project, ProjectDraft } from "@/core/types";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = useProjects();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");
  const [preview, setPreview] = useState<ProjectDraft | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  async function detect() {
    if (!path.trim()) return;
    setDetecting(true);
    try {
      setPreview(await ProjectsService.detectFromPath(path.trim()));
    } finally {
      setDetecting(false);
    }
  }

  function add() {
    if (!preview) return;
    const created = ProjectsService.save(preview);
    AppStore.refreshProjects();
    if (!settings.activeProjectId) AppStore.setActiveProject(created.id);
    toast.success("Projet ajouté", { description: created.name });
    setOpen(false);
    setPath("");
    setPreview(null);
  }

  function confirmDelete() {
    if (!toDelete) return;
    ProjectsService.remove(toDelete.id);
    if (settings.activeProjectId === toDelete.id) {
      AppStore.setActiveProject(undefined);
    }
    AppStore.refreshProjects();
    toast.success("Projet retiré");
    setToDelete(null);
  }

  return (
    <div>
      <PageHeader
        title="Vos projets"
        subtitle="Gérez toutes les applications que vous publiez avec AppPublisher."
        help={{
          title: "À propos des projets",
          content:
            "Chaque projet représente une application. Le projet actif est celui sur lequel s'appliquent les actions du tableau de bord. Vous pouvez en changer à tout moment.",
        }}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="h-4 w-4" />
                Ajouter un projet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un projet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Dossier du projet</label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="/chemin/vers/le/projet"
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      className="font-mono"
                    />
                    <Button onClick={detect} disabled={!path.trim() || detecting} variant="secondary">
                      {detecting ? "Détection…" : "Détecter"}
                    </Button>
                  </div>
                </div>
                {preview && (
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <div className="text-sm font-medium">{preview.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Version {preview.currentVersion} · Build {preview.currentBuild}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={add} disabled={!preview}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {projects.length === 0 ? (
        <Card className="p-10 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FolderPlus className="h-6 w-6" />
          </div>
          <div className="text-lg font-semibold">Aucun projet pour l'instant</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Commencez par ajouter votre premier projet.
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {projects.map((p) => {
            const active = p.id === settings.activeProjectId;
            return (
              <Card key={p.id} className="p-4 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
                    {p.logoEmoji ?? "📱"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">{p.name}</div>
                      {active && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                          <Check className="h-3 w-3" /> Projet actif
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{p.localPath}</div>
                    <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                      Version {p.currentVersion} · Build {p.currentBuild}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!active && (
                      <Button variant="outline" size="sm" onClick={() => AppStore.setActiveProject(p.id)}>
                        Rendre actif
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setToDelete(p)}
                      aria-label="Retirer ce projet"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le projet « {toDelete?.name} » sera retiré d'AppPublisher. Vos fichiers
              ne seront pas supprimés de votre ordinateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Retirer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
