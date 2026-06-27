---
name: inspect-harness
description: "Use when inspecting Darwinian Harness state, provenance, or drift without mutating anything, including explaining why a skill, MCP server, extension, or card is active."
---

# inspect-harness

## Purpose

Explain harness state without mutating anything. Use `status`, `doctor`,
card-status provenance, store health, and extension status surfaces to answer
what is active and why. Use write dry-runs only when the user asks what would
be materialized, including hook-consent warnings or optional card MCP servers.

Requires `drwn` on PATH. Scope is project, read-only. Blast radius is none.

## Procedure

1. Read current state with `drwn status --json`.
2. If the user named a specific skill, MCP server, extension, target, or card,
   run `drwn status --why "<name>"`.
3. If the user asks for a full explanation, run `drwn status --explain`.
4. Run `drwn doctor --json` to surface drift, stale state, or broken symlinks.
5. Run `drwn card status --explain` to surface card-level provenance.
6. Run `drwn store status --json` to surface store health and legacy-layout
   detection.
7. If the user named a published card, run `drwn card show <ref> --json` and
   summarize bundled skills, MCP servers, and `hookPolicies`.
8. If the user asks what a write would do, run `drwn write --dry-run --json`
   and summarize `changes`, `warnings`, and `optionalMcpReport` without
   writing anything.
9. If the user mentioned an extension, run `drwn extensions status <name> --json`
   and `drwn extensions doctor <name> --json`.
10. Summarize findings in prose. If a repair is needed, direct the user to
   `repair-harness` rather than fixing anything here.

## User-Ask Points

None. This skill is intentionally read-only.

If the user asks to fix something, stop and redirect to `repair-harness`.

## Wraps

`drwn status --json`, `drwn status --why`, `drwn status --explain`,
`drwn doctor --json`, `drwn card status --explain`, `drwn store status --json`,
`drwn card show --json`, `drwn write --dry-run --json`,
`drwn extensions status --json`, `drwn extensions doctor --json`

## Scope

Project and machine inspection only. No mutations.

## Failure Modes

- Not in a drwn project: say so plainly and suggest `bootstrap-project`.
- No provenance for `--why`: explain that the named item is not active in the
  current harness.
- Legacy layout detected: flag it loudly and point to `repair-harness`.
- Hook or optional MCP warnings in a write dry-run: explain the impact and point
  to `apply-harness-card` or `materialize-harness`; do not fix them here.

## Related Skills

- `repair-harness`
- `apply-harness-card`
- `install-harness-project`
- `materialize-harness`
- `support-harness`
- `recommend-harness`
