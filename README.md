# Darwinian Harness Skills

Agent skills wrapping the `drwn` CLI for Claude Code, Codex, Cursor, and other
agentic environments. This repo ships twelve current-lane skills for project
bootstrap, cloned-project install, downstream materialization, cards, library,
defaults, diagnostics, support, repair, and recommendations, plus one
future-lane stub for workspace organization.

Distributed via Claude Code plugin marketplace, Codex plugin / skill install
surfaces, Vercel `npx skills add`, and the `drwn` package-backed skill bundle
flow.

## What's In This Repo

| Skill | Purpose | Scope | Blast radius |
| --- | --- | --- | --- |
| `bootstrap-project` | Initialize a per-repo harness, enable extensions, apply starter cards | project | medium |
| `apply-harness-card` | Apply, pin, update, remove, detach, inspect Harness Cards | project | medium |
| `author-harness-card` | Create, publish, diff, deprecate reusable cards | card source | medium |
| `install-harness-project` | Bootstrap a cloned project from locked cards | project + store | medium |
| `inspect-harness` | Read-only inspection of state and provenance | project | none |
| `materialize-harness` | Activate project skills/MCPs and write effective downstream state | project or machine | medium |
| `manage-harness-library` | Manage local inventory, skill bundles, MCP definitions, and card catalogs | machine | medium |
| `repair-harness` | Guide safe repair of drift and legacy layout | project + machine | high |
| `manage-defaults` | Machine-wide defaults and curated publication layer | machine | high |
| `recommend-harness` | Suggest cards, extensions, skills, MCPs without mutation | project | none |
| `share-harness-card` | Push, fetch, clone, manage remotes, and publish cards to catalogs | store + remote + catalog | medium |
| `support-harness` | Export support artifacts and run store checks | project + machine | medium |
| `organize-workspace` | Future cross-project organizer stub | workspace | deferred |

Each skill is a thin wrapper over `drwn` commands, with explicit user-ask
checkpoints before consequential writes.

## Reusable Cards

This repo also ships real card sources under [cards](./cards):

- `@darwinian/harness-skills`: stable card for the 12 current-lane skills
- `@darwinian/workspace-experimental`: explicit experimental card for the
  `organize-workspace` stub

During local development, apply the stable card directly with a `file:` ref:

```bash
drwn apply file:~/dev/darwinian-harness-skills/cards/harness-skills
drwn write --dry-run --json
```

After editing canonical skills under `skills/`, refresh the card-bundled copies
with:

```bash
npm run sync:cards
```

## Prerequisites

- `drwn` installed and on PATH
- One of: Claude Code, Codex CLI, Cursor, or another runtime supported by
  `npx skills add`

## Install

### Darwinian Harness Local Library

```bash
drwn library add skill ~/dev/darwinian-harness-skills
drwn skills packages show darwinian-harness-skills
drwn add skill inspect-harness --dry-run --json
```

Use `drwn add skill <name>` for one project, or
`drwn library defaults add skill <name>` for a machine-wide default.

### Claude Code

```bash
/plugin marketplace add remyjkim/darwinian-harness-skills
/plugin install darwinian@darwinian-harness-skills
```

Then invoke any skill with `/darwinian:<skill-name>`, for example
`/darwinian:bootstrap-project`.

### Codex CLI

```bash
codex plugin marketplace add remyjkim/darwinian-harness-skills
codex plugin install darwinian
```

### Codex Single Skill

Inside a Codex session:

```text
$skill-installer https://github.com/remyjkim/darwinian-harness-skills/tree/main/skills/<skill-name>
```

### Vercel `npx skills add`

```bash
npx skills add remyjkim/darwinian-harness-skills
```

Use `--agent <agent>` to target a specific runtime and `-g` for a global
install when supported.

## Safety Contract

Every mutating skill follows the same pattern:

1. Inspect current state via `drwn status`, `drwn doctor`, or the relevant
   read-only card/defaults command.
2. Declare scope explicitly: project, machine, card source, or downstream
   generated state.
3. Preview with `--dry-run --json` where `drwn` supports it, or describe the
   mutation plainly when it does not.
4. Ask for user approval before mutation.
5. Run the real command.
6. Verify the result with a follow-up read-only command.

`inspect-harness` and `recommend-harness` are strictly read-only.

## Examples

A reference Harness Card lives under [examples/cards](./examples/cards). It is a
documentation example only, not a published card.

## Development

```bash
npm install
npm run sync:cards
npm run lint:md
npm run validate:skills
drwn card validate file:~/dev/darwinian-harness-skills/cards/harness-skills --json
drwn card validate file:~/dev/darwinian-harness-skills/cards/workspace-experimental --json
```

## Compatibility

- `drwn` CLI v0.x
- `drwn library add skill` bundle schema v1
- Claude Code current plugin system
- Codex plugin / skill install surfaces
- Other runtimes via `npx skills add`

Installation commands outside Claude Code should be smoke-tested before a public
release because those distribution surfaces evolve independently.

## Contributing

See [MAINTAINERS.md](./MAINTAINERS.md) for review and release conventions.

## License

MIT. See [LICENSE](./LICENSE).
