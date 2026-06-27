---
name: install-harness-project
description: "Use when bootstrapping a cloned Darwinian Minds project from an existing card.lock without changing card intent."
---

# install-harness-project

## Purpose

Bootstrap a cloned project that already carries Darwinian Minds card state.
Use the project lockfile to fetch or verify locked cards, preview downstream
materialization, and then apply the locked harness state.

Requires `drwn` on PATH. Scope is project plus local card store. Blast radius is
medium because `drwn install` can clone or fetch Git-backed cards, refresh
lock-derived paths, and write downstream generated state unless `--no-apply` is
used.

## Procedure

1. Verify `drwn` is installed with `drwn --version`. If it fails, halt and tell
   the user to install `drwn`.
2. Confirm this is a locked-project install flow, not a new-project bootstrap.
   If the project has no `.agents/drwn/card.lock`, redirect to
   `bootstrap-project` for new setup or `apply-mind-card` for choosing cards.
3. Read current state with `drwn status --json` and store health with
   `drwn store status --json`.
4. If `legacyLayoutDetected` is true, stop and redirect to `repair-harness`.
   Store migration is machine-wide and should not be hidden inside clone
   bootstrap.
5. For verification-only or CI requests, run
   `drwn install --frozen --no-apply --json`.
   - If it succeeds, report that all locked cards are locally present and no
     downstream write was performed.
   - If it fails, explain which locked card or Git origin needs fetching or
     local repair.
6. For normal clone bootstrap, first run
   `drwn install --frozen --no-apply --json` as a read-only feasibility check.
   Treat a failure as useful preflight information, not as the end of the flow.
7. If fetching, cloning, or lockfile path refresh is needed, explain that
   `drwn install --no-apply --json` mutates the local card store and may refresh
   `.agents/drwn/card.lock`, but does not write `.claude/`, `.codex/`, or
   `.cursor/`.
8. On approval, run `drwn install --no-apply --json`.
9. If card install reports errors, surface them and stop before any downstream
   write.
10. Run `drwn mind list --json` when the user asks which locked minds will be
   active. Absent `activeMinds` means all installed cards are active in
   lockfile order; explicit `activeMinds: []` means no composed mind is active.
11. Preview materialization with `drwn write --dry-run --json`.
12. If the dry run has no changes, verify with `drwn doctor --json` and stop.
13. On approval, run `drwn install --json` to re-verify locked cards and write
   the effective project state in one install operation.
14. Confirm the result with `drwn status --json`, `drwn mind list --json`,
   and `drwn doctor --json`.

## User-Ask Points

1. Confirm moving from frozen/no-apply verification to non-frozen
   `drwn install --no-apply --json`.
2. Confirm downstream materialization after reviewing
   `drwn write --dry-run --json`.

## Wraps

`drwn --version`, `drwn status --json`, `drwn store status --json`,
`drwn install --frozen --no-apply --json`,
`drwn install --no-apply --json`, `drwn write --dry-run --json`,
`drwn mind list --json`, `drwn install --json`, `drwn doctor --json`

## Scope

Project and local card store. It must not change the selected card refs except
where `drwn install` refreshes lock-derived metadata for the same locked cards.

## Failure Modes

- Missing `card.lock`: redirect to `bootstrap-project` or `apply-mind-card`.
- Frozen install fails: explain that the local store lacks required locked card
  content or that the lockfile would need a refresh.
- Git auth or network failure: surface the Git error and do not write
  downstream files.
- Integrity mismatch: stop and direct the user to `repair-harness`.
- Unresolved bundled skill during write preview: surface the missing provider
  and stop before materialization.

## Related Skills

- `bootstrap-project`
- `apply-mind-card`
- `materialize-harness`
- `manage-active-mind-stack`
- `repair-harness`
