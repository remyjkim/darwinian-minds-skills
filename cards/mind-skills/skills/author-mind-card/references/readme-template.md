# <name>

> <one-sentence value proposition>

## What it does

- <capability 1>
- <capability 2>

## Recommended for users who...

- <user profile or context>

## Installation

> Requires the [drwn CLI](https://darwiniantools.com).

Clone the card to your local store. The `#v<tag>` selector pins to an
explicit Git tag; use the latest tag listed under `## Versions` below:

```sh
drwn card clone github:<owner>/<name>#v1.0.0
```

If this is a new project, run `drwn init` first.

Apply the card. The `^1.0.0` range accepts any compatible release; pin to a
strict version (e.g. `@1.0.0`) for reproducible installs:

```sh
drwn card apply <scope>/<name>@^1.0.0
```

## What's included

| Asset | Purpose |
|---|---|
| `SKILL.md` | Agent-facing instructions |
| _(add rows as you bundle skills and MCPs)_ | |

## Versions

| Version | Notes |
|---|---|
| v1.0.0 | Initial release |

---

See the [Darwinian Tools documentation](https://docs.darwiniantools.com) for more information on drwn Mind Cards, installation, version pinning, and project configuration.
