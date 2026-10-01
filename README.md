# ASAS Portal

ASAS Search Engine Portal — a **Power Apps code app** (React 18 + TypeScript + Vite 5), built the same way as EA Portal.

## Stack
- React 18.3, TypeScript 5.9, Vite 5.4 (pinned — same versions as EA Portal; don't bump without re-testing in the player)
- `@microsoft/power-apps` + `@pa-client/power-code-sdk` (installed from `vendor/`, see below)
- React Router v7 with **HashRouter** (the Power Platform player has no server-side route rewrite)
- Plain CSS tokens / CSS Modules, Dubai font (see `public/fonts/README.md`)

## How it is wired to Power Apps
- `src/PowerProvider.tsx` — calls the SDK `initialize()` on mount.
- `src/context/AuthContext.tsx` — identity comes from the host (`getContext()`, the signed-in Entra user). There is no login form; the welcome screen's **Get Started** just enters the app. Outside the player, dev builds fall back to a demo user; production builds show an error.
- `vite.config.ts` — `base: './'` so assets resolve under the player's deep URL.
- `power.config.json` — app + environment settings. `appId` is added when the app is registered (`pac code init` / first `pac code push`).

## Scripts
- `npm run dev` — `pac code run` + Vite on :3000 (inside the Power host context)
- `npm run dev:web` — Vite only, in a plain browser (demo user)
- `npm run build` — type-check + build to `dist/`
- Publish: `npm run build && pac code push`

## Notes
- `vendor/pa-client-power-code-sdk-0.0.1.tgz` is the same release EA Portal uses (sha512 verified); npm blocks remote tarball installs by default, so it is installed from this local copy.
- Data is still mock (`src/data/`). To move to Dataverse, create the ASAS tables, then `pac code add-data-source -a dataverse -t <table>` to generate `src/generated/` models/services (as in EA Portal) and replace the mock arrays with those services.
