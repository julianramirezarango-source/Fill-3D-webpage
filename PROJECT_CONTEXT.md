# Fill-3D Wiki — Project Context for AI Agents

## What this project is

A **Next.js 16.2.1 static wiki** deployed at `fill-3d.com/wiki/`. It pulls markdown articles from a public GitHub repo and serves them client-side. There is also a filament profiles download page for OrcaSlicer and Creality Print.

---

## Repository & Branch Structure

- **This repo**: `julianramirezarango-source/fill-3d-webpage`
- **Active development branch**: `claude/dynamic-wiki-from-repo-WVaqy`
- **Main branch (production)**: `claude/add-pla-turbo-profile-1icTo`
- **Wiki content repo** (markdown articles): `Ju4n5e/fill3d-wiki-content` (public, master branch)
- **OrcaSlicer profiles repo**: `Ju4n5e/fill3d-orca-profiles`
- **Creality profiles repo**: `julianramirezarango-source/Fill-3D_CrealityProfiles`

> Always develop on `claude/dynamic-wiki-from-repo-WVaqy`, then PR into `claude/add-pla-turbo-profile-1icTo`.

---

## Deployment

- **Host**: Hostinger file manager
- **Build command**: `npm run build` → generates `out/` folder
- **Deploy**: Upload contents of `out/` into `public_html/wiki/` on Hostinger
- Static export — no server-side rendering, no API routes

---

## Critical Config (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  output: "export",        // Static export — DO NOT REMOVE
  basePath: "/wiki",       // CRITICAL — must always be "/wiki", not "/wiki/calculadora"
  trailingSlash: true,
  images: { unoptimized: true },
};
```

**WARNING**: Other branches (BrandManual, etc.) may overwrite `basePath` to `/wiki/calculadora` when merged. Always fix this back to `/wiki` after any merge.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Must return `<WikiClient />` — other branches revert it to calculator |
| `app/wiki-client.tsx` | Main wiki UI — client component with all rendering logic |
| `app/layout.tsx` | Metadata, favicon (`/wiki/logo.svg`) |
| `lib/wiki.ts` | Nav types, `DEFAULT_NAV` structure, markdown fetcher, parser |
| `next.config.ts` | Build config — `basePath` is critical |
| `public/profiles/` | OrcaSlicer static profile files served at `/wiki/profiles/` |
| `public/profiles-creality/` | Creality Print static profile files served at `/wiki/profiles-creality/` |

---

## How the Wiki Works

1. `app/page.tsx` renders `<WikiClient />` (a `"use client"` component)
2. Navigation is **hash-based**: `window.location.hash` determines which article to show
3. Article content is fetched client-side from:
   `https://raw.githubusercontent.com/Ju4n5e/fill3d-wiki-content/master/<path>`
4. Navigation structure comes from:
   - First tries `https://raw.githubusercontent.com/Ju4n5e/fill3d-wiki-content/master/navigation.json`
   - Falls back to `DEFAULT_NAV` in `lib/wiki.ts` if fetch fails

---

## Navigation Structure (`lib/wiki.ts`)

The `DEFAULT_NAV` array defines sidebar groups and items. Each item has:
- `label` — display name
- `path` — markdown file path in the wiki content repo (e.g. `lo-basico/pla.md`)
- `icon` — one of: `play | circle | square | loader | triangle | pencil | dot | box | book | folder | download`
- `children` — optional nested items (for folders)

**Special paths** (not markdown files — render custom React pages):
- `__perfiles-filamento__` → renders `<FilamentProfilesPage />` (OrcaSlicer downloads)
- `__perfiles-creality__` → renders `<CrealityProfilesPage />` (Creality Print downloads)

---

## Filament Profile Downloads

### OrcaSlicer Profiles
- **Source**: Static files in `public/profiles/`
- **Served at**: `/wiki/profiles/`
- **Files**:
  - `OrcaFilamentLibrary.json` (library bundle — "Descargar todos")
  - `FILL3D/FILL3D PLA Basic @System.json`
  - `FILL3D/FILL3D PLA Turbo @System.json`
  - `FILL3D/FILL3D PETG @System.json`
  - `FILL3D/FILL3D PP @System.json`
  - `FILL3D/FILL3D PPCF @System.json`
  - `FILL3D/FILL3D PA @System.json`
- **How to import in OrcaSlicer**: File → Import → Import Configs

### Creality Print Profiles
- **Source**: Static files in `public/profiles-creality/`
- **Served at**: `/wiki/profiles-creality/`
- **Files**:
  - `Fill-3D Creality Print Profiles.zip` ("Descargar todos")
  - `Fill-3D PLA Basic.json`
  - `Fill-3D PLA Turbo.json`
  - `Fill-3D PETG.json`
  - `Fill-3D PP.json`
  - `Fill-3D PP-CF.json`
  - `Fill-3D PA Nylon.json`
- **Important**: Files must have `"from": "User"` (not `"system"`) or Creality Print rejects them
- **How to import in Creality Print**: Archivo → Importar → Importar configuraciones (must have a printer added first)

### Why static files instead of GitHub raw URLs?
`<a download>` does NOT work for cross-origin URLs — the browser opens the file instead of downloading it. Hosting files in `public/` makes them same-origin (`fill-3d.com/wiki/profiles/...`), so download works correctly.

---

## Brand Colors & Style

- **Brand purple**: `#753CFF`
- **Light purple bg**: `#F3EEFF`
- **Tailwind CSS v4** (different from v3 — check docs if needed)
- Font: system sans-serif stack

---

## Common Merge Pitfalls

When merging from other branches (BrandManual, add-pla-turbo, etc.):

1. **`next.config.ts`** — always keep `basePath: "/wiki"` (others set it to `/wiki/calculadora`)
2. **`app/page.tsx`** — always keep `return <WikiClient />` (others return calculator component)
3. **`app/layout.tsx`** — keep wiki title and `icons: { icon: "/wiki/logo.svg" }`
4. **`out/` folder** — do NOT commit build artifacts. If they appear after merge: `git rm -r --cached out/ && echo '/out/' >> .gitignore`
5. **`lib/geometricSlicer.ts`** — this file from add-pla-turbo branch causes build errors, delete it if it appears

---

## Adding New Wiki Articles

1. Add the markdown file to the `Ju4n5e/fill3d-wiki-content` repo (public GitHub repo)
2. If needed, add the nav item to `DEFAULT_NAV` in `lib/wiki.ts`
   - Or better: update `navigation.json` in the wiki content repo (wiki fetches it dynamically)

## Adding New Filament Profiles

**OrcaSlicer**: Add `.json` file to `public/profiles/FILL3D/`, update `ORCA_FILAMENTS` array in `app/wiki-client.tsx`

**Creality**: Add `.json` file to `public/profiles-creality/`, update `CREALITY_FILAMENTS` array in `app/wiki-client.tsx`

The `CREALITY_FILAMENTS` array format:
```typescript
{ id: 'pla-turbo', name: 'PLA Turbo', file: 'Fill-3D PLA Turbo.json', color: '#753CFF', description: '...' }
```

---

## Build & Push Workflow

```bash
npm run build          # generates out/
git add -A
git commit -m "description"
git push -u origin claude/dynamic-wiki-from-repo-WVaqy
# Then create PR: claude/dynamic-wiki-from-repo-WVaqy → claude/add-pla-turbo-profile-1icTo
```

---

## What NOT to do

- Do not change `basePath` away from `/wiki`
- Do not change `app/page.tsx` to return anything other than `<WikiClient />`
- Do not use `fetch` + blob for downloads — use same-origin `<a download href="...">` with static files
- Do not commit the `out/` folder (it's in `.gitignore`)
- Do not push to `BrandManual` or `main` branches directly
