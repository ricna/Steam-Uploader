# Troubleshooting

Common issues and how to fix them.

## The app doesn't open / window doesn't appear

1. **Check your second monitor.** Electron remembers the last window position. If you unplugged an external display, the window may be opening off-screen. Right-click the taskbar entry → _Move_, then press an arrow key.
2. **Check Task Manager.** If `Steam Uploader.exe` is running but no window is visible, force-quit it and reopen.
3. **Antivirus.** A few Windows AV products quarantine unsigned `.exe` files inside `.zip` archives. Extract the zip and add the folder to your AV exclusions.

## "Login Failure: Invalid Password"

- Double-check **username** and **password** in Settings. Don't include spaces.
- If your account has **Steam Guard** enabled, watch the upload log on the first run — SteamCMD will prompt for a code. Type it in the running terminal (you may have to scroll the log panel).
- Try logging in once manually with the bundled SteamCMD to seed the session:
  ```
  cd resources\steam-sdk\builder
  steamcmd.exe +login YOUR_USERNAME
  ```

## "Could not find package" / "FAILED with result code X"

This is usually one of:

- **Your Steam Guard code expired** — try the upload again, paste the fresh code when prompted.
- **The depot ID is wrong** — it should match a depot configured on your app's Steamworks dashboard.
- **You don't have upload permission** — your partner account needs "Edit App Metadata" or similar on the app.

Open partner.steamgames.com → your app → _Technical Tools_ → _Edit Steamworks Settings_ → check Depots and Users & Permissions.

## The upload starts but never finishes

- **Network issues.** SteamCMD is doing real uploads to Valve's CDN — large content folders can take a long time. Watch the log: if it's printing progress, it's working.
- **The build is hung at "Verifying depot."** This step compares your local files to what Steam already has. For very large depots (>50 GB) this can legitimately take a long time on first upload.
- **You can cancel** by closing the app — SteamCMD will be terminated and the build won't be committed.

## "SteamCMD binary not found"

The bundled `steamcmd.exe` is missing from the install. Re-download the release `.zip` from GitHub and extract again.

If you set a custom `steamcmdPathOverride` in your config that points at a nonexistent file, open Settings and clear it.

## "No app found on Steam"

You typed an App ID that doesn't exist publicly. This can happen when:

- The app is **unreleased** or **hidden** — Steam Uploader uses the public store API, which won't return data for unreleased apps. You can still upload to it — just type the App ID directly and the depot info manually.
- You have a **typo** — App IDs are 6 or 7 digits. Compare to the URL on your app's Steamworks dashboard.

## Logs say "Update detected, downloading..." every time

That's SteamCMD updating itself. Normal behavior. The first time, it can take a minute. After that, only when Valve ships a new version.

## DevTools / advanced debugging

Press `F12` inside the app window to open Chrome DevTools. The Console tab will show any renderer errors. The Network tab will show the Steam store API call when you look up an App ID.

The main process logs (from SteamCMD, IPC errors, etc.) are streamed to the in-app log panel.

## Still stuck?

Open a [Discussion](https://github.com/ricna/Steam-Uploader/discussions) with:

- Your OS and version
- App version (visible in the footer)
- The full log panel output (with passwords redacted)
- What you expected vs what happened
