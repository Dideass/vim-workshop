# Development & deployment

Technical notes for VIM WorkShop. [Back to the project](../README.md).

## Run

Requires Node.js 22.12+; Node 24 is recommended.

```sh
npm ci
npm run dev
```

Use the printed localhost address. A first visit may reload once to activate
cross-origin isolation. Serve over localhost or HTTPS; do not open index.html as
a local file.

```sh
npm run build
npm run preview
```

`dist/` contains the full static deployment, including the pinned Vim binary,
service worker, source data and licences. Hash routes and relative assets support
a GitHub Pages project subpath.

## GitHub Pages

Put this directory's contents at a repository root, including `.github/` and the
lockfile. Keep generated vendor files, node_modules, dist and test-results ignored.
Use `main`, or change the workflow branch filter. In Settings → Pages choose
**GitHub Actions**, then push or run the deployment workflow manually.

The workflow builds, runs unit/native/browser checks in Chromium and deploys
`dist/`. The same-origin `coi-serviceworker` enables SharedArrayBuffer without
custom hosting headers. It is an isolation worker, not an offline cache. Keep
the worker and runtime assets on the same origin.

## Progress

The redesigned course uses `vim-workshop.progress.v3` and starts fresh. Earlier
completion records, drafts and hint history are cleared on first load; interface
language is kept. Older JSON imports cannot unlock revised exercises. Version-3
import/export and long saved drafts work normally: saved drafts reopen in
unscored Explore after refresh. An unfinished challenge never resumes partially
restored registers or undo history.

## Verification

Browser replays use physical Shift combinations for capital letters and symbols.
The parent, editor and practice module use the same release version to avoid
reusing a stale action recorder. Independent alternative routes complement
the published references; see [the recorder audit](COVERAGE.md).

```sh
npm test
npm run test:native -- --alternatives
node scripts/practice-parser-check.mjs
npm run build
npm run test:practice
npm run test:browser
npm run test:i18n
npm run test:hints
npm run test:completion
npm run test:migration
npm run test:resilience
node scripts/layout-check.mjs
```

Native replay uses `vim` on Unix; Windows defaults to Git's
`D:/Git/usr/bin/vim.exe` (override with `VIM_BIN`). Browser scripts default to
installed Chrome and Edge; set `BROWSERS=chromium` after installing Playwright
Chromium for CI. In PowerShell use `$env:BROWSERS = 'chromium'`.

Results and screenshots are written to test-results. See [VERIFICATION.md](../VERIFICATION.md)
for the measured checks and limits. Automation verifies editing mechanics, not a
claim that completing a course proves mastery of every Vim feature.

## Content structure

- `src/course-data.ts`: immutable real-source excerpts, damage definitions,
  bilingual tasks/hints and candidate reference sequences.
- `src/levels.ts`: constructs initial buffers, calibrates budgets and filters
  reference sequences against those budgets.
- `src/rules.ts`: physical key parsing and content/save/rule verdicts.
- `src/editor.ts`, `public/editor.js`: isolated real Vim session and input rules.
  Every restart uses a new frame/worker/filesystem.
- `src/progress.ts`: independent course storage, large draft validation and imports.
- `src/locale.ts`: UI translation; course-specific translations travel with data.
- `docs/COURSE.md`, `docs/source-manifest.json`: curriculum and bibliographic audit.

Application code is MIT. Literary and runtime rights remain separate; see
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
