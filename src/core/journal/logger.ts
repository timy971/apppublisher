import type { JournalEntry, JournalLevel } from "@/core/types";
import { storage, STORAGE_KEYS } from "@/core/storage";

const MAX_ENTRIES = 500;

export const JournalService = {
  list(): JournalEntry[] {
    return storage.get<JournalEntry[]>(STORAGE_KEYS.journal, []);
  },

  log(level: JournalLevel, message: string, context?: Record<string, unknown>): void {
    const entry: JournalEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      level,
      message,
      context,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...this.list()].slice(0, MAX_ENTRIES);
    storage.set(STORAGE_KEYS.journal, next);
  },

  clear(): void {
    storage.remove(STORAGE_KEYS.journal);
  },
};
