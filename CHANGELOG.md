# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

<!-- <END NEW CHANGELOG ENTRY> -->

## [1.0.14] - 2026-07-15

### Added

- Right-click the empty file browser area to open a terminal in the current folder

### Changed

- Complement JupyterLab's built-in "Open in Terminal" instead of disabling it - folders use the native command, while files (parent folder) and the empty area are handled by this extension, all under the same "Open in Terminal" label and icon
- Reuse core's `terminal:create-new` command to open the terminal, matching native behaviour

### Fixed

- Removed the duplicate "Open in Terminal" menu item that appeared on folders
