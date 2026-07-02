import type { Project, ProjectDraft, UUID } from "@/core/types";
import { storage, STORAGE_KEYS } from "@/core/storage";
import { JournalService } from "@/core/journal/logger";

function uuid(): UUID {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Détection simulée en Phase 1 (localStorage/UI only). En Phase 2 :
 * remplacer par un appel IPC qui liste réellement les fichiers du dossier
 * choisi. L'interface publique ne changera pas.
 */
export const ProjectsService = {
  list(): Project[] {
    return storage.get<Project[]>(STORAGE_KEYS.projects, []);
  },

  get(id: UUID): Project | undefined {
    return this.list().find((p) => p.id === id);
  },

  save(draft: ProjectDraft): Project {
    const project: Project = {
      ...draft,
      id: uuid(),
      createdAt: now(),
      updatedAt: now(),
    };
    const next = [...this.list(), project];
    storage.set(STORAGE_KEYS.projects, next);
    JournalService.log("info", "Projet ajouté", { id: project.id, name: project.name });
    return project;
  },

  update(id: UUID, patch: Partial<Project>): Project | undefined {
    const list = this.list();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const updated: Project = { ...list[idx], ...patch, id, updatedAt: now() };
    list[idx] = updated;
    storage.set(STORAGE_KEYS.projects, list);
    return updated;
  },

  remove(id: UUID): void {
    const next = this.list().filter((p) => p.id !== id);
    storage.set(STORAGE_KEYS.projects, next);
    JournalService.log("info", "Projet supprimé", { id });
  },

  /**
   * Détection automatique — Phase 1 : simulée d'après le nom du dossier.
   * Renvoie un aperçu prêt à être validé par l'utilisateur.
   */
  async detectFromPath(path: string): Promise<ProjectDraft> {
    JournalService.log("command", "detect", { path });
    // Simulation : on suppose que tout Lovable Android récent a ces fichiers.
    const inferredName = inferName(path);
    return {
      name: inferredName,
      logoEmoji: "📱",
      localPath: path,
      currentVersion: "1.0.0",
      currentBuild: 1,
      detected: {
        hasPackageJson: true,
        hasAndroid: true,
        hasIos: false,
        hasVersionJson: true,
        hasCapacitorConfig: true,
      },
    };
  },
};

function inferName(path: string): string {
  const clean = path.replace(/[\\/]+$/, "");
  const last = clean.split(/[\\/]/).pop() ?? "Mon projet";
  return last.charAt(0).toUpperCase() + last.slice(1);
}
