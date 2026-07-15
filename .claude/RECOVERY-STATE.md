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

### Nothing detached, nothing paused
No shell jobs, no background compute, no GPU work. Nothing to resume with `kill -CONT`.

### Repo facts
- Path: `/home/lab/workspace/private/jupyterlab/jupyterlab_open_in_terminal_extension`
- Build/install: `make install` ONLY (never raw jlpm/npm/pip). Tests: `jlpm test`. Lint: `jlpm run lint:check`.
- npm pkg `jupyterlab_open_in_terminal_extension`, PyPI `jupyterlab-open-in-terminal-extension`.
