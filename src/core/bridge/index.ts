import type { SystemBridge } from "./types";
import { electronBridge, hasElectronBridge } from "./electron";
import { webBridge } from "./web";
import { diag } from "@/core/diag/logger";

/**
 * Sélection automatique du bridge. Le renderer ne connaît jamais l'implémentation.
 * L'appel est paresseux : on ne touche à `window.appPublisher` qu'au premier usage
 * afin de rester compatible avec SSR/prerender.
 */
let _bridge: SystemBridge | null = null;

export function bridge(): SystemBridge {
  if (_bridge) return _bridge;
  const isElectron = hasElectronBridge();
  _bridge = isElectron ? electronBridge : webBridge;
  diag("bridge:init", `Bridge sélectionné: ${_bridge.runtime}`, {
    hasWindow: typeof window !== "undefined",
    hasAppPublisher: typeof window !== "undefined" && !!(window as unknown as { appPublisher?: unknown }).appPublisher,
  });
  return _bridge;
}

/** Retourne true si l'application tourne dans Electron (fonctions réelles). */
export function isElectron(): boolean {
  return bridge().runtime === "electron";
}

export type { SystemBridge } from "./types";
