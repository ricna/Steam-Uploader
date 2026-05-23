# Architecture Overview

A high-level view of how Steam Uploader is built. For an in-depth tour, see [docs/architecture.md](https://github.com/ricna/Steam-Uploader/blob/main/docs/architecture.md) in the repository.

## Three runtime contexts

Steam Uploader is a standard Electron application — but the way the boundaries are drawn matters:

```
┌─────────────────────────────────────────────────────────┐
│  Main process — Node.js                                 │
│  • Spawns SteamCMD                                      │
│  • Talks to the file system                             │
│  • Encrypts credentials via OS keychain                 │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ Typed IPC contract
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Preload — Node.js, contextIsolated                     │
│  • Exposes `window.api` to the renderer                 │
│  • Otherwise zero logic                                 │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Renderer — sandboxed browser                           │
│  • React + Tailwind UI                                  │
│  • No direct access to Node, fs, or the network         │
└─────────────────────────────────────────────────────────┘
```

The renderer **cannot read files, cannot run subprocesses, and can only fetch from `https://store.steampowered.com`** (enforced by the Content Security Policy). Every privileged operation goes through the IPC layer, where inputs are validated.

## The IPC contract

A single TypeScript interface in [`src/shared/api.ts`](https://github.com/ricna/Steam-Uploader/blob/main/src/shared/api.ts) describes everything the renderer can ask the main process to do:

```ts
export interface ElectronAPI {
  config: { get(); save(c); }
  steam:  { lookupApp(id); upload(req); onUploadLog(cb); }
  sdk:    { getInfo(); checkForUpdates(); }
  dialog: { selectFolder(); selectFile(filters); }
  app:    { getBuildInfo(); }
}
```

This is the contract. The preload exposes an object that satisfies it. The main process handles the IPC channels. The renderer consumes it through a typed `api` helper.

## Folder layout

```
src/
├── main/
│   ├── index.ts              entry: window + lifecycle
│   ├── ipc/handlers.ts       one place for every IPC channel
│   ├── services/
│   │   ├── steamcmd.ts       runs SteamCMD, streams logs
│   │   ├── vdf.ts            generates Valve Data Files
│   │   ├── credentials.ts    safeStorage wrapper
│   │   ├── config-store.ts   electron-store wrapper
│   │   ├── steam-api.ts      store.steampowered.com client
│   │   └── sdk-manager.ts    resolves bundled steamcmd path
│   └── lib/validation.ts     IPC input validation
├── preload/index.ts          contextIsolated bridge
├── shared/
│   ├── types.ts              data types
│   └── api.ts                IPC interface
└── renderer/src/
    ├── App.tsx               composition root
    ├── components/           one per file
    ├── hooks/                useConfig, useUpload, useSdkInfo, useBuildInfo
    └── lib/api.ts            typed window.api accessor
```

## The upload pipeline

```
User clicks "Upload to Steam"
            │
            ▼
useUpload.upload(request)       ← React hook
            │
            ▼
api.steam.upload(request)       ← IPC, fully typed
            │
            ▼
ipc/handlers.ts (main process)
   1. Validate inputs (AppID, depots, username, branch)
   2. Resolve SteamCMD path (bundled by default)
   3. vdf.writeBuildScripts()   → app_*.vdf + depot_*.vdf
   4. steamcmd.runUpload()      → spawn steamcmd.exe
            │
            ▼
SteamCMD stdout/stderr ────────────► `steam:upload-log` IPC events
            │
            ▼
useUpload appends each line   →   LogPanel re-renders live
            │
            ▼
Process exits → { success, exitCode }
```

## Security model in one paragraph

The renderer is treated as untrusted (because in principle it could be loading remote content). Every value that crosses IPC is validated in `validation.ts`. App IDs and Depot IDs must be numeric. Paths are normalized and rejected for `..` traversal. Usernames are restricted to a safe character set. Passwords are encrypted via Electron's `safeStorage` (DPAPI on Windows, Keychain on macOS) and only decrypted at the moment SteamCMD is spawned. The renderer has `contextIsolation: true`, `nodeIntegration: false`, and a CSP that only permits images from `*.steamstatic.com` and connections to `store.steampowered.com`.

## Where to read next

- [docs/architecture.md](https://github.com/ricna/Steam-Uploader/blob/main/docs/architecture.md) — same content, more depth, with code links
- [docs/building.md](https://github.com/ricna/Steam-Uploader/blob/main/docs/building.md) — build pipeline, CI, releases
- [docs/contributing.md](https://github.com/ricna/Steam-Uploader/blob/main/docs/contributing.md) — contribution workflow
