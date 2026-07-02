import type { HealthCheck, Project } from "@/core/types";

/**
 * Phase 1 : les vérifications sont simulées et déterministes par projet.
 * Phase 2 (Electron) : chaque check appellera son sonde système (which node,
 * détection Android Studio, présence keystore, ping Google API…).
 */
export const DiagnosticService = {
  async run(project: Project | undefined): Promise<HealthCheck[]> {
    // Petit délai pour laisser l'UI afficher un état "en cours".
    await new Promise((r) => setTimeout(r, 400));

    const has = project?.detected;
    return [
      {
        id: "node",
        label: "Environnement de développement",
        status: "ok",
        detail: "Tout est prêt sur votre ordinateur.",
      },
      {
        id: "android-studio",
        label: "Outils Android",
        status: has?.hasAndroid ? "ok" : "warning",
        detail: has?.hasAndroid
          ? "Le projet Android est présent."
          : "Le projet Android n'a pas encore été préparé.",
      },
      {
        id: "keystore",
        label: "Clé de signature",
        status: project?.keystorePath ? "ok" : "warning",
        detail: project?.keystorePath
          ? "Votre clé de signature est bien configurée."
          : "Aucune clé de signature n'est configurée pour ce projet.",
      },
      {
        id: "play",
        label: "Connexion à Google Play",
        status: project?.playStoreAppId ? "warning" : "warning",
        detail:
          "La connexion à Google Play sera configurée dans une prochaine phase.",
      },
      {
        id: "git",
        label: "Sauvegarde du projet",
        status: project?.githubRepo ? "ok" : "warning",
        detail: project?.githubRepo
          ? "Le projet est bien sauvegardé en ligne."
          : "Le projet n'est pas encore sauvegardé en ligne.",
      },
    ];
  },
};
