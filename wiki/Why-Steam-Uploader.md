# Why Steam Uploader exists

A short essay on the problem, and why a 50 MB Electron app is the right answer.

## The problem with the official tooling

To ship a build to Steam, the canonical workflow is:

1. Sign in to [partner.steamgames.com](https://partner.steamgames.com).
2. Download the **Steamworks SDK** (a ~150 MB zip that expands to over 2 GB on disk).
3. Inside the SDK, navigate to `sdk/tools/ContentBuilder/`.
4. Open `scripts/app_build_<your_app>.vdf` and `scripts/depot_build_<your_depot>.vdf` in a text editor.
5. Manually edit these files to point at your content folder, set the right App ID, the right Depot ID, the right description.
6. Open `run_build.bat`, fill in your Steam username and password **in plain text**.
7. Save and run the `.bat`. SteamCMD opens in a terminal. If everything is correct, your build uploads.
8. _Optional:_ launch `SteamPipeGUI.exe` — a Windows Forms application from 2014 — for a slightly more visual version of the same flow.

If you've never done this, **none of it is obvious**. The official documentation is dense, the SDK includes hundreds of unrelated tools, and SteamPipeGUI was designed for a specific era of Windows UI that no longer looks at home anywhere.

## Why most of the SDK isn't needed

Most of what's in the Steamworks SDK exists to help you **integrate Steam features into your game's C++ code** — achievements, the overlay, networking, matchmaking, friends, leaderboards. Things like:

- `sdk/public/` — 100+ C++ header files
- `sdk/glmgr/` — Valve's OpenGL manager source code
- `sdk/steamworksexample/` — the complete SpaceWar example game
- `sdk/redistributable_bin/` — DLLs your game ships

For **uploading builds**, you don't need any of that. You need exactly two things:

1. `steamcmd.exe` (~5 MB)
2. Two VDF files describing what to upload

The other ~2 GB exists for entirely different jobs.

## Why bundle SteamCMD

Once you accept that the only thing you actually need is `steamcmd.exe`, the obvious question is: **why not just include it in the app?**

That's what Steam Uploader does.

The bundled SteamCMD is a tiny bootstrapper (~5 MB). On every run, it phones home to Valve, checks for updates, and downloads anything missing. **This is Valve's intended way to keep SteamCMD current** — same mechanism the regular Steam client uses to update itself.

This means:

- **No SDK download** — clone, double-click, ship.
- **Always up to date** — when Valve pushes a SteamCMD update, you get it on your next upload, automatically.
- **No version mismatch** — your tooling and the live Steam servers are always in sync.

## Why an Electron app

The two obvious alternatives are a CLI and a web UI. Both have downsides:

- **CLI** — works, but doesn't help less technical contributors on your team, and offers no improvement over editing VDF files directly.
- **Web UI** — would require running a local server, opening a browser tab, and managing OAuth or local credentials over HTTP. The user experience is worse, not better.

Electron gives a few things specifically:

- **One artifact, one click** — download `.zip`, extract, run. No `npm install`, no Python, no PATH.
- **Native file dialogs** — picking the content folder uses the actual OS folder picker, not a webby file input.
- **`safeStorage` for credentials** — the OS keychain (DPAPI on Windows, Keychain on macOS) does encryption properly. A web app would have to invent its own scheme, badly.
- **Subprocess management** — `child_process.spawn` for SteamCMD with live stdout streaming is native and reliable.
- **Cross-platform from one codebase** — Windows and macOS from the same source tree, with the same UI, with the same SteamCMD wrapper.

The trade-off is binary size (~140 MB once you include the Electron runtime and bundled SteamCMD). For a tool you run once or twice per release cycle, that's a fair price.

## Why open source

Three reasons:

1. **Trust** — you're handing this app your Steam credentials. You should be able to read the code that handles them. (Spoiler: [`src/main/services/credentials.ts`](https://github.com/ricna/Steam-Uploader/blob/main/src/main/services/credentials.ts) is 30 lines.)
2. **Longevity** — small tools die when their authors lose interest. Open source means anyone can fork and continue, and the project survives any one maintainer.
3. **Reusability** — the MIT license means anyone can copy patterns from this repo into their own tooling.

The MIT license means you can copy any part of this and ship it in your own commercial tool. Have at it.

## What it isn't

This isn't an attempt to replace Steamworks itself. The dashboard at partner.steamgames.com is still where you:

- Manage app metadata
- Set up depots
- Configure branches
- Set live branches
- Manage Steam Guard, partner permissions, etc.

Steam Uploader is just the **build upload step** — the part that, for some reason, has always been the worst-feeling part of shipping to Steam.

That's the whole pitch.
