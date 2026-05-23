# Architecture

A walk-through of how Steam Uploader is built, for contributors and the curious.

## Big picture

Steam Uploader is an [Electron](https://www.electronjs.org/) application with three runtime contexts:

```
┌────────────────────────────────────────────────────────────┐
│  Main process (Node.js)                                    │
│  ─ Creates windows, spawns SteamCMD, talks to the OS       │
│  ─ Holds all secrets and privileged operations             │
└────────────────────────────────────────────────────────────┘
                            ▲
                            │ IPC (typed contract in src/shared/api.ts)
                            ▼
┌────────────────────────────────────────────────────────────┐
│  Preload (Node.js, contextIsolated)                        │
│  ─ Exposes a narrow, typed `window.api` to the renderer    │
└────────────────────────────────────────────────────────────┘
                            ▲
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  Renderer (browser context)                                │
│  ─ React + Tailwind UI                                     │
│  ─ Has zero direct access to Node, fs, or shell            │
└────────────────────────────────────────────────────────────┘
```

The renderer is **sandboxed** and **contextIsolated**. It cannot read files, spawn processes, or touch the network on its own — every privileged operation crosses the IPC boundary, where it's validated by the main process before being executed.

## Layout

```
src/
├── main/                     Electron main process
│   ├── index.ts              Entry: window creation + lifecycle
│   ├── ipc/handlers.ts       IPC registry (one place for every channel)
│   ├── services/
│   │   ├── steamcmd.ts       Spawn + stream SteamCMD output
│   │   ├── vdf.ts            Generate Valve Data Files
│   │   ├── credentials.ts    safeStorage wrapper
│   │   ├── config-store.ts   Typed electron-store wrapper
│   │   ├── steam-api.ts      store.steampowered.com client
│   │   └── sdk-manager.ts    Resolve bundled SteamCMD path + version
│   ├── lib/validation.ts     Input validation (the IPC trust boundary)
│   └── build-info.ts         Auto-generated build metadata
├── preload/index.ts          Bridges `window.api` ↔ main process
├── shared/
│   ├── types.ts              Data types used everywhere
│   └── api.ts                The IPC contract — single source of truth
└── renderer/src/
    ├── App.tsx               Composition root (no business logic)
    ├── components/           One file per component
    ├── hooks/                Stateful API access (useConfig, useUpload…)
    └── lib/api.ts            Typed accessor for `window.api`
```

## The IPC contract

The single most important file for understanding the app is [`src/shared/api.ts`](../src/shared/api.ts). It defines a typed interface that both the preload and the renderer consume:

```ts
export interface ElectronAPI {
  config: {
    get(): Promise<AppConfig>
    save(config: AppConfig): Promise<void>
  }
  steam: {
    lookupApp(appId: string): Promise<SteamAppLookup>
    upload(request: UploadRequest): Promise<UploadResult>
    onUploadLog(callback: (line: string) => void): () => void
  }
  sdk: { /* ... */ }
  dialog: { /* ... */ }
  app: { /* ... */ }
}
```

Add a new feature in three places, in order:

1. Add the method to `ElectronAPI` in `src/shared/api.ts`.
2. Implement it in `src/main/ipc/handlers.ts` (with input validation).
3. Wire it through `src/preload/index.ts` (one-line `ipcRenderer.invoke` call).

The renderer consumes it via `import { api } from './lib/api'` — fully typed.

## The upload pipeline

```
User clicks "Upload to Steam"
            │
            ▼
useUpload.upload(request)        ← React hook
            │
            ▼
api.steam.upload(request)        ← IPC call, returns a Promise
            │
            ▼
ipc/handlers.ts                  ← Main process
  ├── validate inputs (AppID, depots, username, branch)
  ├── resolve SteamCMD path (bundled by default)
  ├── vdf.writeBuildScripts()    → app_*.vdf + depot_*.vdf
  └── steamcmd.runUpload()       → spawn steamcmd.exe
            │
            ▼
SteamCMD stdout/stderr streamed via `steam:upload-log` IPC events
            │
            ▼
useUpload appends each line to logs[] → LogPanel re-renders
            │
            ▼
Process exits → `{ success: boolean, exitCode: number | null }`
```

## Security model

The renderer is treated as untrusted. Every value crossing the IPC boundary is validated in [`src/main/lib/validation.ts`](../src/main/lib/validation.ts) before being used:

- App IDs and Depot IDs must be numeric (`/^\d{1,20}$/`)
- Paths are normalized and rejected if they contain `..` traversal segments
- Usernames must match `/^[\w\-.@]+$/`
- Branch names are stripped to `/^[a-zA-Z0-9_-]*$/`

Passwords are encrypted via Electron's `safeStorage` before being persisted (Windows DPAPI / macOS Keychain). They're decrypted only when SteamCMD is invoked.

Additional hardening:

- `contextIsolation: true`, `nodeIntegration: false`
- A Content Security Policy in `index.html` whitelists only the Steam image CDN
- External links open in the user's default browser, never inside Electron
- `will-navigate` blocks navigation to anything not `localhost` (dev) or `file://` (prod)
- The renderer bundle is packed inside `app.asar` — no plain JS on disk

## Build pipeline

`npm run dist` runs three scripts in order:

1. **`bump-build.js`** — increments `BUILD_NUMBER`, stamps `BUILD_ID`, writes `src/main/build-info.ts`
2. **`electron-vite build`** — compiles main + preload + renderer with Vite
3. **`prepare-sdk.js`** — copies the SteamCMD tree into `resources/steam-sdk/`
4. **`package-app.js`** — wraps everything in `@electron/packager`, produces `release/Steam Uploader-<os>-<arch>/` + a portable `.zip`

CI ([`.github/workflows/build.yml`](../.github/workflows/build.yml)) does the same on Windows and macOS runners in parallel. On a tagged push (`v*`), it also publishes a GitHub Release with both binaries attached.

## SteamCMD lifecycle

The bundled `steamcmd.exe` (~5 MB) is a bootstrapper. When it runs:

1. It checks Valve's servers for a newer version of itself.
2. If there's one, it downloads the new build into its own folder.
3. It then executes the actual command (`+run_app_build`).

The supporting files in `package/`, `bin/`, and friends are downloaded and cached by SteamCMD on first run. We ship those too (~30 MB extra) so the first launch is instant.

`sdk-manager.ts` runs `steamcmd +quit` on demand and parses the version banner to expose the current build number in Settings.
