---
name: share-harness-card
description: "Use when sharing Darwinian Harness Cards through Git remotes, publishing cards to catalogs, or cloning and fetching Git-backed cards."
---

# share-harness-card

## Purpose

Manage producer-side sharing for Harness Cards: Git remotes, push/fetch/clone,
and catalog publication after a card is locally published and installable from a
Git remote.

Requires `drwn` and `git` on PATH. `gh` is optional and only needed when the
user asks to create or inspect GitHub repositories from the CLI. Scope is local
card store, configured Git remotes, and producer-side catalog entries. Blast
radius is medium because these commands mutate local bare card repos, may push
or fetch remote Git refs, and may update catalog manifests.

## Procedure

1. Verify `drwn` is installed with `drwn --version`. If it fails, halt and tell
   the user to install `drwn`.
2. Read store health with `drwn store status --json`. If legacy layout is
   detected, stop and redirect to `repair-harness`.
3. Disambiguate the user's intent:
   - Inspect remotes: `drwn card remote list <name> --json`
   - Create a GitHub repository for a card remote: `gh repo create`
   - Add a remote: `drwn card remote add <name> <url> [--name <remote>]`
   - Change a remote: `drwn card remote set <name> <url> [--name <remote>]`
   - Remove a remote: `drwn card remote remove <name> [--name <remote>]`
   - Push a local card: `drwn card push <name> [--remote <remote>]`
   - Publish an installable card to a catalog:
     `drwn card catalog publish <card-ref> --catalog <target> --mode <local|direct>`
   - Fetch a local card: `drwn card fetch <name> [--remote <remote>]`
   - Clone a Git-origin card: `drwn card clone <git-ref> --json`
4. For a local card operation, inspect the card first with
   `drwn card show <name> --json` or `drwn card list --json`.
5. For GitHub repository creation:
   1. Explain that `drwn` manages card remotes and pushes Git refs, but does
      not create hosted Git repositories.
   2. Run `gh auth status`. If it fails, ask the user to log in or provide an
      existing Git remote URL; do not attempt credential repair.
   3. Run `gh repo view <owner>/<repo> --json nameWithOwner,visibility,url,sshUrl`.
      If the repository exists, inspect it and confirm reuse before changing
      any card remote.
   4. If the repository does not exist and the user approves, run
      `gh repo create <owner>/<repo> --private` or `--public` according to the
      requested visibility.
   5. Verify with `gh repo view <owner>/<repo> --json nameWithOwner,visibility,url,sshUrl`.
6. For remote add, set, or remove:
   1. Run `drwn card remote list <name> --json` first.
   2. Explain the exact remote name and URL mutation. Remote commands do not
      have dry-run support.
   3. On approval, run the selected remote command.
   4. Verify with `drwn card remote list <name> --json`.
7. For push:
   1. Run `drwn card show <name> --json`.
   2. Run `drwn card remote list <name> --json`.
   3. Confirm the remote and that `drwn` will push `refs/heads/main` plus
      version tags.
   4. On approval, run `drwn card push <name> [--remote <remote>]`.
   5. Verify remote refs with `git ls-remote --heads --tags <url>` when the
      remote URL is available.
   6. For a stronger smoke test, clone the pushed version in an isolated
      temporary `HOME` with `drwn card clone git+<url>#v<version> --json`, then
      validate the imported card with `drwn card validate <name>@<version> --json`.
8. For catalog publish:
   1. Confirm the exact card ref, including version, such as
      `@team/backend@1.0.0`.
   2. Run `drwn card show <card-ref> --json`.
   3. Run `drwn card remote list <card-name> --json`.
   4. If the card has not been pushed to an installable Git remote, complete the
      push procedure first.
   5. Resolve the catalog target: registered scope such as `@community`, Git URL,
      or local catalog checkout path.
   6. Use `--mode local` to edit a local catalog checkout without commit or push.
      Use `--mode direct` only when the catalog target should be committed and
      pushed by `drwn`.
   7. For public catalogs, prefer an explicit HTTPS install URL with
      `--url 'git+https://github.com/<owner>/<repo>.git#v<version>'` instead of
      letting `drwn` infer an SSH URL from the card remote.
   8. Run `drwn card catalog publish <card-ref> --catalog <target> --mode <local|direct> [--url <install-url>] [--tag <tag>] --dry-run --json`.
   9. Summarize the planned catalog scope, entry name, install URL, description,
      tags, action, warnings, and whether `--replace` is required.
   10. On approval, run the same command without `--dry-run`. Use `--replace` only
      after the user explicitly confirms replacing an existing catalog entry.
   11. Verify with `drwn library catalog refresh <scope>` and
       `drwn search card <entry-name> --scope <scope> --json` when a scope is
       known.
   12. For a public catalog smoke test, use an isolated temporary `AGENTS_DIR` to
       run `drwn library catalog add <catalog-url>`, search the entry, and
       `drwn card clone <entry-url> --json`.
9. For fetch:
   1. Run `drwn card remote list <name> --json`.
   2. Explain that fetch mutates the local bare card repo but does not apply the
      card to any project.
   3. On approval, run `drwn card fetch <name> [--remote <remote>]`.
   4. Verify with `drwn card show <name> --json` or `drwn card list --json`.
10. For clone:
    1. Confirm the exact `git+`, `github:`, or `gitlab:` card ref.
       Git refs require an explicit selector such as `#v0.1.0` or `@^0.1.0`.
    2. Explain that clone resolves the Git ref, imports the card into the local
       store, extracts the selected tree, and records the origin URL.
    3. On approval, run `drwn card clone <git-ref> --json`.
    4. Verify the returned or requested ref with `drwn card validate <ref> --json`.
11. If the user wants to apply the shared card to the current project, stop and
   redirect to `apply-harness-card`.

## User-Ask Points

1. Confirm GitHub repository creation, owner/name, and visibility.
2. Confirm remote add, set, and remove mutations.
3. Confirm every push target before writing to a remote.
4. Confirm catalog target, publish mode, and explicit install URL before
   publishing to a catalog.
5. Confirm `--replace` before replacing an existing catalog entry.
6. Confirm every fetch or clone before mutating the local card store.
7. Confirm handoff to `apply-harness-card` before changing project card state.

## Wraps

`drwn --version`, `drwn store status --json`, `drwn card list --json`,
`drwn card show --json`, `drwn card remote list --json`,
`drwn card remote add`, `drwn card remote set`, `drwn card remote remove`,
`drwn card push`, `drwn card catalog publish --dry-run --json`,
`drwn card catalog publish`, `drwn library catalog refresh`,
`drwn search card --json`, `drwn card fetch`, `drwn card clone --json`,
`drwn card validate --json`, `drwn library catalog add`, `gh auth status`,
`gh repo view`, `gh repo create`, `git ls-remote`

## Scope

Local card store, Git card remotes, and producer-side catalog entries. This
skill does not change project card refs or downstream generated files, and it
does not manage a user's normal catalog inventory except when verifying a
published entry.

## Failure Modes

- Card is not published locally: redirect to `author-harness-card` to publish
  before sharing.
- Card has no installable Git remote: add or push a remote first, or pass an
  explicit `--url` when publishing the catalog entry.
- Inferred catalog URL is SSH but the catalog is public: prefer an explicit
  HTTPS `--url` so consumers without matching SSH credentials can install it.
- Catalog duplicate entry: require explicit `--replace` approval.
- Direct catalog publish reports a dirty catalog worktree: surface the `drwn`
  error and stop.
- Catalog entry scope differs from the card manifest scope: explain whether the
  warning is expected, such as `@community/name` pointing to `@author/name`.
- GitHub CLI unavailable or not logged in: ask the user to authenticate with
  `gh auth login` or provide an existing Git remote URL.
- GitHub repository already exists: inspect and confirm reuse before setting it
  as a card remote.
- Git authentication failure: surface the Git error and do not retry with
  altered credentials.
- Network failure: surface the fetch or push failure and stop.
- Card name collision or mismatch: surface the `drwn` error because the local
  store binding needs deliberate repair.
- Fresh-consumer clone fails: surface the install URL error and do not substitute
  local store state for public verification.
- User wants project application after clone: redirect to `apply-harness-card`.

## Related Skills

- `author-harness-card`
- `apply-harness-card`
- `install-harness-project`
- `manage-harness-library`
- `repair-harness`
