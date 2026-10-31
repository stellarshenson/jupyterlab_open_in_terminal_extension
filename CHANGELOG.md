# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

## [1.0.20] - 2026-10-31

### Changed

- Apply the template files and packages the upgrade left out

## [1.0.18] - 2026-10-31

### Changed

- Upgrade to extension template v4.6.5 and Makefile 1.46

### Fixed

- Take the scoped @stellarshenson/jupyterlab-open-in-terminal-extension npm name

## [1.0.16] - 2026-08-03

### Added

- Galata integration tests covering all three file browser click regimes - folder, file, and empty area - including the terminal working directory each one opens
- Acceptance criteria document at `docs/acc-crit-jupyterlab-open-in-terminal-extension.md`

### Changed

- **Breaking** - JupyterLab 4.6.0 is now a hard requirement. Folders are delegated to the built-in `@jupyterlab/terminal-extension:open-folder-in-terminal`, which first shipped in 4.6.0; on earlier releases no "Open in Terminal" item appeared on folders at all
- Menu label and error text now go through `ITranslator`, so they match the core command under a language pack
- Dropped the unused `@jupyterlab/coreutils` and `@jupyterlab/services` dependencies

### Fixed

- The empty file browser area showed no "Open in Terminal" item while a folder or file was selected. `DirListing` leaves the selection untouched when the blank area is right-clicked, so the selection cannot identify the click target - visibility now reads the context menu event target instead

<!-- <END NEW CHANGELOG ENTRY> -->

## [1.0.14] - 2026-07-15

### Added

- Right-click the empty file browser area to open a terminal in the current folder

### Changed

- Complement JupyterLab's built-in "Open in Terminal" instead of disabling it - folders use the native command, while files (parent folder) and the empty area are handled by this extension, all under the same "Open in Terminal" label and icon
- Reuse core's `terminal:create-new` command to open the terminal, matching native behaviour

### Fixed

- Removed the duplicate "Open in Terminal" menu item that appeared on folders
