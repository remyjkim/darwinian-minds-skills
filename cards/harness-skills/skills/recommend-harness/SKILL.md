---
name: recommend-harness
description: "Use when suggesting Mind Cards for Darwinian Minds, extensions, skills, or MCP servers for the current project without mutating state."
---

# recommend-harness

## Purpose

Discover what is available and recommend the best fit for the current project.
This skill is strictly read-only. It outputs prose recommendations plus
copy-paste-ready `drwn` command sequences for the user or a sibling skill to
execute.

Requires `drwn` on PATH. Scope is project, read-only. Blast radius is none.

## Procedure

1. Read current project state with `drwn status --json`.
2. Read currently applied project cards with `drwn card status --json`.
3. Read active mind state with `drwn mind list --json` when the recommendation
   may affect mind composition.
4. Read available local cards with `drwn card list --json`.
5. Read available library, skill, and extension inventory:
   - `drwn library list --json`
   - `drwn skills list --json`
   - `drwn extensions list --json`
6. Ask a clarifying question if the user's intent is not specific enough.
7. Search registered card catalogs and direct inventory with:
   - `drwn search card "<query>" --json`
   - `drwn search skill "<query>" --json`
   - `drwn search mcp "<query>" --json`
8. Synthesize recommendations in prose. For each suggestion, include:
   - what it is
   - why it matches the project
   - which sibling skill should execute it
   - the exact `drwn` command sequence
9. Distinguish installing/applying a Mind Card from switching the active stack.
   Applying changes installed cards; activation order changes belong to
   `manage-active-mind-stack`.
10. For catalog-backed card recommendations, state whether the needed catalog is
   already registered. If it is not registered, direct the user to
   `manage-harness-library` before treating the card as installable.
11. Do not emit draft card manifests.
12. Do not run any mutating `drwn` command from this skill.

## User-Ask Points

None. Optional clarifying questions are conversational only.

If the user asks to apply a recommendation, stop and redirect to
`apply-mind-card`, `bootstrap-project`, `materialize-harness`,
`manage-harness-library`, or `manage-defaults` as appropriate.

## Wraps

`drwn status --json`, `drwn card status --json`, `drwn card list --json`,
`drwn mind list --json`, `drwn library list --json`, `drwn skills list --json`,
`drwn extensions list --json`, `drwn search card --json`,
`drwn search skill --json`, `drwn search mcp --json`

## Scope

Project and machine inventory inspection only. No mutations.

## Failure Modes

- No matches: explain that plainly and suggest broader search terms.
- Catalog unavailable: fall back to local library-only results and say so.

## Related Skills

- `apply-mind-card`
- `bootstrap-project`
- `author-mind-card`
- `materialize-harness`
- `manage-harness-library`
- `manage-defaults`
- `manage-active-mind-stack`
