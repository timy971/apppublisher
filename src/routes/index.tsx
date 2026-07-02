import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  GitBranch,
  Hammer,
  Rocket,
  HeartPulse,
  History as HistoryIcon,
  Settings as SettingsIcon,
  FolderPlus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useSettings, useActiveProject, useProjects } from "@/core/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const settings = useSettings();
  const activeProject = useActiveProject();
  const projects = useProjects();
  const navigate = useNavigate();

  // Premier lancement → assistant de configuration
  useEffect(() => {
    if (!settings.onboardingCompleted) {
      navigate({ to: "/setup" });
    }
  }, [settings.onboardingCompleted, navigate]);

  if (!settings.onboardingCompleted) return null;

  const firstName = settings.userName || "vous";

  return (
    <div>
      <PageHeader
        title={`Bienvenue ${firstName}`}
        subtitle="Choisissez ce que vous souhaitez faire. Chaque action vous guide pas à pas."
        help={{
          title: "À propos du tableau de bord",
          content: (
            <>
              C'est votre point de départ. Le projet affiché ici est celui sur lequel
              toutes les actions s'appliqueront. Vous pouvez en changer depuis la
              page <strong>Projets</strong>.
            </>
          ),
        }}
      />

      {activeProject ? (
        <Card className="mb-8 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                {activeProject.logoEmoji ?? "📱"}
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Projet actuel
                </div>
                <div className="text-xl font-semibold truncate">{activeProject.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-8 pr-2">
              <Stat label="Version" value={activeProject.currentVersion} />
              <Stat label="Build" value={String(activeProject.currentBuild)} />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-8 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Aucun projet actif</div>
              <div className="text-sm text-muted-foreground mt-1">
                {projects.length === 0
                  ? "Ajoutez votre premier projet pour commencer."
                  : "Sélectionnez un projet depuis la page Projets."}
              </div>
            </div>
            <Button asChild>
              <Link to="/projects">
                <FolderPlus className="h-4 w-4" />
                {projects.length === 0 ? "Ajouter un projet" : "Voir les projets"}
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-3 text-sm font-medium text-muted-foreground">
        Que voulez-vous faire ?
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard to="/version" icon={GitBranch} title="Modifier la version" desc="Correction, nouveauté ou grande version." />
        <ActionCard to="/build" icon={Hammer} title="Construire Android" desc="Fabriquer le fichier prêt à publier." />
        <ActionCard to="/publish" icon={Rocket} title="Publier sur Google" desc="Envoyer votre application aux utilisateurs." />
        <ActionCard to="/diagnostic" icon={HeartPulse} title="Vérifier le projet" desc="Contrôler que tout est bien configuré." />
        <ActionCard to="/history" icon={HistoryIcon} title="Historique" desc="Retrouver toutes vos publications." />
        <ActionCard to="/settings" icon={SettingsIcon} title="Paramètres" desc="Nom, thème, préférences." />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </Link>
  );
}
