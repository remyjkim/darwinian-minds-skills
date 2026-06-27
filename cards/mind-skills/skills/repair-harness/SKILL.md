---
name: repair-harness
description: "Use when repairing Darwinian Minds drift, missing generated files, outdated card locks, or legacy layout, with previews and approvals before mutation."
---

# repair-harness

## Purpose

Guide safe repair of harness state after `inspect-harness` or a user report
finds drift. Use diagnostics to classify the issue, preview the fix, and only
then mutate. Treat hook consent and optional card MCP activation as explicit
user decisions, not automatic repairs.

Requires `drwn` on PATH. Scope is primarily project, but this skill also
touches the machine-wide store during `drwn store migrate`. Blast radius is
high.

## Procedure

1. Read current diagnostics with `drwn doctor --json`.
2. If cards are involved, read `drwn card status --explain`.
3. Read `drwn mind list --json` when generated mind files or active stack
   behavior are involved.
4. Read `drwn store status --json` to check for legacy layout.
5. Classify the issue:
   - Legacy layout detected
   - Broken symlinks, stale generated files, or MCP drift
   - Outdated card lock
   - Card hook consent missing or outside the locked version range
   - Optional card MCP definitions skipped because the project has not opted in
   - Active mind stack mismatch or stale composed mind output
   - Extension-specific health failure
6. For legacy layout:
   1. Explain what `drwn store migrate` will do.
   2. Ask for approval.
   3. Run `drwn store migrate` or `drwn store migrate --yes` when appropriate.
7. For downstream drift:
   1. Run `drwn write --dry-run --json`.
   2. Show `changes`, `warnings`, and `optionalMcpReport`.
   3. On approval, run `drwn write`.
   4. If the fix requires overwriting drwn-owned drift, explain `--force`
      explicitly and ask again before running `drwn write --force`.
8. For active mind stack mismatches:
   1. If `activeMinds: []` and `.agents/drwn/generated/mind/` is absent, report
      that as expected.
   2. Do not automatically add a card to the active stack as a repair.
   3. Redirect desired stack changes to `manage-active-mind-stack`.
9. For missing or out-of-range hook consent:
   1. Run `drwn card status --explain` and `drwn write --dry-run --json`.
   2. Inspect the card with `drwn card show <card>@<version> --json` and
      summarize the declared `hookPolicies`.
   3. Ask for explicit consent before running
      `drwn card trust <card> --hooks [--range <range>]`.
   4. Rerun `drwn write --strict-hooks --dry-run --json` to confirm hook
      materialization no longer fails closed.
   5. Continue through the normal write approval path.
10. For optional card MCP definitions skipped by the write preview:
    1. Explain that the card made the MCP definition available, but the project
       still needs to opt in.
    2. Preview activation with `drwn add mcp <name> --dry-run --json`.
    3. On approval, run `drwn add mcp <name>`.
    4. Rerun `drwn write --dry-run --json` and continue through the write path.
11. For outdated card locks:
    1. Run `drwn card outdated --json`.
    2. On approval, run `drwn card update`.
    3. Then preview with `drwn write --dry-run --json` and continue through the
       write path.
12. For extension failures:
    1. Run `drwn extensions doctor --json` and
       `drwn extensions status <name> --json`.
    2. If a setup re-run is required, preview and explain it first.
    3. On approval, run `drwn extensions setup <name>`.
    4. Then preview downstream changes with `drwn write --dry-run --json`.
13. Re-run the relevant read-only commands to confirm the repair.

## User-Ask Points

1. Confirm store migration.
2. Confirm `drwn write`.
3. Confirm `drwn write --force` with an explicit overwrite warning.
4. Confirm hook consent before `drwn card trust <card> --hooks`.
5. Confirm optional MCP activation before `drwn add mcp <name>`.
6. Confirm `drwn card update`.
7. Confirm extension setup re-run when external tool setup is involved.

## Wraps

`drwn doctor --json`, `drwn card status --explain`, `drwn mind list --json`,
`drwn store status --json`,
`drwn store migrate`, `drwn write --dry-run --json`, `drwn write`,
`drwn write --strict-hooks --dry-run --json`, `drwn write --force`,
`drwn card show --json`, `drwn card trust --hooks`,
`drwn add mcp --dry-run --json`, `drwn add mcp`,
`drwn card outdated --json`, `drwn card update`,
`drwn extensions doctor --json`, `drwn extensions status --json`,
`drwn extensions setup`

## Scope

Project first, with machine-store mutation during migration.

## Failure Modes

- Clean diagnostics: explain that there is nothing to repair.
- User declines migration or write: stop cleanly with no further mutation.
- `drwn write` fails on unresolved included skills: surface the missing name and
  do not try to bypass it with `--force`.
- Hook consent declined: leave hooks skipped and do not run `--strict-hooks`.
- Optional MCP activation declined: leave the MCP skipped and do not treat it as
  drift.
- Active stack change requested: redirect to `manage-active-mind-stack`; do not
  hide activation as repair.
- Extension setup failure: surface stderr and stop.

## Related Skills

- `inspect-harness`
- `apply-mind-card`
- `install-harness-project`
- `materialize-harness`
- `manage-defaults`
- `manage-active-mind-stack`
