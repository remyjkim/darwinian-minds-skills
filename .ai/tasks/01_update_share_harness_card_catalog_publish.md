# Update `share-harness-card` for Catalog Publication

**Date**: 2026-06-04  
**Target repo**: `~/dev/darwinian-harness-skills`  
**Reference CLI repo**: `~/dev/darwinian-harness`  
**Target skill**: `skills/share-harness-card/SKILL.md`  
**Purpose**: Extend the existing card-sharing skill so it clearly owns producer-side
catalog publication with `drwn card catalog publish`.

## Executive Summary

`share-harness-card` currently owns Git-backed card sharing: remotes, push,
fetch, and clone. That is the right home for `drwn card catalog publish`, because
catalog publication is the final producer-side sharing step after a card has
been published locally and pushed to an installable Git remote.

The update should be scoped and explicit. `author-harness-card` should continue
to own local source authoring and `drwn card publish`. `manage-harness-library`
should continue to own consumer-side catalog registration, refresh, and removal.
`share-harness-card` should own the bridge from "this card is pushed to a Git
remote" to "this card is discoverable in a catalog".

## Current Gap

Current lifecycle coverage:

| Workflow | Current owner | Status |
| --- | --- | --- |
| Create/edit card source | `author-harness-card` | Covered |
| Publish immutable local card | `author-harness-card` | Covered |
| Add/set/remove card remotes | `share-harness-card` | Covered |
| Push card refs to Git remote | `share-harness-card` | Covered |
| Clone/fetch Git-origin cards | `share-harness-card` | Covered |
| Register/refresh/remove catalogs locally | `manage-harness-library` | Covered |
| Publish card entry into a catalog | None explicit | Missing |

The missing command is:

```bash
drwn card catalog publish <card-ref> --catalog <target> --mode <local|direct>
```

## Desired Ownership Boundary

After the update:

```text
author-harness-card     -> source lifecycle and immutable local release
share-harness-card      -> remotes, push/fetch/clone, and catalog publication
manage-harness-library  -> local catalog inventory and consumer discovery setup
```

This preserves a useful distinction:

- `drwn card publish` releases a versioned card artifact into the local store.
- `drwn card push` makes that released card installable from a Git remote.
- `drwn card catalog publish` makes that installable card discoverable through a
  catalog manifest.

## Non-Goals

- Do not move local card source authoring into `share-harness-card`.
- Do not make `share-harness-card` responsible for applying cards to projects.
- Do not make `share-harness-card` responsible for normal catalog registration,
  refresh, or removal on a consumer machine.
- Do not instruct agents to manually edit `catalog.json`, run `git add`, run
  `git commit`, or run `git push` for normal catalog publication. Use the `drwn`
  catalog publishing command.
- Do not add a new skill unless review shows the updated trigger description
  becomes too broad or ambiguous.

## Proposed Skill Changes

### 1. Frontmatter Description

Update the description so the skill triggers for catalog publication:

Current:

```yaml
description: "Use when sharing Darwinian Harness Cards through Git remotes, or cloning and fetching Git-backed cards."
```

Proposed:

```yaml
description: "Use when sharing Darwinian Harness Cards through Git remotes, publishing cards to catalogs, or cloning and fetching Git-backed cards."
```

### 2. Purpose

Expand the purpose from Git-backed sharing only to Git-backed sharing plus
catalog discoverability. Keep the blast radius medium, but mention catalog
manifests and remote pushes.

Suggested intent:

```text
Manage producer-side sharing for Harness Cards: Git remotes, push/fetch/clone,
and catalog publication after a card is locally published and installable from a
Git remote.
```

### 3. Procedure Disambiguation

Add one bullet to the intent list:

```text
- Publish an installable card to a catalog:
  `drwn card catalog publish <card-ref> --catalog <target> --mode <local|direct>`
```

### 4. Catalog Publish Procedure

Add a dedicated procedure section after the push procedure and before fetch or
clone. Recommended steps:

1. Confirm the exact card ref including version, for example
   `@team/backend@1.0.0`.
2. Inspect the published card:

   ```bash
   drwn card show <card-ref> --json
   ```

3. Inspect the card remote:

   ```bash
   drwn card remote list <card-name> --json
   ```

4. If the card has not been pushed, complete the push procedure first.
5. Resolve the catalog target:
   - registered scope such as `@community`
   - Git URL such as `https://github.com/org/catalog.git`
   - local checkout path such as `/path/to/catalog`
6. Prefer an explicit public HTTPS install URL for public catalogs:

   ```bash
   --url 'git+https://github.com/<owner>/<repo>.git#v<version>'
   ```

   This avoids publishing an SSH install URL that only works for users with
   matching GitHub SSH credentials.
7. Run a dry run:

   ```bash
   drwn card catalog publish <card-ref> \
     --catalog <target> \
     --mode <local|direct> \
     --url '<install-url>' \
     --dry-run \
     --json
   ```

8. Summarize the planned entry: catalog scope, entry name, install URL,
   description, tags, action, warnings, and duplicate behavior.
9. Require explicit approval before:
   - using `--replace`
   - publishing to a public catalog
   - using `--mode direct`
10. Run the real command:

    ```bash
    drwn card catalog publish <card-ref> \
      --catalog <target> \
      --mode direct \
      --url '<install-url>' \
      --tag <tag> \
      --json
    ```

11. Verify catalog discoverability:

    ```bash
    drwn library catalog refresh <scope>
    drwn search card <entry-name> --scope <scope> --json
    ```

12. For a public catalog smoke test, use an isolated store if practical:

    ```bash
    AGENTS_DIR=<tmp-agents-dir> drwn library catalog add <catalog-url>
    AGENTS_DIR=<tmp-agents-dir> drwn search card <entry-name> --scope <scope> --json
    AGENTS_DIR=<tmp-agents-dir> drwn card clone '<entry-url>' --json
    ```

### 5. User-Ask Points

Add catalog-specific approvals:

- Confirm catalog target and publish mode before a non-dry-run catalog publish.
- Confirm explicit install URL, especially when overriding an inferred SSH URL
  with an HTTPS URL.
- Confirm `--replace` before replacing an existing catalog entry.
- Confirm public catalog publication before `--mode direct`.

### 6. Wraps

Add:

```text
drwn card catalog publish --dry-run --json
drwn card catalog publish
drwn library catalog refresh
drwn search card --json
```

Keep `git ls-remote` as an optional verification command for remote refs.

### 7. Scope

Update the scope language from "local card store and Git remotes" to include
catalog manifests:

```text
Local card store, Git card remotes, and producer-side catalog entries. This
skill does not change project card refs or downstream generated files, and it
does not manage a user's normal catalog inventory except when verifying a
published entry.
```

### 8. Failure Modes

Add catalog-specific failure modes:

- Card is not published locally: redirect to `author-harness-card`.
- Card has no installable Git remote: add/push a remote first or pass an
  explicit `--url`.
- Inferred URL is SSH for a public catalog: prefer explicit HTTPS `--url`.
- Catalog duplicate entry: require explicit `--replace`.
- Direct catalog publish fails because the catalog worktree is dirty: stop and
  surface the `drwn` error.
- Catalog entry scope differs from the manifest scope: explain whether the
  warning is expected, such as `@community/name` pointing to
  `@author/name`.
- Fresh-consumer clone fails: surface the install URL error and do not paper over
  it with local store state.

## Validation Plan

After editing the canonical skill:

```bash
npm run sync:cards
npm run lint:md
npm run validate:skills
```

Then verify the bundled copy stayed aligned:

```bash
diff -u \
  skills/share-harness-card/SKILL.md \
  cards/harness-skills/skills/share-harness-card/SKILL.md
```

Optional CLI surface checks from `~/dev/darwinian-harness`:

```bash
drwn card catalog publish --help
drwn library catalog refresh --help
drwn search card --help
```

## Acceptance Criteria

- `share-harness-card` clearly triggers for user asks such as "publish this
  card to the public catalog" or "add this pushed card to the community catalog".
- The skill explains that `drwn card catalog publish` is distinct from
  `drwn card publish`.
- The procedure requires a dry run before writing to a catalog.
- The procedure prefers explicit HTTPS install URLs for public catalogs.
- The procedure uses `drwn card catalog publish` for normal catalog writes,
  rather than manual JSON or Git commands.
- The skill documents duplicate and `--replace` handling.
- The skill documents `--mode local` versus `--mode direct`.
- The skill keeps consumer-side catalog registration and removal delegated to
  `manage-harness-library`, except for verification.
- `npm run sync:cards`, `npm run lint:md`, and `npm run validate:skills` pass.

## Implementation Notes

Keep the skill concise. The update should add enough guardrails for reliable
catalog publishing without turning `share-harness-card` into a full CLI manual.
Prefer short procedural bullets and concrete command shapes.

If the edited skill grows too long, consider a separate future skill for catalog
publication. For now, extending `share-harness-card` is the smaller and clearer
change because catalog publication depends directly on the remote/push workflow
that skill already owns.
