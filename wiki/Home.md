# Steam Uploader Wiki

Welcome! Steam Uploader is an open-source desktop app that replaces Valve's `SteamPipeGUI` with a modern UI and a bundled SteamCMD — no more downloading the full Steamworks SDK just to ship a build.

## Where to start

| If you are… | Read |
|---|---|
| A developer who just wants to upload a build | [User Guide](User-Guide) |
| Curious why this exists | [Why Steam Uploader](Why-Steam-Uploader) |
| Comparing to SteamPipeGUI | [Comparison vs SteamPipeGUI](Comparison-vs-SteamPipeGUI) |
| Trying to understand the code | [Architecture Overview](Architecture-Overview) |
| Stuck on something | [Troubleshooting](Troubleshooting) and [FAQ](FAQ) |

## Quick links

- 📥 [Latest release](https://github.com/ricna/Steam-Uploader/releases/latest)
- 🐛 [Report a bug](https://github.com/ricna/Steam-Uploader/issues/new)
- 💬 [Ask a question](https://github.com/ricna/Steam-Uploader/discussions)
- 📝 [MIT License](https://github.com/ricna/Steam-Uploader/blob/main/LICENSE)

## What is Steam Uploader?

Steam Uploader is a tool for **publishing game builds to Steam** — the same workflow that game developers use to push their games and updates to Steam customers worldwide.

Under the hood, it generates the [VDF build scripts](https://partner.steamgames.com/doc/sdk/uploading) that Valve's command-line tool (`steamcmd.exe`) expects, then runs SteamCMD with the right login and parameters. The whole process is exposed through a clean UI that lets you manage multiple games, switch between them with a dropdown, and watch upload progress live.

## What it is _not_

- ❌ An alternative to the Steam client for playing games
- ❌ A way to bypass Steam's review or content policies
- ❌ A tool for downloading games (use SteamCMD directly for that)
- ❌ A web service — everything runs locally on your machine

## Status

🟢 **Stable on Windows.** macOS build is produced by CI and tested on Apple Silicon.

Linux support is feasible but not yet shipped — contributions welcome.
