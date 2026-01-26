<!-- @import /home/lab/workspace/.claude/CLAUDE.md -->

# Project-Specific Configuration

This file imports workspace-level configuration from `/home/lab/workspace/.claude/CLAUDE.md`.
All workspace rules apply. Project-specific rules below strengthen or extend them.

The workspace `/home/lab/workspace/.claude/` directory contains additional instruction files
(MERMAID.md, NOTEBOOK.md, DATASCIENCE.md, GIT.md, JUPYTERLAB_EXTENSION.md, and others) referenced by CLAUDE.md.
Consult workspace CLAUDE.md and the .claude directory to discover all applicable standards.

## Mandatory Bans (Reinforced)

The following workspace rules are STRICTLY ENFORCED for this project:

- **No automatic git tags** - only create tags when user explicitly requests
- **No automatic version changes** - only modify version in package.json/pyproject.toml when user explicitly requests
- **No automatic publishing** - never run `make publish`, `npm publish`, `twine upload` without explicit user request
- **No manual package installs** - use `make install` exclusively, not direct `pip install`/`npm install`/`jlpm install`
- **No automatic git commits or pushes** - only when user explicitly requests

## Project Context

JupyterLab 4 frontend extension that adds a context menu item to open the selected folder in a terminal. TypeScript/JavaScript frontend with Python packaging. Uses copier template for JupyterLab extensions.

**Technology Stack**:

- TypeScript for JupyterLab frontend extension
- Python packaging via pyproject.toml and hatchling
- Jest for unit tests
- Playwright/Galata for integration tests
- jupyter-releaser CI/CD workflows

**Package Names**:

- npm: `jupyterlab_open_in_terminal_extension`
- PyPI: `jupyterlab-open-in-terminal-extension` (underscores become hyphens)

## Strengthened Rules

- Always use `make install` for building and installing - never run `npm install`, `jlpm`, `yarn`, or `pip install` directly
- Always include both `package.json` and `package-lock.json` in commits
- Follow JUPYTERLAB_EXTENSION.md for extension development patterns
