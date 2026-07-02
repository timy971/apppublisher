/**
 * AppPublisher — Contrats de domaine (définitifs pour la Phase 1+).
 * Toute la couche UI dépend de ces types. Les implémentations (localStorage
 * en Phase 1, IPC Electron en Phase 2+) doivent respecter ces interfaces.
 */

export type UUID = string;

/* ---------- Projet ---------- */

export interface Project {
  id: UUID;
  name: string;
  logoEmoji?: string;
  localPath: string;
  githubRepo?: string;
  playStoreAppId?: string;
  keystorePath?: string;
  buildCommand?: string;
  currentVersion: string; // ex "1.2.0"
  currentBuild: number; // ex 3
  detected: {
    hasPackageJson: boolean;
    hasAndroid: boolean;
    hasIos: boolean;
    hasVersionJson: boolean;
    hasCapacitorConfig: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type ProjectDraft = Omit<Project, "id" | "createdAt" | "updatedAt">;

/* ---------- Versioning ---------- */

export type VersionChangeType =
  | "bugfix" // patch : 1.2.0 -> 1.2.1
  | "feature" // minor : 1.2.0 -> 1.3.0
  | "major" // major : 1.2.0 -> 2.0.0
  | "readonly"; // pas de changement

export interface VersionBumpPreview {
  from: string;
  to: string;
  newBuild: number;
  fromBuild: number;
}

/* ---------- Diagnostic ---------- */

export type HealthStatus = "ok" | "warning" | "error" | "unknown";

export interface HealthCheck {
  id: string;
  label: string; // français, sans jargon
  status: HealthStatus;
  detail?: string; // message d'aide en français
}

/* ---------- Historique ---------- */

export type PublishOutcome = "success" | "failure";

export interface PublishRecord {
  id: UUID;
  projectId: UUID;
  projectName: string;
  version: string;
  build: number;
  user: string;
  durationMs: number;
  outcome: PublishOutcome;
  message?: string;
  createdAt: string;
}

/* ---------- Workflow Engine ---------- */

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "success"
  | "warning"
  | "error"
  | "skipped";

export interface WorkflowStep {
  id: string;
  title: string; // français
  description?: string;
  status: WorkflowStepStatus;
  detail?: string;
}

export interface Workflow {
  id: string;
  title: string;
  steps: WorkflowStep[];
  currentIndex: number;
  startedAt?: string;
  finishedAt?: string;
}

/* ---------- Journal caché ---------- */

export type JournalLevel = "info" | "warn" | "error" | "command";

export interface JournalEntry {
  id: UUID;
  level: JournalLevel;
  message: string;
  context?: Record<string, unknown>;
  createdAt: string;
}

/* ---------- Erreurs traduites ---------- */

export interface TranslatedError {
  title: string;
  explanation: string;
  solution: string;
  retryable: boolean;
}

/* ---------- Paramètres ---------- */

export type ThemePreference = "light" | "dark" | "system";
export type ExperienceMode = "assistant" | "expert";
export type Language = "fr" | "en";

export interface Settings {
  userName: string;
  theme: ThemePreference;
  mode: ExperienceMode;
  language: Language;
  projectsRootPath?: string;
  activeProjectId?: UUID;
  onboardingCompleted: boolean;
  contextualHelpEnabled: boolean;
}
