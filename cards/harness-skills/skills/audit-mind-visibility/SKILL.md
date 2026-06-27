---
name: audit-mind-visibility
description: "Use when the user says /audit-mind-visibility, wants to check if a mind is safe to push, audit visibility settings across cards, or detect strictest-visibility before publishing. Read-only walk over installed and authored cards."
---

# audit-mind-visibility

**Assumes**: `drwn` on PATH.

## Input

Parse target — single card name, all installed cards in the current
project, or all card sources authored on this machine. If absent, default
to "all installed cards in the current project."

Invocation forms:

- `/audit-mind-visibility` — defaults to all installed cards in the
  current project.
- `/audit-mind-visibility <card-name>` — single card.
- `/audit-mind-visibility --sources` — all authored sources on this
  machine.
- Prose: "is my notion mind safe to push", "what's the visibility on my
  cards", "audit visibility before I push".

## Directive

1. **Enumerate targets**:
   - Installed-in-project: `drwn card status --json` → `locked[].name`.
   - Single card: passed as argument.
   - All sources: `drwn card source list --json` → walk each source.
2. **For each target**, read manifest visibility:
   - Installed: `drwn card show <card> --json`.
   - Source: `drwn card source show <card> --json`.
   - Enumerate visibility per `persona`/`beliefs`/`memory.l4`/`memory.l5`/
     `memory.l6` section.
   - Note: tools-only cards (no persona/beliefs/memory) have **no
     visibility declarations** and bypass the gate entirely; surface this
     as "no visibility constraints; pushes freely."
3. **Compute strictest visibility** across all declaring sections:
   - Order: `private` > `internal` > `public`.
   - If any section is `private`, strictest is `private`.
   - The push gate uses the strictest, not section-by-section.
4. **If a remote is configured** for the card (`drwn card remote list <card>`):
   - Classify only what the CLI can know:
     - Local paths and `file://` URLs -> `private`.
     - Network remotes -> `unknown` unless the user supplies
       `--remote-visibility private|internal|public|unknown`.
   - Do not infer trusted organizations from the host or owner. The CLI's push
     gate requires explicit user classification for network remotes.
   - Compare strictest visibility to the explicit remote classification:
     - `private` content + `private` remote → push OK.
     - `private` content + `internal`/`public`/`unknown` remote → push BLOCKED.
     - `internal` content + `private`/`internal` remote → push OK.
     - `internal` content + `public`/`unknown` remote → push BLOCKED.
     - `public` content + `private`/`internal`/`public` remote → push OK.
     - `public` content + `unknown` remote → ask for classification before
       push so the command records intent.
5. **Report a table** to the user:

   ```text
   card                        strictest    remote                      push verdict
   --------------------------- ------------ --------------------------- ------------
   @darwinian/base-mind        public       git@github.com:darwinian/.. needs classification
   @scope/private-notes        private      git@github.com:scope/..     BLOCKED unknown
   @scope/team-card            internal     (not configured)            n/a
   @darwinian/mind-skills      (none)       git@github.com:darwinian/.. OK tools-only
   ```

6. **For BLOCKED cards**, surface the exact override flags:
   - `drwn card push <card> --remote-visibility <v>` to declare the remote
     as that visibility level (use only if the user really controls the
     remote's classification).
   - `drwn card push <card> --remote-visibility public --unsafe-push-public`
     only after the user explicitly accepts pushing stricter content to a less
     restrictive public remote.
7. **No mutations** — this skill is read-only.

## Output

A read-only audit report. No file changes, no pushes, no commits.

## Failure Modes

- **Card not installed**: skip with a note ("@scope/foo not installed; use
  `drwn card add` first if you want to audit installed state").
- **No card sources on this machine** with `--sources`: report empty,
  suggest `drwn card new`.
- **Manifest read fails**: surface the error per card; continue with
  others.
- **Remote classification ambiguous**: report `unknown`, not `public`, and
  require the user to choose `--remote-visibility` before push.

## Wraps

`drwn card status --json`, `drwn card show --json`,
`drwn card source list --json`, `drwn card source show --json`,
`drwn card remote list --json`. No mutations.

## Notes

- Visibility is per-section on the card; the gate uses the strictest
  across all sections that declare it.
- Tools-only cards bypass the gate entirely (no `persona`/`beliefs`/`memory`
  means nothing to gate). Surface this clearly so users don't think
  the audit missed something.
- Visibility classifications evolve. Re-run this audit before each major
  push, not just once at authoring.
- See the `visibility-discipline` belief in this card for the model behind
  these classifications.
