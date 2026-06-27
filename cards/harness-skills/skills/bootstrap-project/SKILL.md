---
name: bootstrap-project
description: "Use when initializing Darwinian Minds in the current project, enabling extensions, or applying starter cards with approval checkpoints before downstream writes."
---

# bootstrap-project

## Purpose

Initialize Darwinian Minds for the current repo. Optionally enable
extensions, surface starter cards, and preview downstream changes before any
write to `.claude/`, `.codex/`, or `.cursor/`.

Requires `drwn` on PATH. Scope is primarily project. Blast radius is medium
because this skill mutates project config, card.lock, and downstream generated
agent-tool files.

## Procedure

1. Verify `drwn` is installed with `drwn --version`. If it fails, halt and tell
   the user to install `drwn`.
2. Read current state with `drwn status --json`. If `project` is `null`, the
   current directory is not a drwn project.
3. Preflight the store with `drwn store status --json`. If
   `legacyLayoutDetected` is true, pause and ask before running
   `drwn store migrate`.
4. If the project already has `.agents/drwn/card.lock`, redirect to
   `install-harness-project` instead of running `drwn init`.
5. If the user only wants to add a direct skill or MCP server to an existing
   project, redirect to `materialize-harness`.
6. If the current directory is not yet a project and the user approves, run
   `drwn init` in a TTY or `drwn init --non-interactive` otherwise.
7. Ask whether the user wants project-only setup or also machine-default
   changes. If machine scope is desired, call that out explicitly before any
   extra mutation.
8. Ask which extensions to enable from `parallel`, `beads`, and `markitdown`.
   For each selected extension:
   1. Run `drwn extensions add <name> --dry-run --json`.
   2. Show `projectChanges` and `next`.
   3. On approval, run `drwn extensions add <name>`.
   4. If setup is recommended, run `drwn extensions setup <name> --dry-run --json`
      and show `steps` and `warnings`.
   5. On approval, run `drwn extensions setup <name>` with the needed flags.
9. If the user mentions a domain like React, Python, or CLI tooling:
   1. Run `drwn search card "<query>" --json` to check registered card
      catalogs.
   2. Run `drwn card list --json` to inspect already-published local store
      cards.
   3. Optionally run `drwn search skill "<query>" --json` and
      `drwn search mcp "<query>" --json` if the user may want direct additions
      rather than a card.
   4. If the user chooses a card, capture the spec.
10. If a card was chosen and the user approves, run `drwn apply <card-spec>`.
   Explain that this mutates project config and `card.lock` immediately, while
   downstream tool state updates only on the next write. Also explain that an
   absent `activeMinds` setting means all installed cards are active in
   lockfile order; use `manage-active-mind-stack` if the user wants a smaller
   or reordered stack.
11. Run `drwn mind list --json` after applying cards when the user asks what
   minds will be active.
12. Preview the final materialization with `drwn write --dry-run --json`.
13. On approval, run `drwn write`.
14. If the user wants provenance for a newly active skill or MCP server, run
   `drwn status --why <name>`.

## User-Ask Points

1. Confirm project initialization when `drwn status --json` shows `project:
   null`.
2. Confirm `drwn store migrate` when `legacyLayoutDetected` is true.
3. Confirm scope if the user wants machine-default changes in addition to the
   project setup.
4. Confirm each extension add after reviewing the dry-run JSON.
5. Confirm each extension setup after reviewing its dry-run steps and warnings.
6. Confirm any card application before `drwn apply`.
7. Confirm the final `drwn write` after reviewing `changes`.

## Wraps

`drwn --version`, `drwn status --json`, `drwn status --why`,
`drwn store status --json`, `drwn store migrate`, `drwn init`,
`drwn extensions add`, `drwn extensions setup`, `drwn card list --json`,
`drwn search card --json`, `drwn search skill --json`, `drwn search mcp --json`,
`drwn apply`, `drwn mind list --json`, `drwn write --dry-run --json`,
`drwn write`

## Scope

Project first. Optionally touches machine defaults if the user explicitly asks
for that broader scope.

## Failure Modes

- `drwn` missing from PATH: halt and point the user at installation docs.
- Unresolved card spec: surface the exact failure and do not continue to write.
- Extension setup failure: surface stderr and stop.
- Empty `changes` from `drwn write --dry-run --json`: explain that the harness
  is already in the desired state and skip the write.

## Related Skills

- `apply-mind-card`
- `install-harness-project`
- `materialize-harness`
- `inspect-harness`
- `recommend-harness`
- `manage-active-mind-stack`
