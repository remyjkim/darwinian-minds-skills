---
name: author-mind-card
description: "Use when creating, editing, publishing, diffing, inspecting, or deprecating reusable Mind Cards for Darwinian Minds from a local card source."
---

# author-mind-card

## Purpose

Drive the card authoring lifecycle. `drwn card new` creates an editable source
under `~/.agents/drwn/sources/<scope>/<name>/`; `drwn card source ...`
inspects and mutates that source; `drwn card publish` snapshots it into the
immutable local card store. Published-card commands such as `card show`,
`card diff`, `card validate`, and `card deprecate` operate on released refs.

Requires `drwn` on PATH. Scope is card source. Blast radius is medium because
this skill creates source folders, publishes immutable versions, and can mark
versions deprecated.

## Procedure

1. Verify the installed CLI before mutation:
   1. Run `command -v drwn` and `drwn --version`.
   2. Run `drwn status --json` when the task depends on current repo or store
      state.
   3. Prefer the installed `drwn` binary over repo-local dev invocations unless
      the user is explicitly testing unreleased CLI changes.
2. Disambiguate the user's intent:
   - Create a new source: `drwn card new`
   - Inspect an editable source: `drwn card source show --json`
   - Diagnose an editable source: `drwn card source doctor --json`
   - Add or remove bundled skills: `drwn card source add-skill` or
     `drwn card source remove-skill`
   - Add or remove bundled MCP definitions: `drwn card source add-mcp` or
     `drwn card source remove-mcp`
   - Add or remove bundled hook policies: `drwn card source add-hook` or
     `drwn card source remove-hook`
   - Add or remove persona, beliefs, or memory: use `author-mind-content`
   - Update source metadata: `drwn card source set`
   - Capture the current project as a source: `drwn card new --from-project`
   - Publish a source: `drwn card publish`
   - Inspect a published card: `drwn card show --json`
   - Compare versions: `drwn card diff --json`
   - Validate a ref: `drwn card validate --json`
   - Deprecate a version: `drwn card deprecate`
3. For `card new`:
   1. Confirm the desired card name.
   2. If the name is unscoped, let `drwn card new` resolve a default scope
      itself rather than pre-probing on the agent side. The CLI probes
      `gh api user -q .login`, then `git config --global github.user`, then
      the local-part of `git config --global user.email`, and either prompts
      the user in a TTY or (in the non-TTY contexts typical of agent
      invocations) exits with a hint naming the detected handle so the
      caller can rerun with `--scope @<handle>`.
      1. Run `drwn card new <name> [--no-git]` and capture stderr.
      2. If stderr contains a `Detected @<handle>` hint, use
         `AskUserQuestion` to confirm the suggested handle (or let the user
         supply a different `@<scope>`), then rerun with
         `--scope @<handle> [--no-git]`. The `--scope` value must include
         the `@` prefix (e.g. `@acme`); `drwn` rejects bare names.
      3. If stderr says no handle could be derived from `gh` or `git config`,
         use `AskUserQuestion` to ask the user for an explicit
         `--scope=@<scope>`. Never propose `@me`: it collides across users
         in shared marketplaces.
      4. If `machine.authoring.scope` is already saved from a previous
         `drwn card new`, the CLI uses it silently — no rerun is needed.
   3. Run `drwn card source show @<scope>/<name> --json` and summarize the
      created source path and skeleton files. Always pass the fully-qualified
      name `@<scope>/<name>` — bare names are not resolved by `card source show`.
   4. Use `AskUserQuestion` to ask how README content should be sourced.
      Always offer all three options regardless of whether skills are bundled:
      - **Auto-generate** — read each bundled skill's `SKILL.md` and derive
        the value proposition, capabilities, and audience. Present the draft
        for confirmation before writing. On a fresh `drwn card new` there
        are no bundled skills yet; in that case inform the user and ask
        them to add skills first via `drwn card source add-skill` or switch
        to manual entry.
      - **Enter manually** — collect value proposition, 2–3 capabilities,
        audience, and license in a single `AskUserQuestion` prompt.
      - **Skip for now** — write the README later after bundling skills.
      Populate "What's included" from `bundledSkills` and `mcpServers` in
      `drwn card source show --json`. Write the completed README to
      `~/.agents/drwn/sources/<scope>/<name>/README.md` using the template
      in `references/readme-template.md`.
4. For source inspection, run `drwn card source show <name> --json`.
5. For source diagnostics, run `drwn card source doctor [name] --json`.
   Treat `ok: false` as reportable source work, not a command failure.
6. For `card new --from-project`:
   1. Run `drwn status --json` to confirm the source project state.
   2. Confirm the target card name and scope.
   3. Explain that `drwn` will copy active skill content and MCP definitions
      into a mutable source under `~/.agents/drwn/sources/...`.
   4. On approval, run
      `drwn card new <name> --from-project [projectPath] [--scope <scope>]`.
   5. Run `drwn card source doctor <name> --json`.
7. For adding a bundled skill:
   1. Resolve whether the skill should come from the local library/repo by
      name or from an explicit `SKILL.md` file or skill directory with
      `--from <path>`.
   2. Run `drwn card source add-skill <card> <skill> [--from <path>] --dry-run --json`.
   3. Show the planned copy and manifest change.
   4. On approval, run the same command without `--dry-run`. Use `--replace`
      only after confirming overwrite intent.
8. For removing a bundled skill:
   1. Run `drwn card source remove-skill <card> <skill> --dry-run --json`.
   2. Show whether files and the manifest entry will be removed.
   3. On approval, run the same command without `--dry-run`. Use
      `--keep-files` only when the user wants a manifest-only removal.
9. For adding or removing MCP definitions, follow the same dry-run, summarize,
   approve, execute pattern with `drwn card source add-mcp` and
   `drwn card source remove-mcp`. Use `--from <json-file>` for explicit MCP
   definition files and `--replace` only after confirming overwrite intent.
   A hosted HTTP server may include a `headers` map to authenticate (drwn ≥ 0.6.0),
   e.g. `"headers": { "Authorization": "Bearer ${FAL_KEY}" }` — always reference the
   secret as `${ENV_VAR}`, never a literal token.
10. For adding a hook policy:
    1. Confirm the hook policy name and intended role.
    2. Run `drwn card source add-hook <card> <hook> --dry-run --json`.
    3. Explain that this scaffolds `hooks/<hook>/policy.ts` as an observer by
       default and declares it in `card.json hooks.include`.
    4. On approval, run the same command without `--dry-run`.
    5. After editing policy code, run `drwn card source doctor <card> --json`
       to validate that the policy module builds.
11. For removing a hook policy:
    1. Run `drwn card source remove-hook <card> <hook> --dry-run --json`.
    2. Show whether files and the manifest entry will be removed.
    3. On approval, run the same command without `--dry-run`. Use
       `--keep-files` only when the user wants a manifest-only removal.
12. For persona, beliefs, or memory content, hand off to
    `author-mind-content`. That skill owns `add-persona`, `remove-persona`,
    `add-belief`, `remove-belief`, `add-memory`, `remove-memory --layer`, and
    `--keep-files` decisions.
13. For source metadata, run `drwn card source set <card> ... --dry-run --json`
   first, then apply after approval. Supported fields include description,
   version, license, harness min version, stability, last validated version,
   and test status badge. `--last-validated-with` must be strict semver such
   as `0.1.0`; do not include package names or prose in that field.
14. For `card publish`:
    1. Run `drwn card source doctor <name> --json`.
    2. If `ok` is false, summarize the issues and stop before publishing.
    3. Run `drwn card source show <name> --json` and confirm the card name and
       version declared in the source manifest.
    4. If hooks are declared, tell the user consumers must grant hook consent
       with `drwn card trust <card> --hooks` before `drwn write` materializes
       those hooks.
    5. On approval, run `drwn card publish <name>`.
    6. Verify the published ref with `drwn card validate <name>@<version> --json`.
    7. Run `drwn card show <name>@<version> --json` and summarize the
       published name, version, integrity, bundled skill count, and server
       count. Include any `hookPolicies` in the summary.
15. For `card show`, run `drwn card show <ref> --json`.
16. For `card diff`, run `drwn card diff <before> <after> --json`; hook
    additions and removals are structural changes.
17. For `card deprecate`:
    1. Confirm the exact version and message.
    2. Run `drwn card deprecate <ref> --message "<reason>"`.
18. If the user asks to push, fetch, clone, create a GitHub repository, manage
    card remotes, or publish the card to a catalog, complete local publish and
    validation first, then continue with `share-mind-card`. Local publish
    does not require GitHub auth; remote creation, push, and direct catalog
    publication require credentials with the necessary write access.

## User-Ask Points

Use the `AskUserQuestion` tool at every point below so the user can respond
with clickable options rather than typing from scratch. Never ask multiple
separate questions sequentially when they can be batched into one prompt.

1. Confirm card name and scope for `card new`. When the CLI's first run
   surfaces a `Detected @<handle>` hint, confirm the suggested handle (or
   accept an override) before rerunning with `--scope @<handle>`.
2. Choose README content source: auto-generate from bundled skills or enter
   manually.
3. Confirm auto-generated README draft before writing, or trigger manual entry.
4. Confirm project capture before `card new --from-project`.
5. Confirm every non-dry-run source mutation after reviewing the dry-run JSON.
6. Confirm hook policy scaffold/removal and any post-scaffold policy editing
   expectations.
7. Confirm `--replace`, `--keep-files`, and deprecation message choices.
8. Confirm publish target and immutable version before `drwn card publish`.
9. Confirm handoff to `share-mind-card` before remote creation or push.
10. Confirm deprecation target and message before `drwn card deprecate`.

## Wraps

`command -v drwn`, `drwn --version`, `drwn status --json`, `drwn card new`,
`drwn card new --from-project`, `drwn card source list`,
`drwn card source show --json`, `drwn card source doctor --json`,
`drwn card source add-skill --dry-run --json`,
`drwn card source add-skill`, `drwn card source remove-skill --dry-run --json`,
`drwn card source remove-skill`, `drwn card source set --dry-run --json`,
`drwn card source set`, `drwn card source add-mcp --dry-run --json`,
`drwn card source add-mcp`, `drwn card source remove-mcp --dry-run --json`,
`drwn card source remove-mcp`, `drwn card source add-hook --dry-run --json`,
`drwn card source add-hook`, `drwn card source remove-hook --dry-run --json`,
`drwn card source remove-hook`, `drwn card publish`,
`drwn card show --json`, `drwn card diff --json`,
`drwn card validate --json`, `drwn card deprecate`

## Scope

Card source and local immutable store. Git remotes, GitHub repository creation,
push, fetch, clone, and catalog publication belong to `share-mind-card`.

## Failure Modes

- Unscoped name without scope: read the CLI's stderr from the first
  `drwn card new` run. If it contains `Detected @<handle>`, confirm with the
  user and rerun with `--scope @<handle>`. If it says no handle could be
  derived, ask the user for an explicit `--scope=@<scope>`. The scope value
  passed to `drwn` must include the `@` prefix (e.g. `--scope @acme`); bare
  names are rejected. Never propose `@me` — it collides across users in
  shared marketplaces.
- Existing version on publish: use `drwn card source set <name> --version ...`
  to bump the source version first.
- Project capture finds unresolved effective state: repair or materialize the
  source project before capturing.
- Invalid source `card.json`: surface the source doctor or source show error
  verbatim.
- Duplicate bundled skill or MCP server: rerun with `--replace` only after the
  user confirms overwrite intent.
- Invalid hook policy module: surface `card source doctor` issues and repair
  `hooks/<name>/policy.ts` before publishing.
- Invalid `lastValidatedWith`: rerun `drwn card source set` with a strict semver
  value such as `0.1.0`.
- User asks to push, publish to a catalog, or create a GitHub repository: finish
  local publish validation, then use `share-mind-card`.
- `DRWN_STORE_READONLY=1`: inspection and dry-run commands can still run, but
  real source mutations and publish commands must stop before writing.

## Related Skills

- `apply-mind-card`
- `inspect-harness`
- `author-mind-content`
- `manage-defaults`
- `share-mind-card`
