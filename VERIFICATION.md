# Verification record

Course revision verified on 2026-10-18 with desktop Chrome and Edge on Windows.
The browser runs actual Vim 8.2.0055 from vim-wasm 0.0.13; native solution replay
uses Vim 9.1. No keybinding emulator or silent fallback is used.

| Check | Result | Reproduction |
|---|---|---|
| TypeScript and static Vite build | Passed | `npm run build` |
| Rules, budgets, progress, source coverage and localization | 21 passed | `npm test` |
| Accepted reference sequences in native Vim | 79 passed: 48 references and 31 independent alternatives, including terminal confirmation | `npm run test:native -- --alternatives` |
| Complete user-provided sentences, saved drafts, bilingual attribution and clean restart | Passed in Chrome and Edge | `npm run test:sentences` |
| All 33 main levels and their in-budget alternatives | Passed in Chrome and Edge | `npm run test:browser` |
| Unique current hint route in both languages, all 33 levels, practice evidence and explicit alternative-method feedback (levels 7–9) | Passed in Chrome and Edge | `npm run test:course` |
| Alternative physical-key routes for all 22 practice levels, including direct %d% and d% | 33 cases in Chrome and Edge; budget/input failures remain distinct | `npm run test:practice` |
| Ex parser ranges, modifiers, delimiters, escaping and false positives | 15 passed in native Vim | `node scripts/practice-parser-check.mjs` |
| Bilingual tasks, hints and unchanged running buffers | Passed in both browsers | `npm run test:i18n` |
| Modal hint navigation, input lock and EOF tildes | Passed in both browsers | `npm run test:hints` |
| Persistent 33-step completion card, rainbow finale, no final variant | Passed in both browsers | `npm run test:completion` |
| Old-course reset, retained language and actual new-course long draft reload | Passed in both browsers; draft longer than 50,000 characters | `npm run test:migration` |
| First-visit isolation when the upstream reload callback is missed | Passed in Chrome and Edge, no manual reload | `npm run test:isolation` |
| Clipboard, storage failure, isolation updates and worker recovery | Passed in both browsers | `npm run test:resilience` |
| Desktop dimensions and mobile reading layout | Passed at 1366×768, 1920×1080 and 390×844 | `node scripts/layout-check.mjs` |

The main browser and course suites send physical Shift combinations (including
Shift+5 for %, Shift+R, Shift+I and Shift+V), check exact saved output,
counts keys and exercises every accepted reference sequence. It covers unsaved
correct text, undo/redo, alternative solutions, forbidden input, exact budgets,
over-budget content success, fresh registers/undo/macros, hints, F6 focus escape,
Explore, quit recovery, draft restoration, import/export and narrow layout.

The site is served under `/between-lines/` without COOP/COEP response headers.
The shipped same-origin isolation worker enables the editor. A separate recovery
case uses controlled headers to inject a failed runtime request, then retries it.
This verifies static project-subpath behavior locally; no public GitHub deployment
is claimed without an actual target repository.

Official matching Vim 8.2.0055 English help (139 local files and tags) is now
bundled; the npm runtime did not include help text. The help-window and
reference-buffer exercises use actual Vim windows. Native confirmation replay
uses a Vim terminal job because silent Ex mode does not reproduce confirmation
prompts.

## Course and provenance

There are 33 main levels, 25 literary sources and eight lyric sources. Required
creators are checked explicitly, authors/sources do not repeat, and Borges is
last. There are no bonus variants. Introductory tasks stay short; literary
practice grows into hundreds of lines, with 950-, 1,068- and 1,398-line targets.
The 88-line Borges selection is a shorter, combined-repair finale. Poems and
short lyric interludes are not padded to simulate long text.

The 33-level sentence-boundary audit is in `docs/TEXT-AUDIT.md`. Literary
excerpts in levels 5, 7, 8 and 11 are now complete workshop translations of
the Chinese sentences supplied by the user. Both source manifests and bilingual
attribution have been updated; the supplied Chinese and corresponding English
are recorded in `docs/user-provided-passages.json`. Remaining literary selections
end at sentence or poem boundaries;
the 17 long/poetic excerpts match contiguous words in the stored source corpus.

`docs/source-manifest.json` records exact selection hashes, lengths, authors,
titles, dates, translators, URLs and source rights. Long excerpts additionally
record first and last lines. Own translations are labelled, not attributed to
published translators. The licensed Kafka source is distributed with its full
original notice; modern literary/song quotations remain brief. This is not a
claim that public web access alone licences redistribution.

At the user’s request this revision starts from level 1. Earlier completion,
draft and hint records are removed; the separate language preference remains.
Older JSON records cannot unlock redesigned levels. Current-course v3 records
retain normal save/reload and import/export behavior.

## Budget calibration

The shortest current validated reference satisfying the published practice
actions determines the cap:
`ceil(shortestKeys × 1.1)`. Unit cases cover 20 → 22, 15 → 17, 21 → 24 and exact
rounding boundaries. References exceeding that cap are excluded from formal
challenge solutions. Save commands count, modifier combinations count once, and
macro expansion does not multiply physical input. The first two levels are unbudgeted.
Twenty-two levels publish positive practice goals, recorded inside real Vim.
Correct text without the stated action is rejected; Explore ignores those rules.
There is no claim that the action recorder is a security sandbox or a proof of
global optimality. The final 33 expected texts remain byte-identical to the
previous content revision.

No global optimality proof is claimed. Cleverer valid solutions remain accepted
and can inform later calibration; the cap is no longer based on the longest route
or an additional 50% allowance.

## Compatibility and limits

- Actual long drafts survive save/reload in Explore with zero new challenge count.
  Earlier course records are cleared; only current-course v3 imports are accepted.
- Completion feedback remains until editing, restart or navigation. Revisits and
  reloads do not replay it. Reduced motion yields no running animations/particles.
- Runtime/licence/version files are local, with no runtime text API.
- Chrome and Edge with desktop keyboards are tested. Touch editing, Firefox,
  Safari, key-intercepting extensions, shell commands and plugins are not certified.
- Learning outcomes, true optimal budgets and literary translation quality still
  benefit from human review. Automated replay verifies editing behavior and
  preservation, not that every useful Vim technique must be used by each player.
- Upstream Vite reports a large course-data bundle and the expected isolation
  service-worker bundling note. The build succeeds; no runtime assets are omitted.

Machine-readable results and screenshots live in test-results and are reproduced
by the listed scripts. The GitHub workflow retains them as a verification artifact.

## Recorder consistency revision

The old tests sent printable characters directly and missed the distinction
between `%` and physical Shift+5 in vim.wasm. Its native commands could edit
correctly while shifted mapping lookup skipped the action recorder. Printable
Shift is now canonicalized from event.key before forwarding to real Vim, counted
once; special keys and genuine Ctrl/Alt/Meta combinations remain unchanged.
Operator-pending/Visual `%`, motion-based `<`, window aliases, Ex address and
modifier prefixes, arbitrary substitute delimiters and :g! are also recognized.
No f[ prefix or complete reference key sequence is required. Versioned iframe
runtime imports keep the deployed editor and recorder on the parent's release.

The Pages bootstrap now waits for service-worker control before starting Vim. A
controllerchange listener recovers a missed registration reload callback, with a
session guard against reload loops. This avoids starting the editor before
SharedArrayBuffer is available on a first visit.
