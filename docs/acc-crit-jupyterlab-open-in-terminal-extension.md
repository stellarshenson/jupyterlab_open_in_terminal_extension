# Acceptance Criteria - jupyterlab_open_in_terminal_extension

JupyterLab 4 frontend extension that complements the built-in "Open in Terminal" command. Core owns folders via `terminal:open-folder-in-terminal`; this extension registers `filebrowser:open-in-terminal` for the two cases core does not cover - a right-clicked file and the empty file browser area - both opening the listing's own folder, reusing core's `terminal:create-new` command.

## Contents

- [Open in Terminal context menu](#open-in-terminal-context-menu)

## Open in Terminal context menu

Exactly one "Open in Terminal" item per right-click context, with visibility resolved from the click target and the working directory from the listing's own path - neither reads the DirListing selection.

| Functionality | Folder item                             | File item                      | Empty area                     |
| ------------- | --------------------------------------- | ------------------------------ | ------------------------------ |
| Menu item     | shown, one only                         | shown, one only                | shown, one only                |
| Provider      | core `terminal:open-folder-in-terminal` | `filebrowser:open-in-terminal` | `filebrowser:open-in-terminal` |
| Terminal cwd  | the folder path                         | `fileBrowser.model.path`       | `fileBrowser.model.path`       |
| Label         | "Open in Terminal"                      | "Open in Terminal"             | "Open in Terminal"             |

- [x] **Folder: core owns it** - right-click on a folder shows exactly one "Open in Terminal", provided by core `terminal:open-folder-in-terminal`
  - log: 2026-08-03 implemented (v1.0.14)
  - log: 2026-08-03 galata covered (v1.0.15)
- [x] **Folder: no duplicate** - `filebrowser:open-in-terminal` is hidden when the right-clicked item is a directory
  - log: 2026-08-03 implemented (v1.0.14)
- [x] **File: item shown** - right-click on a file shows "Open in Terminal"
  - log: 2026-08-03 implemented (v1.0.14)
  - log: 2026-08-03 galata covered (v1.0.15)
- [x] **File: parent folder** - opens a terminal with cwd = `fileBrowser.model.path`, the listing's own path and therefore the file's parent
  - log: 2026-08-03 implemented (v1.0.14)
  - log: 2026-08-03 galata covered (v1.0.15)
  - log: 2026-08-03 cwd now taken from the listing path; dead PathExt.dirname branch removed (v1.0.15)
- [x] **Empty area: item shown** - right-click on blank space below the listing shows "Open in Terminal"
  - log: 2026-08-03 criterion added, regression reported against v1.0.14
  - log: 2026-08-03 closed: fixed via contextMenuHitTest, galata covered (v1.0.15)
- [x] **Empty area: current folder** - opens a terminal with cwd = `fileBrowser.model.path`
  - log: 2026-08-03 criterion added
  - log: 2026-08-03 closed: galata covered (v1.0.15)
- [x] **Empty area: independent of selection** - visibility is derived from the click target and cwd from `fileBrowser.model.path`; neither reads the DirListing selection, which persists across an empty-area right-click
  - log: 2026-08-03 criterion added
  - log: 2026-08-03 closed: fixed via contextMenuHitTest (v1.0.15)
- [x] **Label** - menu label is `trans.__('Open in Terminal')` from the `jupyterlab` catalogue, so it matches core's under any language pack
  - log: 2026-08-03 implemented (v1.0.14)
  - log: 2026-08-03 wrapped in trans.\_\_ to match core's translated label (v1.0.15)
- [x] **Icon** - `terminalIcon` bound with `stylesheet: 'menuItem'`, matching core rendering
  - log: 2026-08-03 implemented (v1.0.14)
- [x] **Caption** - tooltip reads "Open a terminal at this location"
  - log: 2026-08-03 implemented (v1.0.14)
- [x] **Rank** - item registered at rank 3, ordering it after `filebrowser:open-browser-tab` and before the rank 4 separator; core's rank 2 item is never visible in the same menu
  - log: 2026-08-03 implemented (v1.0.14)
- [x] **Terminals unavailable** - plugin registers no command and no menu item when `serviceManager.terminals.isAvailable()` is false
  - log: 2026-08-03 implemented (v1.0.14)
- [x] **Terminal creation failure** - a rejected `terminal:create-new` surfaces `showErrorMessage('Failed to open new terminal', error)`
  - log: 2026-08-03 implemented (v1.0.14)
- [x] **Edge: folder selected, empty area right-clicked** - item shown, cwd = current folder, not the selected folder
  - log: 2026-08-03 criterion added, suspected cause of the empty-area regression
  - log: 2026-08-03 closed: root cause confirmed and fixed, galata covered (v1.0.15)
- [x] **Edge: file selected, empty area right-clicked** - item shown, cwd = current folder, not the selected file's parent
  - log: 2026-08-03 criterion added
  - log: 2026-08-03 closed: galata covered (v1.0.15)
- [ ] **Edge: empty folder** - a listing with no entries offers the item on right-click
  - log: 2026-08-03 criterion added
- [ ] **Edge: no selection at all** - a freshly opened browser with nothing selected shows the item and targets the current folder
  - log: 2026-08-03 criterion added
- [ ] **Edge: file at server root** - the listing path is `''` and the terminal opens at the server root
  - log: 2026-08-03 criterion added
  - log: 2026-08-03 restated against the listing-path contract after PathExt removal (v1.0.15)
- [ ] **Edge: multiple items selected, file right-clicked** - selection count is irrelevant; cwd is the listing path, so the terminal opens in the folder on screen
  - log: 2026-08-03 criterion added
  - log: 2026-08-03 restated against the listing-path contract after PathExt removal (v1.0.15)
- [x] **Edge: subfolder navigation** - after entering a subfolder, the empty-area target follows the new `fileBrowser.model.path`
  - log: 2026-08-03 criterion added
  - log: 2026-08-03 closed: galata covered (v1.0.15)
- [x] **Single file browser** - visibility reads any `.jp-DirListing-item` on the page while cwd reads `IDefaultFileBrowser`; assumes the default browser is the only listing, matching core's own single-tracker behaviour
  - log: 2026-08-03 added
  - log: 2026-08-03 closed: documented assumption, no second-browser handling by design (v1.0.15)
- [x] **Unit gate can fail** - Jest mocks the four value imports (`@jupyterlab/application` is type-only and never loaded at runtime) and exercises the real plugin, so a drift in command id, label, selector, rank, visibility or cwd fails the suite
  - log: 2026-08-03 added
  - log: 2026-08-03 closed: 10 jest tests, 100% index.ts coverage, mutant killed (v1.0.15)
- [x] **JupyterLab 4.6 floor** - delegating folders to core requires `terminal:open-folder-in-terminal`, absent from 4.0.11 through 4.5.9 and first shipped in 4.6.0; the floor is declared in `pyproject.toml` (build, runtime and bootstrap), `package.json` and the README
  - log: 2026-08-03 added
  - log: 2026-08-03 closed: verified by downloading 4.0.11/4.1.0/4.2.0/4.3.0/4.4.0/4.5.0/4.5.7/4.5.9 (absent) and 4.6.0 (present) (v1.0.15)
