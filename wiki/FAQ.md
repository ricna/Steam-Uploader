# FAQ

## General

### Is this affiliated with Valve?

No. Steam Uploader is an independent open-source project by [Lumiric Studio](https://github.com/ricna). It uses the publicly available SteamCMD tool that Valve distributes, but it's not endorsed by or affiliated with Valve Corporation.

### Is it safe to enter my Steam password?

The password is encrypted at rest using Electron's [`safeStorage`](https://www.electronjs.org/docs/latest/api/safe-storage), which on Windows uses DPAPI (the same system that Chrome and Edge use to encrypt your saved passwords) and on macOS uses Keychain. The decrypted password lives only in RAM, and only for the duration of the upload subprocess.

That said: **don't take my word for it**. The source is open. The relevant file is [`src/main/services/credentials.ts`](https://github.com/ricna/Steam-Uploader/blob/main/src/main/services/credentials.ts) and it's 30 lines.

If you're paranoid, generate a new partner account with the minimum permissions required to upload builds, and use that.

### Why is the download so big?

About 50 MB is the Electron runtime (the same V8 + Chromium that powers VS Code, Discord, and Slack — there's no way to make it smaller without abandoning the technology). The other ~90 MB is the bundled SteamCMD plus its cached binary chunks, which save you a long first-run download.

### Does it work without internet?

No — uploads require internet by definition (you're talking to Valve's CDN). The app itself launches offline, but you won't be able to do anything useful.

## SDK and SteamCMD

### Do I need the Steamworks SDK installed?

**No.** Steam Uploader bundles everything it needs.

The Steamworks SDK is for **integrating Steam features into your game's source code** (achievements, the overlay, networking, etc.). For uploading builds, the only thing required is `steamcmd.exe`, which we ship.

### Will my bundled SteamCMD get out of date?

It self-updates on every run, the same way the regular Steam client does. When Valve releases a new SteamCMD build, your next upload picks it up automatically.

You can also click **"Check for updates"** in Settings to trigger an update check manually.

### Can I use my own steamcmd.exe instead of the bundled one?

Not via the UI yet. You can set `steamcmdPathOverride` in the config file (`%APPDATA%\steam-uploader\config.json`) to point at a custom binary. Useful for testing pre-release SteamCMD builds.

### What if Valve changes how SteamCMD works?

That'd be the same problem for everyone using SteamCMD, including SteamPipeGUI. In practice, Valve has kept the `+login`/`+run_app_build` interface stable for years. If they make a breaking change, Steam Uploader will need to be updated too.

## Building and contributing

### Can I run this from source without an account?

Yes. The build script auto-downloads SteamCMD from Valve's public CDN if you don't have a Steamworks SDK on disk. See [docs/building.md](https://github.com/ricna/Steam-Uploader/blob/main/docs/building.md).

### How do I add a feature?

See [docs/contributing.md](https://github.com/ricna/Steam-Uploader/blob/main/docs/contributing.md). The TL;DR: add to the typed IPC interface in `src/shared/api.ts`, implement the handler in `src/main/ipc/handlers.ts`, expose it in the preload, consume it from a React hook.

### What's the license?

[MIT](https://github.com/ricna/Steam-Uploader/blob/main/LICENSE). Do whatever you want with the code.

The bundled SteamCMD itself is Valve's software, distributed by them under the Steamworks SDK Agreement. We include it under the standard end-user-convenience exception.

## Platform

### Windows / macOS / Linux?

- **Windows (x64)** — fully supported, primary target.
- **macOS (Apple Silicon)** — supported, built via CI.
- **macOS (Intel)** — possible to build, just need to extend the CI matrix.
- **Linux** — feasible, but no shipping build today. The bones are there in `prepare-sdk.js`. PRs welcome.

### Why not just a CLI?

Because a CLI doesn't help your team's less technical contributors, and offers no improvement over editing VDF files directly. For developers who want a CLI, raw `steamcmd.exe` is right there.

### Why Electron instead of Tauri / native?

Tauri would produce a much smaller binary (~10 MB instead of ~140 MB) but requires Rust to build and has a less mature ecosystem for things like `safeStorage`. For a tool you run a few times per release cycle, the size doesn't matter. For the developer building it, the Electron ecosystem is faster to ship in.

A native Win32 + Cocoa version is feasible too. Roughly 10x the engineering effort for the same UX. Not worth it for an open-source side project.

## Privacy

### Does the app phone home?

No. It connects to:

- `store.steampowered.com` — to fetch your app's name and header image when you add a new app
- `steamcdn-a.akamaihd.net` — only the build script, only when downloading SteamCMD if you don't have a local copy
- Whatever SteamCMD itself connects to during uploads (i.e., Valve's CDN)

No telemetry, no analytics, no error reporting, no auto-update service. You can verify with Wireshark or by reading the source.

### Does it work behind a corporate proxy?

It does whatever Node.js's networking layer does, which generally respects the `HTTPS_PROXY` environment variable. SteamCMD itself has its own proxy handling — consult [Valve's docs](https://developer.valvesoftware.com/wiki/SteamCMD#Proxy) for that.
