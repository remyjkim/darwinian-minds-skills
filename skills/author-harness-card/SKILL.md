---
name: author-harness-card
description: "Use when creating, editing, publishing, diffing, inspecting, or deprecating reusable Darwinian Harness Cards from a local card source."
---

# author-harness-card

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
   - Update source metadata: `drwn card source set`
   - Capture the current project as a source: `drwn card new --from-project`
   - Publish a source: `drwn card publish`
   - Inspect a published card: `drwn card show --json`
   - Compare versions: `drwn card diff --json`
   - Validate a ref: `drwn card validate --json`
   - Deprecate a version: `drwn card deprecate`
3. For `card new`:
   1. Confirm the desired card name.
   2. If the name is unscoped, resolve a default scope from the authenticated
      GitHub identity:
      1. Run `gh api user --jq .login`. If it succeeds, propose
         `@<login>/<name>` as the default scope so the card namespace matches
         the author's GitHub account and avoids future marketplace conflicts.
      2. If `gh` is unavailable or returns an error, ask the user to provide
         an explicit `--scope=@<scope>`. Do not fall back to `@me` as a scope
         because `@me` collides across users in a shared marketplace.
   3. On approval, run `drwn card new <name> --scope @<login> [--no-git]`.
      The `--scope` value must include the `@` prefix (e.g. `@junggyubae`);
      `drwn` rejects bare usernames without it.
   4. Run `drwn card source show @<login>/<name> --json` and summarize the
      created source path and skeleton files. Always pass the fully-qualified
      name `@<scope>/<name>` — bare names are not resolved by `card source show`.
   5. Before generating the README, use `AskUserQuestion` to ask how the
      content should be sourced — present two options:
      - **Auto-generate** — read each bundled skill's `SKILL.md` (from
        `~/.agents/drwn/sources/<scope>/<name>/skills/<skill>/SKILL.md`) and
        derive the value proposition, capabilities, and audience from the
        skill descriptions and purpose sections. Present the drafted content
        to the user for confirmation or editing before writing the file.
        If no skills are bundled yet, fall back to asking the user directly.
      - **Enter manually** — use `AskUserQuestion` to collect the following
        fields in a single prompt (never ask one field at a time):
        - One-sentence value proposition
        - 2–3 capability bullet points
        - Who it is recommended for
        - License (offer common choices: MIT, Apache-2.0, Proprietary, Other)
      Populate the "What's included" table from the `bundledSkills` and
      `mcpServers` arrays in `drwn card source show --json`; omit the
      placeholder row when at least one real entry exists.
      Then generate a `README.md` in the created source folder
      (`~/.agents/drwn/sources/<scope>/<name>/README.md`) using the template
      below with all fields filled in. Use `AskUserQuestion` at every
      decision point that requires user input so the user can respond with
      clickable options rather than typing from scratch.

      ````markdown
      # <name>

      > <one-sentence value proposition>

      ## What it does

      - <capability 1>
      - <capability 2>

      ## Recommended for users who...

      - <user profile or context>

      ## What's included

      | Asset | Purpose |
      |---|---|
      | `SKILL.md` | Agent-facing instructions |
      | _(add rows as you bundle skills and MCPs)_ | |

      ## Installation

      Clone the card to your local store:

      ```sh
      drwn card clone github:<owner>/<name>#v<version>
      ```

      Apply to your project:

      ```sh
      drwn card apply <scope>/<name>@<version>
      ```

      ## Versions

      | Version | Notes |
      |---|---|
      | v0.1.0 | Initial release |

      ## Requirements

      - [`drwn`](https://darwiniantools.com) CLI installed

      ## License

      <license>

      ---

      See the [Darwinian Tools documentation](https://docs.darwiniantools.com) for more information on drwn harness cards, installation, version pinning, and project configuration.
      ````
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
      name or from an explicit directory with `--from <path>`.
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
10. For source metadata, run `drwn card source set <card> ... --dry-run --json`
   first, then apply after approval. Supported fields include description,
   version, license, harness min version, stability, last validated version,
   and test status badge. `--last-validated-with` must be strict semver such
   as `0.1.0`; do not include package names or prose in that field.
11. For `card publish`:
    1. Run `drwn card source doctor <name> --json`.
    2. If `ok` is false, summarize the issues and stop before publishing.
    3. Run `drwn card source show <name> --json` and confirm the card name and
       version declared in the source manifest.
    4. On approval, run `drwn card publish <name>`.
    5. Verify the published ref with `drwn card validate <name>@<version> --json`.
    6. Run `drwn card show <name>@<version> --json` and summarize the
       published name, version, integrity, bundled skill count, and server
       count.
12. For `card show`, run `drwn card show <ref> --json`.
13. For `card diff`, run `drwn card diff <before> <after> --json`.
14. For `card deprecate`:
    1. Confirm the exact version and message.
    2. Run `drwn card deprecate <ref> --message "<reason>"`.
15. If the user asks to push, fetch, clone, create a GitHub repository, or
    manage card remotes, complete local publish and validation first, then
    continue with `share-harness-card`. Local publish does not require GitHub
    auth; remote creation and push require Git credentials with the necessary
    write access.

## User-Ask Points

Use the `AskUserQuestion` tool at every point below so the user can respond
with clickable options rather than typing from scratch. Never ask multiple
separate questions sequentially when they can be batched into one prompt.

1. Confirm card name and scope for `card new`; when a GitHub username is
   resolved automatically, confirm the proposed `@<login>/<name>` scope before
   running `drwn card new`.
2. Choose README content source: auto-generate from bundled skills or enter
   manually.
3. Confirm auto-generated README draft before writing, or trigger manual entry.
4. Confirm project capture before `card new --from-project`.
5. Confirm every non-dry-run source mutation after reviewing the dry-run JSON.
6. Confirm `--replace`, `--keep-files`, and deprecation message choices.
7. Confirm publish target and immutable version before `drwn card publish`.
8. Confirm handoff to `share-harness-card` before remote creation or push.
9. Confirm deprecation target and message before `drwn card deprecate`.

## Wraps

`command -v drwn`, `drwn --version`, `drwn status --json`, `gh api user --jq .login`, `drwn card new`,
`drwn card new --from-project`, `drwn card source list`,
`drwn card source show --json`, `drwn card source doctor --json`,
`drwn card source add-skill --dry-run --json`,
`drwn card source add-skill`, `drwn card source remove-skill --dry-run --json`,
`drwn card source remove-skill`, `drwn card source set --dry-run --json`,
`drwn card source set`, `drwn card source add-mcp --dry-run --json`,
`drwn card source add-mcp`, `drwn card source remove-mcp --dry-run --json`,
`drwn card source remove-mcp`, `drwn card publish`, `drwn card show --json`,
`drwn card diff --json`, `drwn card validate --json`, `drwn card deprecate`

## Scope

Card source and local immutable store. Git remotes, GitHub repository creation,
push, fetch, and clone belong to `share-harness-card`.

## Failure Modes

- Unscoped name without scope: attempt to resolve via `gh api user --jq .login`
  and propose `@<login>/<name>`; if `gh` is unavailable or not authenticated,
  ask the user for an explicit `--scope`. The scope value passed to `drwn` must
  include the `@` prefix (e.g. `--scope @username`); bare names are rejected.
  Never default to `@me`.
- `gh api user` fails mid-flow: fall back to asking the user for a scope; do
  not block the rest of the `card new` steps.
- Existing version on publish: use `drwn card source set <name> --version ...`
  to bump the source version first.
- Project capture finds unresolved effective state: repair or materialize the
  source project before capturing.
- Invalid source `card.json`: surface the source doctor or source show error
  verbatim.
- Duplicate bundled skill or MCP server: rerun with `--replace` only after the
  user confirms overwrite intent.
- Invalid `lastValidatedWith`: rerun `drwn card source set` with a strict semver
  value such as `0.1.0`.
- User asks to push or create a GitHub repository: finish local publish
  validation, then use `share-harness-card`.
- `DRWN_STORE_READONLY=1`: inspection and dry-run commands can still run, but
  real source mutations and publish commands must stop before writing.

## Related Skills

- `apply-harness-card`
- `inspect-harness`
- `manage-defaults`
- `share-harness-card`
