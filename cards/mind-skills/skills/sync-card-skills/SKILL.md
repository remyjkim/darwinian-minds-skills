---
name: sync-card-skills
description: "Use when a Mind Card source's bundled skills have drifted from their canonical sources elsewhere on disk and need refreshing before re-publish — re-pulls each skill into the card source with drwn card source add-skill --replace, dry-run gated. Use when skills live in a product repo and the card bundles copies."
---

# sync-card-skills

## Purpose

Keep a Mind Card source's bundled skill copies aligned with their canonical
sources. Published cards are immutable and bundle skill content as copies taken
at author time; when the canonical skills change (for example, skills versioned
inside a product repo), the editable card **source** must be re-synced before
the next `drwn card publish`. This skill generalizes that refresh so it is one
guided operation over `drwn card source add-skill ... --replace` instead of
manual per-skill commands or hand-copied directories.

Requires `drwn` on PATH. Scope is card source. Blast radius is medium because
`--replace` overwrites bundled skill content in the mutable source. It never
touches the immutable published store and never publishes — re-publishing the
synced source is a separate, approved step via `author-mind-card`.

## Procedure

1. Verify the installed CLI before mutation:
   1. Run `command -v drwn` and `drwn --version`.
   2. Prefer the installed `drwn` binary over repo-local dev invocations unless
      the user is explicitly testing unreleased CLI changes.
2. Resolve the sync target and the canonical source:
   1. Confirm the fully-qualified card source name `@<scope>/<name>`. Sync
      operates on a card **source**, not a published ref. If the user names a
      published ref, redirect to `author-mind-card` (sources are mutable;
      published versions are immutable).
   2. Confirm the canonical skills root — the directory whose subdirectories are
      the up-to-date skill sources (for example a product repo's
      `.claude/skills/`). Per-skill `--from` overrides are allowed when a skill's
      canonical path does not follow `<root>/<skill-name>`.
3. Read current state: `drwn card source show @<scope>/<name> --json` and capture
   `bundledSkills`. Build three sets:
   - **To sync** — bundled skills that have a canonical match under the root.
   - **Orphaned bundled** — bundled skills with no canonical match (candidates
     for `remove-skill`, handled by `author-mind-card`; surface, do not
     auto-remove).
   - **Unbundled canonical** — canonical skills not yet in the card (candidates
     for a first-time `add-skill`; surface, do not auto-add unless the user asks).
4. Dry-run every sync target before any write:
   `drwn card source add-skill @<scope>/<name> <skill> --from <root>/<skill> --replace --dry-run --json`.
   Summarize the planned content and manifest changes per skill in one table.
5. Use `AskUserQuestion` to confirm the batch of `--replace` syncs after the user
   reviews the dry-run output. If the user opted to also add unbundled canonical
   skills, confirm those (without `--replace`) in the same prompt.
6. Execute the confirmed commands without `--dry-run`.
7. Verify:
   1. Run `drwn card source doctor @<scope>/<name> --json`. Treat `ok: false` as
      reportable source work, not a command failure.
   2. Run `drwn card source show @<scope>/<name> --json` and summarize the
      synced skill count and any remaining orphans.
8. Remind the user that sync only updates the **mutable source**. To release the
   refreshed content, continue with `author-mind-card`
   (`drwn card source set --version ...` then `drwn card publish`).

## User-Ask Points

Use the `AskUserQuestion` tool at every point below so the user can respond with
clickable options. Batch related questions into one prompt.

1. Confirm the card source `@<scope>/<name>` and the canonical skills root (plus
   any per-skill `--from` overrides) before reading state.
2. Confirm the batch of `--replace` syncs after reviewing the dry-run table.
3. Confirm whether to also add unbundled canonical skills, or to leave them out.
4. Confirm handoff to `author-mind-card` for re-publish, and surface orphaned
   bundled skills for the user to decide on `remove-skill` there.

## Wraps

`command -v drwn`, `drwn --version`, `drwn card source show --json`,
`drwn card source add-skill --from --replace --dry-run --json`,
`drwn card source add-skill --from --replace`, `drwn card source doctor --json`.

## Scope

Card source under `~/.agents/drwn/sources/<scope>/<name>/`. Publishing,
version bumps, deprecation, remotes, and catalog publication belong to
`author-mind-card` and `share-mind-card`.

## Failure Modes

- Published ref passed instead of a source: published versions are immutable.
  Redirect to `author-mind-card` to publish a new version from the source.
- Card source not found: surface the `drwn card source show` error verbatim;
  the source must already exist (`drwn card new` first).
- Canonical path missing for a bundled skill: skip it, report it as an orphan,
  and do not write. Do not invent a `--from` path.
- `--replace` would overwrite a skill the user did not intend to touch: the
  dry-run table and the batch confirmation exist to catch this — never sync a
  skill the user did not list or confirm.
- Source doctor returns `ok: false` after sync: report the issues; do not
  proceed to publish.
- `DRWN_STORE_READONLY=1`: `card source show`, `doctor`, and dry-run commands
  can still run, but real `--replace` writes must stop before mutating.

## Related Skills

- `author-mind-card`
- `apply-mind-card`
- `materialize-harness`
