# Comparison vs SteamPipeGUI

A point-by-point comparison with Valve's official `SteamPipeGUI.exe`.

## At a glance

|  | SteamPipeGUI | **Steam Uploader** |
|---|---|---|
| **Year** | ~2014 | 2025 |
| **UI framework** | Windows Forms | React + Tailwind |
| **OS support** | Windows only | Windows + macOS |
| **Distribution** | Bundled inside the Steamworks SDK | Standalone `.zip` (~140 MB) |
| **Prerequisites** | Steamworks SDK (>2 GB) | None |
| **Credentials** | Plain text (in `.bat` files) | OS keychain (DPAPI / Keychain) |
| **App list** | None (one VDF set at a time) | Built-in, with names + icons |
| **VDF editing** | Manual, in a text editor | Generated automatically |
| **Updates** | Tied to SDK version | SteamCMD self-updates; app updates via GitHub |
| **Source available** | No | Yes (MIT) |
| **Log display** | Console window | In-app, color-coded |
| **Live build status** | Console | Live indicator + log streaming |

## Visual

### SteamPipeGUI (the tool we're replacing)

The classic Valve developer-tool look:

- Gray Windows Forms styling
- Two giant text fields for VDF paths
- A password field in plain text
- A console window for output
- No app management — you switch by editing files

### Steam Uploader

- Dark theme, modern padding
- App dropdown at the top (with header images fetched from Steam)
- Depot cards with folder pickers
- Live log panel with success/error coloring
- Settings modal for credentials and SteamCMD info

## Setup time

**SteamPipeGUI** — from a clean machine:

1. Sign in to Steamworks Partner site
2. Download Steamworks SDK (~150 MB compressed, ~2 GB extracted) (15+ min)
3. Extract to a location with no spaces in the path
4. Open `tools/ContentBuilder/scripts/`
5. Copy and rename `app_build_1000.vdf` → `app_build_<your_app>.vdf`
6. Open in editor, change every value
7. Same for `depot_build_*.vdf`
8. Open `tools/SteamPipeGUI/`
9. Launch `SteamPipeGUI.exe`
10. Configure paths to point at your VDFs
11. Enter credentials each time

**Total: ~30–60 minutes the first time.**

**Steam Uploader** — from a clean machine:

1. Download `SteamUploader-x.y.z-win-x64.zip`
2. Extract
3. Launch
4. Enter credentials once (encrypted)
5. Paste App ID — name and icon fetched automatically
6. Pick content folder
7. Click upload

**Total: ~2 minutes the first time.**

## Per-upload friction

Once both tools are set up, what does each subsequent upload feel like?

**SteamPipeGUI** — for every release:

1. Open the VDF files to verify nothing's stale
2. Re-enter password in the GUI (or save it in the `.bat`)
3. Click run
4. Watch the console for errors
5. Hope you didn't typo something

**Steam Uploader** — for every release:

1. Open the app
2. Select your game from the dropdown
3. Confirm the content folder is current
4. Click upload

For an indie dev releasing weekly patches, that adds up.

## Security

`SteamPipeGUI.exe` works hand in hand with `run_build.bat`, which expects you to embed your Steam credentials directly in plain text:

```bat
builder\steamcmd.exe +login YOUR_USERNAME YOUR_PASSWORD +run_app_build ...
```

That `.bat` file lives in your project folder. If it ends up in a screen share, a backup, a stale git commit, a screenshot for a tutorial, or anywhere else — your credentials are exposed.

Steam Uploader keeps credentials in an encrypted blob in the OS user config directory. The unencrypted password lives only in RAM, and only during the active upload subprocess.

## When SteamPipeGUI is still the right call

To be fair:

- **You're already deep in the Steamworks SDK** for engine integration work and have its full tree set up — you have everything you need already.
- **You like the certainty of editing VDFs by hand** — they're the source of truth, and there's something to be said for that.
- **You're scripting bulk operations** — at that point you probably want raw `steamcmd.exe` and not any GUI at all.

For everyone else, this tool exists.
