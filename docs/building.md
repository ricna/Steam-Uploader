# Building

How to build Steam Uploader from source — locally and via GitHub Actions.

## Prerequisites

- **Node.js 20+** (verify with `node --version`)
- **npm 10+** (ships with Node 20)
- _Optional:_ a [Steamworks SDK](https://partner.steamgames.com/doc/sdk) checkout. The build will fall back to downloading SteamCMD from Valve's public CDN if none is present.

That's it. No global tools, no native compilation toolchain.

## Install

```bash
git clone https://github.com/ricna/Steam-Uploader.git
cd Steam-Uploader
npm install
```

## Development loop

```bash
npm run dev
```

- Spawns the Vite dev server (`localhost:5173`) for the renderer
- Compiles main + preload with electron-vite
- Launches Electron, loading the dev URL
- Hot reload on renderer changes; main process changes trigger a restart

## Producing a release

```bash
npm run dist
```

That runs four steps:

1. `bump-build.js` — increments the build counter, writes `src/main/build-info.ts`
2. `electron-vite build` — compiles main, preload, and renderer for production
3. `prepare-sdk.js` — stages the SteamCMD tooling into `resources/steam-sdk/`
4. `package-app.js` — packages everything with `@electron/packager`, produces:
   - `release/Steam Uploader-<os>-<arch>/` (unpacked app directory)
   - `release/SteamUploader-<version>-<os>-<arch>.zip` (portable archive)

The resulting `.zip` is ~140 MB on Windows (Electron runtime + bundled SteamCMD).

### Using a local Steamworks SDK

If you have a Steamworks SDK checkout, point the build at it:

**macOS / Linux:**
```bash
export STEAM_SDK_ROOT=/path/to/SteamSDK
npm run dist
```

**Windows (PowerShell):**
```powershell
$env:STEAM_SDK_ROOT = "C:\path\to\SteamSDK"
npm run dist
```

`prepare-sdk.js` will copy the OS-appropriate `ContentBuilder/` or `builder_osx/` subtree from your SDK instead of downloading.

### Building without an SDK

Run the script with no env var set. It'll download the SteamCMD bootstrapper from `https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip` (Windows) or `…/steamcmd_osx.tar.gz` (macOS). The resulting bundle is functionally identical — SteamCMD finishes setting itself up on first run.

## Cross-platform builds

You can't build a `.dmg` from Windows or a `.exe` from macOS — `electron-packager` produces binaries for the host OS only. For both, you have two options:

1. **GitHub Actions** (recommended) — the included [`.github/workflows/build.yml`](../.github/workflows/build.yml) runs `windows-latest` and `macos-latest` jobs in parallel. Push a tag like `v1.0.0` and a Release is created with both binaries attached.
2. **Manual** — build each on its host OS.

## Versioning & releases

The app version lives in `package.json`. The build ID is auto-incremented and committed-irrelevant (regenerated each build, gitignored).

To cut a release:

```bash
npm version patch   # bumps 1.0.0 → 1.0.1, creates a git tag
git push --follow-tags
```

The CI workflow's `release` job (gated by `if: startsWith(github.ref, 'refs/tags/v')`) will package both platforms and publish to GitHub Releases automatically.

## Common issues

**`Error: EBUSY: resource busy or locked, rmdir 'release/…'`**
You have a previous app instance running. Close it (`taskkill /F /IM "Steam Uploader.exe"` on Windows) and rerun.

**`Cannot create symbolic link: A required privilege is not held by the client`**
electron-builder used to require Windows Developer Mode for symlink-heavy archives. We sidestepped this by using `@electron/packager` instead — if you see this error, ensure you're on the latest version of the project's dev deps.

**Renderer loads but is blank**
Check the DevTools console (in dev mode, press F12 in the Electron window). If `window.api` is undefined, the preload script failed to load — most likely a TypeScript error there.
