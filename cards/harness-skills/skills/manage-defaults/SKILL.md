---
name: manage-defaults
description: "Use when managing machine-wide Darwinian Minds defaults or the curated publication layer for all projects on this machine."
---

# manage-defaults

## Purpose

Manage machine-wide defaults in `~/.agents/drwn/machine.json` and the curated
publication layer at `~/.agents/skills/`. Use `manage-harness-library` for
package-backed skill bundles, MCP library definitions, and card catalogs before
making anything a default.

Requires `drwn` on PATH. Scope is machine. Blast radius is high because changes
affect all future projects on this machine and may update compatibility
symlinks under `~/.agents/skills`.

## Procedure

1. Verify `drwn` is installed with `drwn --version`. If it fails, halt and tell
   the user to install `drwn`.
2. Read current state with:
   - `drwn library defaults list --json`
   - `drwn library list --json`
   - `drwn skills list --json`
3. Confirm explicitly that the user wants machine-wide scope.
4. Disambiguate the intent:
   - Add or remove a default skill
   - Add or remove a default MCP server
   - Curate a shared skill into `~/.agents/skills`
   - Uncurate a shared skill from `~/.agents/skills`
   - Inspect available inventory before deciding
5. For default skill changes:
   1. Preview with
      `drwn library defaults add skill <name> --dry-run --json` or
      `drwn library defaults remove skill <name> --dry-run --json`.
   2. Explain that add also curates shared skills into `~/.agents/skills`, and
      remove uncurates the skill if that link exists.
   3. On approval, run the corresponding command without `--dry-run`.
6. For default MCP changes:
   1. Preview with `drwn library defaults add mcp <name> --dry-run --json` or
      `drwn library defaults remove mcp <name> --dry-run --json`.
   2. Explain that this changes machine defaults but does not edit a project
      overlay directly.
   3. On approval, run the corresponding command without `--dry-run`.
7. For direct curation:
   1. Confirm that the user wants publication-layer compatibility without
      adding the skill to machine defaults.
   2. Run `drwn skills curate <name> --json` or
      `drwn skills uncurate <name> --json` after approval.
8. If the user is currently inside a project and wants the downstream effect
   materialized there, redirect to `materialize-harness` for the write preview
   and approval.
9. Re-read `drwn library defaults list --json` and `drwn skills list --json` to
   confirm the final machine state.

## User-Ask Points

1. Confirm machine-wide scope.
2. Confirm every defaults mutation after dry-run preview.
3. Confirm direct curate or uncurate intent.
4. Confirm handoff before downstream project or machine materialization.

## Wraps

`drwn --version`, `drwn library list --json`,
`drwn library defaults list --json`,
`drwn library defaults add skill --dry-run --json`,
`drwn library defaults add skill`,
`drwn library defaults remove skill --dry-run --json`,
`drwn library defaults remove skill`,
`drwn library defaults add mcp --dry-run --json`,
`drwn library defaults add mcp`,
`drwn library defaults remove mcp --dry-run --json`,
`drwn library defaults remove mcp`, `drwn skills curate --json`,
`drwn skills uncurate --json`, `drwn skills list --json`

## Scope

Machine-wide defaults and curated publication layer only. This skill does not
install bundles, register MCP definitions, manage catalogs, or write downstream
agent-tool state.

## Failure Modes

- User wanted project-only scope: redirect to `materialize-harness`.
- Requested skill or MCP is not available in inventory: redirect to
  `manage-harness-library` first.
- Curate/uncurate target missing or not shared-scope: show the current skill
  list and stop.
- User asks to write downstream files after changing defaults: redirect to
  `materialize-harness` for dry-run and approval.

## Related Skills

- `manage-harness-library`
- `materialize-harness`
- `bootstrap-project`
- `inspect-harness`
- `recommend-harness`
