# User Guide

A step-by-step walkthrough for shipping your first build with Steam Uploader.

## 1. Install

1. Go to [Releases](https://github.com/ricna/Steam-Uploader/releases) and download the `.zip` for your OS.
2. Extract it anywhere — there's no installer.
3. Launch `Steam Uploader.exe` (Windows) or `Steam Uploader.app` (macOS).

The first launch can take 5–10 seconds while SteamCMD checks in with Valve and updates itself. Subsequent launches are instant.

## 2. Configure your Steam account

Click the **gear icon** in the top right.

Enter your **Steam username** and **password** for the Steamworks partner account that has permission to push builds for your app.

> 🔐 **About your password:** Steam Uploader uses Electron's [`safeStorage`](https://www.electronjs.org/docs/latest/api/safe-storage), which encrypts the password with the OS keychain (DPAPI on Windows, Keychain on macOS). It is **never** stored in plain text. Other users of your machine cannot read it without your OS login.

If your account uses **Steam Guard**, you'll be prompted for the code in the upload log the first time you upload. Type it directly into the running Steam Uploader window (the prompt will appear in the log panel — you can paste your code via the input field that opens).

Click **Save**.

## 3. Add your first app

Click the **`+` button** next to the app dropdown.

You'll need your app's **App ID** — a 6 or 7 digit number you'll find on:

- [partner.steamgames.com](https://partner.steamgames.com) (your dashboard for the app)
- The URL of your store page: `https://store.steampowered.com/app/<APP_ID>/Your_Game/`

Paste the App ID, click **Look up**. The app's name and header image will be fetched from the Steam store.

The **Depot ID** is suggested automatically as `App ID + 1`, which is the Steam convention for the default content depot. If your project uses a different depot ID, change it here.

Click **Add App**.

## 4. Point the depot at your build folder

In the main window, click the depot card (it'll say _"Click to select content folder…"_).

A folder picker opens. **Select the folder containing the files of your built game** — the binary, assets, DLLs, etc. The full contents of this folder will be uploaded to that depot, exactly as they sit.

> 💡 Steam Uploader excludes `.pdb` files by default (PDB symbol files for Visual Studio debugging). Edit `src/main/services/vdf.ts` if you need a different exclusion pattern.

## 5. (Optional) Configure the branch

By default, your build is uploaded but **not set live** — it sits in your Steamworks dashboard as an unreleased build, waiting for you to manually flip the switch.

If you want to push directly to a specific branch:

- Leave **Branch** empty → builds without setting live (recommended for first runs)
- Type `default` → pushes to the default branch (the one your players see)
- Type `beta`, `staging`, or any branch you've configured on Steamworks → pushes there

> ⚠️ Pushing to `default` is the equivalent of "go live now." Test on a custom branch first.

## 6. (Optional) Preview mode

Toggle **Preview only** to do a dry run. SteamCMD will simulate the upload but won't actually transfer files. Useful for sanity checking VDF generation and authentication without touching Steam's CDN.

## 7. Upload

Click **Upload to Steam**.

The button changes to "Uploading to Steam…" and the log panel fills with SteamCMD's output:

```
[Steam Uploader] Starting upload for Your Game (App 123456)
Redirecting stderr to '...'
[  0%] Checking for available updates...
Logging in user 'your_username' to Steam Public...
OK
Building depot 123457...
Scanning content...
Uploading content...
Successfully built AppID 123456
[Steam Uploader] Upload complete.
```

A **green dot** in the header of the log panel means success. **Red** means it failed — read the log to find out why (usually: wrong password, missing Steam Guard code, depot misconfigured on Steamworks, content folder empty).

## Managing multiple apps

Once you've added several apps, switch between them with the dropdown at the top:

- All apps remember their depot folder paths
- Settings (credentials, SteamCMD version) are shared across apps
- Each app maintains its own log history during the current session

Use **Settings → Remove current app from list** if you want to clean up the dropdown.

## Where data is stored

- **Config** (apps, encrypted password, paths) lives at:
  - Windows: `%APPDATA%\steam-uploader\config.json`
  - macOS: `~/Library/Application Support/steam-uploader/config.json`
- **SteamCMD cache** (login session, downloaded chunks) lives next to the bundled `steamcmd.exe` inside the app's `resources/steam-sdk/` folder. Delete it to fully sign out.

Uninstalling: delete the app folder and the config directory above. There's no installer or registry footprint.
