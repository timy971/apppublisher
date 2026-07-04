# AppPublisher — Intégration Electron

Ce dossier contient le **main process** (`main.cjs`) et le **preload**
(`preload.cjs`) d'AppPublisher. Le renderer (le code React) n'a jamais
accès direct à Node.js : toute opération système passe par le contrat
typé exposé via `contextBridge`, consommé côté renderer par
`src/core/bridge/electron.ts`.

## Architecture

```
┌────────────────────────┐        ┌────────────────────────┐
│  Renderer (React)      │        │  Main process (Node)   │
│  src/core/bridge/*     │  IPC   │  electron/main.cjs     │
│  window.appPublisher   │◀──────▶│  spawn / fs / dialog   │
└────────────────────────┘        └────────────────────────┘
        ▲
        │
┌────────────────────────┐
│  electron/preload.cjs  │  (contextIsolation:true, sandbox:true)
└────────────────────────┘
```

## Sécurité (Phase 2)

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- `exec:run` : commandes limitées à `node`, `npm`, `npx`, `git`, `java`,
  `gradlew` ; caractères shell interdits ; `shell:false` ; `env` du renderer
  ignoré ; `cwd` obligatoirement dans une racine projet approuvée.
- `fs:*` / `shell:*` : chaque chemin est canonicalisé (`realpath`) puis
  vérifié comme contenu dans une racine approuvée.

Les racines approuvées sont peuplées uniquement par :
- `projects:chooseFolder` (sélecteur natif),
- `projects:scan` (dossiers contenant des projets),
- `projects:registerRoots` au démarrage (voir ci-dessous).

## Nouveautés Phase 3

- **Import du PATH utilisateur** : au démarrage, un login shell (`zsh -ilc`
  / `bash -lc`) est lancé une fois pour récupérer le `PATH` qui contient
  Homebrew, nvm, JDK, etc. Sans ça, une app lancée depuis le Finder ne
  trouverait ni `node`, ni `npm`, ni `java`.
- **`projects:registerRoots`** : au montage, le renderer appelle
  `bridge().projects.registerRoots(paths)` avec les projets déjà connus.
  C'est indispensable pour que les fichiers d'un projet sauvegardé
  redeviennent lisibles au 2ᵉ lancement.
- **Écritures disque confinées** : `fs:writeText`, `fs:writeJson`,
  `fs:mkdir`, `fs:copyFile`. Utilisées par `BackupService` pour créer
  de vrais snapshots dans `<projet>/.apppublisher-backups/`.
- **`shell:openFolder`** accepte désormais un fichier : le dossier parent
  est ouvert. Le renderer peut passer directement le chemin d'un `.aab`.

## Lancement en développement

```bash
# terminal 1
npm run dev
# terminal 2
npm run electron:dev
```

## Prérequis d'installation (une fois)

Depuis votre machine :

```bash
npm install --save-dev electron @electron/packager
```

Ces dépendances ne sont pas installées côté sandbox Lovable.

## Packaging

```bash
# macOS (Apple Silicon)
npm run electron:pack:mac

# Windows
npm run electron:pack:win
```

Le binaire est produit dans `electron-release/`. Aucune signature n'est
appliquée : pour une distribution publique, prévoir un certificat
Developer ID (macOS) ou un certificat de signature de code (Windows).
