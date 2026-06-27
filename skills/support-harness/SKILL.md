---
name: support-harness
description: "Use when collecting Darwinian Harness support artifacts, exporting or analyzing session logs, managing analyzer auth, or running low-risk store maintenance checks."
---

# support-harness

## Purpose

Collect support context and run explicit store maintenance commands without
conflating support work with repair. Use this for session-log exports, store
status, store verification, store archive export, and Git garbage collection
for local card repos. Also use this for analyzer auth and uploading session
archives with `drwn analyze sessions`.

Requires `drwn` on PATH. Scope is project for session exports and machine store
for store commands. Blast radius ranges from none to medium: verification is
read-only, exports write archive files, and `store gc` mutates local Git
storage without changing card content.

## Procedure

1. Verify `drwn` is installed with `drwn --version`. If it fails, halt and tell
   the user to install `drwn`.
2. Read baseline state with `drwn status --json` and
   `drwn store status --json`.
3. Disambiguate the user's support intent:
   - Inspect store status: `drwn store status --json`
   - Verify card store health: `drwn store verify --json`
   - Export session logs: `drwn export sessions`
   - Check analyzer auth: `drwn whoami --json`
   - Sign in or out of the analyzer: `drwn login` or `drwn logout`
   - Upload session logs for analysis: `drwn analyze sessions`
   - Export the local store: `drwn store export --out <path>`
   - Run Git garbage collection: `drwn store gc`
4. For session exports:
   1. Run `drwn export sessions --dry-run`.
   2. Show how many Claude/Codex session files would be archived and the
      intended destination.
   3. Ask whether the user wants the default archive, an explicit `--out
      <path>`, and whether to use `--gzip`.
   4. On approval, run `drwn export sessions [--out <path>] [--gzip]`.
5. For analyzer auth:
   1. Run `drwn whoami --json`.
   2. If unauthenticated, explain that `drwn login` requires an analyzer API
      URL from `analyzer.apiUrl` or `DRWN_ANALYZER_URL`.
   3. On approval, run `drwn login`, or `drwn login --no-browser` when the user
      wants to open the device-flow URL manually.
   4. Verify with `drwn whoami --json`.
   5. If the user asks to sign out, run `drwn logout` and then `drwn whoami`.
6. For analyzer upload:
   1. Run `drwn analyze sessions --dry-run [--archive <path>]` to validate the
      selected archive and analyzer endpoint without network upload.
   2. If the user wants a new archive, add `--fresh`; if they already have an
      archive, pass `--archive <path>`.
   3. Confirm whether to use `--wait`, `--open`, or `--json`.
   4. On approval, run
      `drwn analyze sessions [--fresh|--archive <path>] [--wait] [--open] [--json]`.
7. For store verification, run `drwn store verify --json` and summarize card
   store health. This is read-only and needs no approval.
8. For store archive export:
   1. Ask for an explicit output path.
   2. Explain that `drwn store export --out <path>` writes a tar archive of the
      local `~/.agents/drwn` store.
   3. On approval, run `drwn store export --out <path>`.
9. For `drwn store gc`:
   1. Explain that it runs Git garbage collection in local card repositories.
   2. Ask for approval because it mutates local Git storage.
   3. Run `drwn store gc`.
   4. Verify with `drwn store verify --json`.
10. If support checks reveal drift, unresolved config, legacy layout, or
   integrity problems, stop and redirect to `repair-harness`.

## User-Ask Points

1. Confirm writing a session archive after reviewing the dry run.
2. Confirm analyzer sign-in, sign-out, and session archive upload.
3. Confirm `--wait` or `--open` before long polling or opening a browser.
4. Confirm the explicit store export destination.
5. Confirm `drwn store gc`.

## Wraps

`drwn --version`, `drwn status --json`, `drwn store status --json`,
`drwn store verify --json`, `drwn export sessions --dry-run`,
`drwn export sessions`, `drwn whoami --json`, `drwn login`,
`drwn login --no-browser`, `drwn logout`,
`drwn analyze sessions --dry-run`, `drwn analyze sessions`,
`drwn store export --out`, `drwn store gc`

## Scope

Project session export and machine-level local `drwn` store support. This skill
does not repair state or write downstream agent tool configuration.

## Failure Modes

- No project session files found: report that there is nothing to archive.
- Export destination already exists or is unwritable: ask for another path.
- Store verification fails: surface the failing card repo and redirect to
  `repair-harness`.
- Analyzer API URL missing: ask the user to configure `analyzer.apiUrl` or set
  `DRWN_ANALYZER_URL` before `drwn login`.
- Analyzer session missing or expired: run `drwn login` before upload.
- Archive exceeds analyzer limit: suggest `drwn export sessions --gzip` or a
  smaller explicit archive.
- User asks to fix drift: redirect to `repair-harness`.

## Related Skills

- `inspect-harness`
- `repair-harness`
- `install-harness-project`
