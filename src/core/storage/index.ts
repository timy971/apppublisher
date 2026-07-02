/**
 * Adapter de persistance. Phase 1 : localStorage (navigateur).
 * Phase 2 (Electron) : remplacer par un adapter IPC vers le disque, sans
 * changer une seule ligne des services qui utilisent cette interface.
 */

export interface StorageAdapter {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  private prefix = "apppublisher.v1.";

  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(this.prefix + key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      // silencieux : l'UI ne doit pas planter si le stockage est plein
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.prefix + key);
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();

export const STORAGE_KEYS = {
  settings: "settings",
  projects: "projects",
  history: "history",
  journal: "journal",
} as const;
