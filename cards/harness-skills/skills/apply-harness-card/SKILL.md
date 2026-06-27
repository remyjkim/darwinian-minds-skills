---
name: apply-harness-card
description: "Use when applying, adding, pinning, removing, updating, detaching, or inspecting Harness Cards in the current project before materializing downstream changes."
---

# apply-harness-card

## Purpose

Manage the project's Harness Card set: apply a fresh set, add or remove
individual cards, pin exact versions, refresh the lockfile, detach the project
from cards entirely, inspect what is currently applied, and manage explicit
hook consent for cards that declare hook policies.

Requires `drwn` on PATH. Scope is project. Blast radius is medium because this
skill mutates project config, `card.lock`, and usually downstream generated
state after `drwn write`.

Cards pin harness state: card versions, bundled skills, MCP definitions,
extension intent, targets, and the project overlay. They do not pin the `drwn`
version, Claude/Codex/Cursor versions, operating-system dependencies, or
unpinned MCP runtime packages.

Card-bundled MCP definitions are optional until the project opts in with
`drwn add mcp <name>`. Card-bundled hooks are skipped by default unless the
locked card has valid hook consent recorded in `card.lock`.

## Procedure

1. Read project card state with `drwn card status --json`.
2. Read published local card inventory with `drwn card list --json`.
3. Disambiguate intent:
   - Apply a full set: `drwn apply <spec> ...`
   - Add one: `drwn card add <spec>`
   - Pin one: `drwn card pin <spec>`
   - Remove one: `drwn card remove <name>`
   - Detach all cards: `drwn card detach`
   - Refresh lockfile: `drwn card update`
   - Inspect updates: `drwn card outdated --json`
   - Fetch remote update candidates: `drwn card outdated --fetch --json`
   - Trust card hooks: `drwn card trust <card> --hooks [--range <range>]`
   - Clear card hook consent: `drwn card untrust <card> --hooks`
4. Before a mutating card command, show the exact before/after intent in prose.
   Card mutations do not support `--dry-run` today.
5. On approval, run the selected card command.
6. If a locked card declares hooks, inspect it with
   `drwn card show <card>@<version> --json` and summarize its `hookPolicies`.
   If `card status` or `doctor` reports missing or out-of-range hook consent,
   ask before running `drwn card trust <card> --hooks [--range <range>]`.
   Use `drwn card untrust <card> --hooks` only when the user explicitly wants
   to clear prior hook consent.
7. Preview downstream effect with `drwn write --dry-run --json`.
8. Summarize `changes`, `warnings`, and `optionalMcpReport`. If hooks are
   skipped, explain whether consent is missing or out of range. If optional
   card MCP servers are skipped, tell the user which project opt-in commands
   such as `drwn add mcp <name>` would activate them.
9. If the user wants hook issues to fail closed, rerun the preview as
   `drwn write --strict-hooks --dry-run --json` and resolve any consent issues
   before a real write.
10. On approval, run `drwn write`, adding `--strict-hooks` only when the user
    chose fail-closed hook behavior.
11. Confirm the result with `drwn card status --json`.
12. If the user wants provenance for a newly active item, run
   `drwn status --why <name>`.

## User-Ask Points

1. Confirm the requested card-set mutation before any `drwn apply` or
   `drwn card ...` mutation.
2. Confirm hook consent before any `drwn card trust <card> --hooks`.
3. Confirm clearing hook consent before any `drwn card untrust <card> --hooks`.
4. Confirm optional card MCP activation before any `drwn add mcp <name>`.
5. Confirm the final `drwn write` after reviewing `changes`, warnings, and
   optional MCP report.

## Wraps

`drwn card status --json`, `drwn card list --json`, `drwn card outdated --json`,
`drwn card outdated --fetch --json`, `drwn apply`, `drwn card add`,
`drwn card pin`, `drwn card remove`, `drwn card detach`, `drwn card update`,
`drwn card show --json`, `drwn card trust --hooks`,
`drwn card untrust --hooks`, `drwn add mcp`, `drwn write --dry-run --json`,
`drwn write --strict-hooks --dry-run --json`, `drwn write`,
`drwn write --strict-hooks`, `drwn status --why`

## Scope

Project only.

## Failure Modes

- Unresolved card spec: surface the exact failure and stop.
- Duplicate card on add: surface the conflict and suggest `pin` or `update`.
- Missing card on remove or pin: tell the user and refer back to the current
  project status.
- No outdated cards: explain that there is nothing to refresh.
- Hook consent missing or out of range: hooks are skipped by default; ask for
  explicit consent before `drwn card trust <card> --hooks`.
- `--strict-hooks` preview fails: resolve hook consent first or rerun without
  strict mode only after the user accepts skipped hooks.
- Optional card MCP skipped: explain that the card made the definition
  available but project activation still requires `drwn add mcp <name>`.

## Related Skills

- `author-harness-card`
- `install-harness-project`
- `materialize-harness`
- `share-harness-card`
- `inspect-harness`
- `recommend-harness`
