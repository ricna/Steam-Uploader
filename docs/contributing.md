# Contributing

Thanks for taking the time to look at the code. Steam Uploader is a small project with a clear scope, so contributions in the form of bug reports, focused improvements, or polish are all welcome.

## Ground rules

- **Keep the scope tight.** The app does one thing — upload builds to Steam — and tries to do that well. Features that expand into "Steamworks dashboard," "wishlist analytics," etc. probably belong in a separate tool.
- **No `@ts-ignore` and no `any`.** The codebase is fully typed end-to-end. New code should match.
- **Validate at the IPC boundary.** Anything coming from the renderer is untrusted. Use the helpers in `src/main/lib/validation.ts` or add new ones there.
- **One component per file.** See `src/renderer/src/components/` for the pattern.
- **No emojis in code** unless you have a strong UX reason. They're fine in the README and the user-facing UI.

## Workflow

1. **Fork** the repo and create a feature branch from `main`.
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Implement.** Run `npm run dev` to iterate.
3. **Verify** that:
   - `npm run build` succeeds without TypeScript errors.
   - The CSP in `src/renderer/index.html` still permits everything the renderer needs.
   - Your changes work for the case of a brand-new install (no saved config, no credentials).
4. **Commit** with conventional commit style:
   ```
   feat(steam): add support for multi-depot uploads
   fix(ui): preserve scroll position when logs update
   docs: clarify SDK bundling in README
   ```
5. **Pull request** against `main`. The CI workflow will build for Windows and macOS automatically.

## Areas where help is welcome

- **Linux build** — the bones are there in `prepare-sdk.js` (`builder_linux`) but the GitHub Actions matrix only covers Windows and macOS today.
- **Localization** — the UI is English-only. A small i18n layer with a couple of locales (PT-BR, ES, DE) would be a real upgrade.
- **Icon design** — `resources/icon.ico` ships with the default Electron icon. A real one would be nice.
- **Build branches/setlive UX** — currently a free text input. A dropdown of the app's existing branches (fetched from Steam) would be slicker.
- **Tests** — there are none yet. Vitest + a service-level test for `vdf.ts` and `validation.ts` would be a great first PR.

## Reporting bugs

Please include:

- Your OS and version
- The Steam Uploader version (visible in the footer)
- The SteamCMD version (visible in Settings)
- Steps to reproduce
- Relevant lines from the in-app log panel

If the bug involves credentials or upload failures, **redact your password and username** from any logs you paste.

## Questions

Open a [Discussion](https://github.com/ricna/Steam-Uploader/discussions) rather than an issue.
