---
name: share-harness-card
description: "Use when sharing Darwinian Harness Cards through Git remotes, or cloning and fetching Git-backed cards."
---

# share-harness-card

## Purpose

Manage the Git-backed sharing layer for Harness Cards. Use this after a card is
published locally and needs to be pushed to a team remote, or when importing,
fetching, or inspecting a Git-origin card from another machine.

Requires `drwn` and `git` on PATH. `gh` is optional and only needed when the
user asks to create or inspect GitHub repositories from the CLI. Scope is local
card store plus the configured Git remote. Blast radius is medium because these
commands mutate local bare card repos and may push or fetch remote Git refs.

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
   - Fetch a local card: `drwn card fetch <name> [--remote <remote>]`
   - Clone a Git-origin card: `drwn card clone <git-ref> --json`
4. For a local card operation, inspect the card first with
   `drwn card show <name> --json` or `drwn card list --json`.
5. For GitHub repository creation:
   1. Explain that `drwn` manages card remotes and pushes Git refs, but does
      not create hosted Git repositories.
   2. Run `gh auth status`. If it fails, ask the user to log in or provide an
      existing Git remote URL; do not attempt credential repair.
   3. Derive the default `<owner>/<repo>` from the card ref: owner is the scope
      without `@` (e.g. `@jgb` → `jgb`; fallback to `gh api user --jq .login`
      if the scope is not a valid GitHub user or org); repo name is the bare
      card name (e.g. `@jgb/test2` → `test2`). Confirm with the user via
      `AskUserQuestion` before proceeding.
   4. Run `gh repo view <owner>/<repo> --json nameWithOwner,visibility,url,sshUrl`.
      If the repository exists, inspect it and confirm reuse before changing
      any card remote.
   5. If the repository does not exist and the user approves, run
      `gh repo create <owner>/<repo> --private` or `--public` according to the
      requested visibility.
   6. Verify with `gh repo view <owner>/<repo> --json nameWithOwner,visibility,url,sshUrl`.
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
8. For fetch:
   1. Run `drwn card remote list <name> --json`.
   2. Explain that fetch mutates the local bare card repo but does not apply the
      card to any project.
   3. On approval, run `drwn card fetch <name> [--remote <remote>]`.
   4. Verify with `drwn card show <name> --json` or `drwn card list --json`.
9. For clone:
   1. Confirm the exact `git+`, `github:`, or `gitlab:` card ref.
      Git refs require an explicit selector such as `#v0.1.0` or `@^0.1.0`.
   2. Explain that clone resolves the Git ref, imports the card into the local
      store, extracts the selected tree, and records the origin URL.
   3. On approval, run `drwn card clone <git-ref> --json`.
   4. Verify the returned or requested ref with `drwn card validate <ref> --json`.
10. If the user wants to apply the shared card to the current project, stop and
   redirect to `apply-harness-card`.

## User-Ask Points

1. Confirm GitHub repository creation, owner/name, and visibility.
2. Confirm remote add, set, and remove mutations.
3. Confirm every push target before writing to a remote.
4. Confirm every fetch or clone before mutating the local card store.
5. Confirm handoff to `apply-harness-card` before changing project card state.

## Wraps

`drwn --version`, `drwn store status --json`, `drwn card list --json`,
`drwn card show --json`, `drwn card remote list --json`,
`drwn card remote add`, `drwn card remote set`, `drwn card remote remove`,
`drwn card push`, `drwn card fetch`, `drwn card clone --json`,
`drwn card validate --json`, `gh auth status`, `gh api user --jq .login`,
`gh repo view`, `gh repo create`, `git ls-remote`

## Scope

Local card store and Git remotes. This skill does not change project card refs
or downstream generated files.

## Failure Modes

- Card is not published locally: redirect to `author-harness-card` to publish
  before sharing.
- GitHub CLI unavailable or not logged in: ask the user to authenticate with
  `gh auth login` or provide an existing Git remote URL.
- GitHub repository already exists: inspect and confirm reuse before setting it
  as a card remote.
- Git authentication failure: surface the Git error and do not retry with
  altered credentials.
- Network failure: surface the fetch or push failure and stop.
- Card name collision or mismatch: surface the `drwn` error because the local
  store binding needs deliberate repair.
- User wants project application after clone: redirect to `apply-harness-card`.

## Related Skills

- `author-harness-card`
- `apply-harness-card`
- `install-harness-project`
- `repair-harness`
