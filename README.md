<div align="center">

# Steam Uploader

**A modern, open-source desktop app for uploading game builds to Steam.**

A drop-in replacement for Valve's dated `SteamPipeGUI`, built with Electron, React, and TypeScript — with SteamCMD bundled out of the box.

[![Build](https://github.com/ricna/Steam-Uploader/actions/workflows/build.yml/badge.svg)](https://github.com/ricna/Steam-Uploader/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue)](#download)

[Download](#download) · [Quick Start](#quick-start) · [Documentation](./docs) · [Why?](#why-not-just-use-steampipegui)

</div>

---

## Why not just use SteamPipeGUI?

`SteamPipeGUI` is the official tool Valve ships with the Steamworks SDK. It works, but:

| | SteamPipeGUI | **Steam Uploader** |
|---|---|---|
| **UI** | Windows Forms from ~2014, cluttered, confusing | Modern dark UI, clean and focused |
| **Setup** | Download the full Steamworks SDK (>2 GB), edit VDF files by hand | Download a single `.exe`, click + paste your App ID |
| **App management** | Manage VDF files in folders | Built-in app list with names and icons fetched from Steam |
| **Credential storage** | Plain text in `.bat` files (yes, really) | Encrypted with your OS keychain |
| **Cross-platform** | Windows only | Windows + macOS |
| **Updates** | You re-download the SDK | SteamCMD self-updates from Valve; the app updates via GitHub Releases |
| **Source code** | Closed | MIT, fully auditable |

For most indie developers, **the entire Steamworks SDK (>2 GB) is overkill** — you only need it to write C++ engine integrations. To upload a build, all you actually need is `steamcmd.exe`. Steam Uploader bundles just that, in a friendly UI.

---

## Download

Grab the latest release from the [Releases page](https://github.com/ricna/Steam-Uploader/releases):

| Platform | File |
|---|---|
| **Windows (x64)** | `SteamUploader-x.y.z-win-x64.zip` |
| **macOS (Apple Silicon)** | `SteamUploader-x.y.z-mac-arm64.zip` |

Extract and run — no installer, no admin rights required.

---

## Quick Start

1. **Launch the app.**
2. **Open Settings** (gear icon, top right) → enter your Steam username and password.
   _Your password is encrypted with the OS keychain (DPAPI on Windows, Keychain on macOS) — it never touches a plain text file._
3. **Click `+`** to add your first app. Paste your **App ID** (find it on [partner.steamgames.com](https://partner.steamgames.com) or your store page URL) and click _Look up_.
   The app name and icon are fetched from Steam automatically. The Depot ID is suggested (App ID + 1, the Steam convention) — change it if yours differs.
4. **Click the depot** to select the folder containing your built game.
5. _Optional:_ set a **branch** (e.g. `beta`) and toggle **Preview** to do a dry run.
6. **Click `Upload to Steam`.**

That's it. SteamCMD does its thing, output streams to the log panel, and a green check appears when your build is live.

---

## Features

- 🎮 **Multiple apps** managed in one place with a clean dropdown
- 🔎 **Automatic metadata** — app names and headers fetched from the Steam store API
- 🔐 **Encrypted credentials** via Electron's `safeStorage` (OS-level keychain)
- 📦 **SteamCMD bundled** — no separate Steamworks SDK download, no manual setup
- 🔄 **Auto-updating SteamCMD** — Valve's tool self-updates every run, so the bundled copy stays current
- 🌑 **Dark, modern UI** built with React and Tailwind
- ⚡ **Live upload log** streamed from SteamCMD in real time
- 🧪 **Preview mode** for safe dry runs before committing a real upload
- 🌳 **Branch selection** for shipping to `beta`, `staging`, or your custom branches
- 🪶 **Open source, MIT licensed** — auditable end to end

---

## How it works

Behind the scenes the app is doing exactly what you'd do by hand, just packaged:

1. You configure an app + depot + content folder in the UI.
2. On upload, the app generates the standard Valve `app_*.vdf` and `depot_*.vdf` files in a scratch folder.
3. It spawns the bundled `steamcmd.exe` with `+login <user> <pass> +run_app_build <app.vdf> +quit`.
4. SteamCMD's stdout/stderr is piped back to the renderer over IPC for the live log.
5. Exit code 0 → success. Anything else → the log tells you what happened.

The VDF generator and SteamCMD wrapper are isolated services (`src/main/services/`) so they're easy to read, test, and replace.

See [docs/architecture.md](./docs/architecture.md) for the full breakdown.

---

## Development

Requirements:

- Node.js 20+
- Optional: a [Steamworks SDK](https://partner.steamgames.com/doc/sdk) checkout. **Not required** — the build script auto-downloads SteamCMD from Valve's public CDN if no local SDK is found.

```bash
git clone https://github.com/ricna/Steam-Uploader.git
cd Steam-Uploader
npm install
npm run dev            # launches Electron with hot reload
npm run dist           # builds a portable .zip for the current OS
```

To use a local Steamworks SDK checkout:

```bash
export STEAM_SDK_ROOT=/path/to/SteamSDK   # or set on Windows: $env:STEAM_SDK_ROOT="C:\path\to\SteamSDK"
npm run prepare-sdk
```

For more, see:

- [docs/architecture.md](./docs/architecture.md) — how the code is organized
- [docs/building.md](./docs/building.md) — full build, packaging, and CI guide
- [docs/contributing.md](./docs/contributing.md) — contribution workflow

---

## Project structure

```
src/
├── main/                Electron main process
│   ├── services/        SteamCMD, VDF, credentials, Steam API, SDK manager
│   ├── ipc/             Typed IPC handler registry
│   └── lib/             Input validation
├── preload/             contextIsolated IPC bridge
├── shared/              Types + API contract shared with the renderer
└── renderer/src/        React UI
    ├── components/      One per file
    ├── hooks/           useConfig, useUpload, useSdkInfo, useBuildInfo
    └── lib/             Typed API accessor

scripts/                 Pre-build hooks (bump-build, prepare-sdk, package-app)
.github/workflows/       CI: Windows + macOS builds, GitHub Releases on tag
docs/                    Architecture, building, and contributing guides
resources/               Bundled SteamCMD + app icons
```

---

## License

[MIT](./LICENSE) — use it, fork it, ship it.

SteamCMD is © Valve Corporation and bundled under the Steamworks SDK Agreement for end-user convenience.

---

<div align="center">

Built by [**Lumiric Studio**](https://github.com/ricna).

</div>
