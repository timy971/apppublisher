import { createFileRoute } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { StatusDot } from "@/components/status-dot";
import { useActiveProject } from "@/core/store/app-store";

/**
 * Publier sur Google Play — Phase 1 : architecture prête, connexion réelle
 * en Phase 4. La page affiche déjà la checklist qui sera exécutée.
 */
export const Route = createFileRoute("/publish")({
  component: PublishPage,
});

const CHECKLIST = [
  { label: "Numéro de version défini", status: "ok" as const },
  { label: "Fichier d'application construit", status: "warning" as const },
  { label: "Clé de signature configurée", status: "warning" as const },
  { label: "Connexion à Google Play établie", status: "warning" as const },
  { label: "Projet sauvegardé en ligne", status: "warning" as const },
];

function PublishPage() {
  const project = useActiveProject();
  return (
    <div>
      <PageHeader
        title="Publier sur Google"
        subtitle="Cette fonctionnalité arrive dans une prochaine phase. Voici la vérification qui sera effectuée avant tout envoi."
        help={{
          title: "À propos de la publication",
          content:
            "Avant tout envoi à Google Play, AppPublisher vérifie que chaque élément indispensable est prêt. Si un seul point est au rouge ou à l'orange, la publication reste bloquée pour votre sécurité.",
        }}
      />

      <Card className="p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">
              {project ? `Préparation pour « ${project.name} »` : "Aucun projet sélectionné"}
            </div>
            <div className="text-sm text-muted-foreground">
              Checklist de publication (aperçu)
            </div>
          </div>
        </div>

        <ul className="divide-y">
          {CHECKLIST.map((c) => (
            <li key={c.label} className="flex items-center gap-3 py-3">
              <StatusDot status={c.status} />
              <span className="flex-1">{c.label}</span>
              <span className="text-xs text-muted-foreground">
                {c.status === "ok" ? "Prêt" : "À configurer"}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
          La publication automatique vers Google Play est prévue dans une phase
          ultérieure. L'architecture actuelle est déjà prête à l'accueillir sans
          modification des autres écrans.
        </div>
      </Card>
    </div>
  );
}
