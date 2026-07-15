# Recovery State

## BRACE 2026-07-15 - SESSION-ONLY (Opus usage limit)

**HORIZON: SESSION-ONLY.** The CLI session is dying at the usage limit (resets 5am). No host reboot. The only work in flight was two in-session review agents; those end with the session and are not reattachable. Re-run them next session (cheap; a fresh review).

### FIRST ACTION next session
Run the adversarial review (ux + architect lenses), then triage → fix → re-confirm clean.
- Preferred mechanism this project: spawn two `Agent(subagent_type: general-purpose)` reviewers seeded with the persona bodies at `~/.claude/skills/adversarial-review/adversaries/architect.md` and `ux-designer.md`, scope `src/index.ts`, `package.json`, `README.md`, and the tests.
- Draft prompts may still be at `/tmp/adv-architect.txt` and `/tmp/adv-ux.txt`; if wiped on restart, regenerate from the adversary files plus the context below.

### What is DONE and VALID on disk (reconciliation, v1.0.12)
The duplicate-menu-item bug is FIXED and verified. Working tree holds the reconciled extension:
- Root cause: JupyterLab CORE ships `@jupyterlab/terminal-extension:open-folder-in-terminal` (label "Open in Terminal", selector `.jp-DirListing-item[data-isdir="true"]`, folder-only, opens via `terminal:create-new` with {cwd}). Our earlier item duplicated it on folders.
- Fix (reconcile with core, do NOT disable it): `src/index.ts` registers a single context item on `.jp-DirListing-content` with `isVisible` returning false when the selected item is a directory → core owns folders, this extension owns files (parent dir via `PathExt.dirname`) and the empty area (`fileBrowser.model.path`). Reuses core's `terminal:create-new` command, the standard label "Open in Terminal", `terminalIcon.bindprops({stylesheet:'menuItem'})`, and guards on `serviceManager.terminals.isAvailable()`.
- `package.json`: the earlier v1.0.11 `disabledExtensions` approach was removed (superseded by the reconcile); description updated; version 1.0.12.
- Verified: `make install` OK (v1.0.12 enabled), `jlpm test` 5/5 pass, `jlpm run lint:check` clean, JupyterLab page config confirms the core terminal plugin is active (not disabled).

### PENDING work (unmet, for next session)
1. Collect or re-run the two adversarial reviewers' findings (architect + ux lenses).
2. Triage confirmed findings, fix, re-confirm clean (rounds protocol).
3. JOURNAL.md: add entry #8 for the RECONCILIATION (entry #7 documents the now-superseded disabledExtensions approach; note it was replaced by the reconcile). Use `/journal:update`, do not hand-edit.
4. User has NOT yet approved commit/push/publish of the reconciliation itself - ask. (This brace checkpoint commit is authorized by /brace only.)

### Adversarial review findings captured (UX lens - landed post-brace)
UX reviewer verdict: **SHIP WITH FIXES**. Triage/fix next session (not yet confirmed by me):
- **[MAJOR] Default-browser vs clicked-browser** - `src/index.ts` captures the injected `IDefaultFileBrowser` at activation, but selector `.jp-DirListing-content` matches every DirListing. In a secondary file browser, `isVisible`/`execute` read the DEFAULT browser's selection/path → wrong cwd or wrong show/hide. Fix: resolve the acting browser via `IFileBrowserFactory` `tracker.currentWidget` inside isVisible/execute (as core's folder command does), instead of one captured browser. (Conditional: vanilla JupyterLab has one browser.)
- **[MINOR] Caption never says "parent folder"** - `src/index.ts:49` single caption "Open a terminal at this location" for both file (parent folder) and empty area. Make caption dynamic per target. Also verify/align against core's folder-command caption (core's filebrowser-extension not installed to diff).
- **[MINOR] Multi-select / folder-selected-empty-click** - `selectedItems().next()` uses only the first selected item; mixed selection show/hide is on first entry's type. Right-clicking empty area while a folder is selected hides our item (isVisible sees a dir). Low impact; decide semantics if fixed.
- **[MINOR] README slop** - `README.md:23` "Seamless integration" bullet is filler (cut); `README.md:14` "single right-click" overstates a two-step action (→ "with a right-click").
- **[TASTE] `rank: 3`** - `src/index.ts:81` verify position vs core's file-context entries (Rename/Delete/Duplicate).
- Confirmed GOOD: silent absence when terminals unavailable; root-file edge (`PathExt.dirname('x')===''`) correct; reusing core label/icon/`terminal:create-new` is right.

**Architect reviewer** verdict: **UNIFY-NEEDED** (landed post-brace). Triage/fix next session:
- **[MAJOR - real bug] Empty-area item vanishes when a folder is selected** - `src/index.ts:51-56` gates `isVisible` on the SELECTION (`selectedItems()`), but the selector `.jp-DirListing-content` fires on the CLICK TARGET; they diverge. Verified against core `node_modules/@jupyterlab/filebrowser/lib/listing.js`: an empty-area right-click does NOT clear the prior selection (hitTest returns -1, handler returns before select). So: select a folder → right-click blank space → our isVisible sees a directory → hides our item; core's folder item also hidden (click target isn't `[data-isdir="true"]`). Net: NO menu item at all, contradicting README "empty space → current folder". Fix: gate on the actual right-clicked event target (is it an item row? its `data-isdir`?), not `selectedItems()`; or register a separate empty-area-only path. My earlier assumption that empty-click clears selection was WRONG - this is the key defect to fix.
- **[MAJOR] Unit tests are tautological** - `src/__tests__/...spec.ts` declares local literals and asserts them against themselves; never imports `src/index.ts`. Renaming the real COMMAND_ID/selector/label/command keeps tests green - false safety. Fix: import the plugin and assert real wiring, or delete and rely on Galata ui-tests.
- **[MINOR] Command squats core's `filebrowser:` namespace** - `src/index.ts:19` `filebrowser:open-in-terminal`. Rename to `jupyterlab_open_in_terminal_extension:open-in-terminal`.
- **[JUDGEMENT] Hardcoded label 'Open in Terminal' + 'terminal:create-new'** mirror core with no importable constant → drift risk on a core rename. No clean fix; add a comment noting the intentional label mirror.
- **[MINOR] Production `console.log('Command registered...')`** (`src/index.ts:84`) exists only to satisfy the weak Galata assertion; console noise forever. Cut it and assert real behaviour.
- **[MINOR] JOURNAL entries 6-7 now stale** - entry 6 says label "Open Location in Terminal", entry 7 says reconcile via `disabledExtensions`; neither is true now. Add entry #8 for the `isVisible`/`.jp-DirListing-content` reconcile and supersede the stale claims.
- Confirmed GOOD: delegating to `terminal:create-new`; `isAvailable()` guard; correct async try/catch; extension value is real.

NOTE (cross-lens agreement): both reviewers independently flagged the selection-vs-click-target issue (architect as the MAJOR empty-area bug; UX as the multi-select/first-item MINOR) and the default-vs-clicked browser concern. The **empty-area MAJOR** and **tautological tests MAJOR** are the two must-fix items before any publish.

### Nothing detached, nothing paused
No shell jobs, no background compute, no GPU work. Nothing to resume with `kill -CONT`.

### Repo facts
- Path: `/home/lab/workspace/private/jupyterlab/jupyterlab_open_in_terminal_extension`
- Build/install: `make install` ONLY (never raw jlpm/npm/pip). Tests: `jlpm test`. Lint: `jlpm run lint:check`.
- npm pkg `jupyterlab_open_in_terminal_extension`, PyPI `jupyterlab-open-in-terminal-extension`.
