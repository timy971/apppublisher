import type { Workflow, WorkflowStep, WorkflowStepStatus } from "@/core/types";

/**
 * Workflow Engine — enchaîne des étapes visuellement, avec statut par étape.
 * Chaque étape est une fonction async qui renvoie un statut final et un
 * message. L'engine est agnostique du domaine : il sert pour build, publish,
 * diagnostic, versionning, etc.
 */

export interface WorkflowStepRunner {
  id: string;
  title: string;
  description?: string;
  run: () => Promise<{ status: Exclude<WorkflowStepStatus, "pending" | "running">; detail?: string }>;
}

export interface WorkflowRunnerOptions {
  id: string;
  title: string;
  steps: WorkflowStepRunner[];
  onUpdate: (w: Workflow) => void;
}

export async function runWorkflow(opts: WorkflowRunnerOptions): Promise<Workflow> {
  const steps: WorkflowStep[] = opts.steps.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    status: "pending" as WorkflowStepStatus,
  }));

  const workflow: Workflow = {
    id: opts.id,
    title: opts.title,
    steps,
    currentIndex: 0,
    startedAt: new Date().toISOString(),
  };
  opts.onUpdate({ ...workflow, steps: [...steps] });

  for (let i = 0; i < opts.steps.length; i++) {
    workflow.currentIndex = i;
    steps[i] = { ...steps[i], status: "running" };
    opts.onUpdate({ ...workflow, steps: [...steps] });
    try {
      const result = await opts.steps[i].run();
      steps[i] = { ...steps[i], status: result.status, detail: result.detail };
    } catch (e) {
      steps[i] = {
        ...steps[i],
        status: "error",
        detail: e instanceof Error ? e.message : "Erreur inconnue",
      };
      opts.onUpdate({ ...workflow, steps: [...steps] });
      workflow.finishedAt = new Date().toISOString();
      return { ...workflow, steps: [...steps] };
    }
    opts.onUpdate({ ...workflow, steps: [...steps] });
  }

  workflow.finishedAt = new Date().toISOString();
  return { ...workflow, steps: [...steps] };
}

/** Utilitaire de délai visuel pour simuler une étape en Phase 1. */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
