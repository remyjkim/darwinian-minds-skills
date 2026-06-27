---
name: author-mind-content
description: "Use when the user says /author-mind-content, wants to add or remove persona, beliefs, or memory in a card source, scaffold mind content, or set up the richer side of a Mind Card. Wraps drwn card source add/remove persona, belief, and memory commands with explicit visibility and keep-files prompts."
---

# author-mind-content

**Assumes**: a card source exists under `~/.agents/drwn/sources/<scope>/<card>/`,
created via `drwn card new <name>`. The `card source add-*` commands target
that canonical location. If the user wants to author content in a card
source that lives in a separate repo (e.g., `darwinian-minds-skills/cards/<card>/`),
explain that the CLI's add-* commands target the canonical source dir; the
in-repo authoring path is hand-edit for now (a tracked drwn ergonomic gap).

## Input

Parse from slash invocation or prose:

- **Card name** (e.g., `@scope/my-mind`) — required.
- **Operation** — `add` or `remove`; default to `add` only when the user is
  clearly scaffolding new content.
- **Content type** — one of `persona`, `belief`, `memory`.
- **Entry name** (e.g., `voice`, `engineering`, `seed-reflection`) — required.
- **Visibility** — one of `private`, `internal`, `public`. Required and
  has no default; ask if missing.
- **For memory only**: `layer` (`l4`, `l5`, or `l6`) and `format` (`md`,
  `jsonl`, or `mixed`; default `md`).

## Directive

1. **Confirm the card source exists**:

   ```bash
   drwn card source show <card> --json
   ```

   - If the source doesn't exist, redirect to `drwn card new <card>` first.
2. **Explain the visibility model** to the user before they pick:
   - `private` — blocked from public push without `--unsafe-push-public`.
     Use for personal beliefs, memory not meant for collaboration.
   - `internal` — fine for collaboration; default for organizational use.
     Pushable to organizational remotes.
   - `public` — explicitly safe for arbitrary parties. Use for opinionated
     principles, voice statements, anything that benefits from broad reach.
3. **Confirm the scope** (which card, which content type, which entry,
   which visibility — and for memory, which layer + format).
4. **Preview the scaffold or removal** with `--dry-run`:

   ```bash
   # Add persona
   drwn card source add-persona <card> <entry> --visibility <v> --dry-run --json
   # Remove persona
   drwn card source remove-persona <card> <entry> [--keep-files] --dry-run --json
   # Add belief
   drwn card source add-belief <card> <entry> --visibility <v> --dry-run --json
   # Remove belief
   drwn card source remove-belief <card> <entry> [--keep-files] --dry-run --json
   # Add memory
   drwn card source add-memory <card> <entry> --layer <l4|l5|l6> --visibility <v> [--format <md|jsonl|mixed>] --dry-run --json
   # Remove memory
   drwn card source remove-memory <card> <entry> --layer <l4|l5|l6> [--keep-files] --dry-run --json
   ```

5. For removals, ask whether to delete files or keep them with `--keep-files`
   for a manifest-only removal.
6. **On user approval**, run the real command (drop `--dry-run`).
7. **Help the user fill in the scaffolded content** for additions:
   - Persona: open `persona/<entry>/PERSONA.md`. Brief (60-200 words usually
     — composes in stack order with other minds' personas).
   - Belief: open `beliefs/<entry>/BELIEF.md`. Single principle; opinionated;
     stable across versions.
   - Memory: open the layer's content file. Format depends on `--format`.
     L4 = synthesized reflections (stable). L5 = curated observations
     indexing L6. L6 = raw trajectory (high volume).
8. **Validate** with `drwn card source doctor <card> --json`:
   - Should report `ok: true` with no orphaned or missing entries.
   - The byte-equal invariant between `card.json.<section>` and the
     bundled files must hold.
9. For in-repo card sources that live outside `~/.agents/drwn/sources`, hand
   edit the files and then validate with:

   ```bash
   drwn card validate file:<path-to-card-source> --json
   ```

10. **Suggest a version bump** if the card is already published:

    - Minor for additive entries (new persona/belief/memory entry).
    - Major if removing or renaming an existing entry, or tightening
      visibility on an existing section (e.g., public → internal).

11. **Suggest republish** after source doctor passes:

   ```bash
   drwn card publish <card>
   drwn card validate <card>@<version> --json
   ```

## Output

- New, removed, or manifest-detached persona/belief/memory entry under the card
  source.
- Updated `card.json` with the entry declared or removed in the appropriate
  section with explicit visibility.
- (After the user fills in content) a non-empty `PERSONA.md`/`BELIEF.md`/
  memory file.
- (Optional) bumped card version + republished card.

## Failure Modes

- **Missing `--visibility`**: the command errors. Walk the user through
  the three options before retrying.
- **Card source doesn't exist**: redirect to `drwn card new`.
- **Visibility downgrade detected**: surface as a major version bump
  requirement; don't try to ship as a patch.
- **JSONL format chosen but content not valid JSONL**: `card source doctor`
  catches this. Help the user fix line-by-line.

## Wraps

`drwn card source show`, `drwn card source add-persona`,
`drwn card source remove-persona`, `drwn card source add-belief`,
`drwn card source remove-belief`, `drwn card source add-memory`,
`drwn card source remove-memory --layer`, `drwn card source doctor --json`,
`drwn card source set --version`, `drwn card publish`,
`drwn card validate --json`.

## Notes

- Visibility is required and has no default — explicitness is load-bearing
  for the push gate. See the `visibility-discipline` belief in this card.
- Memory has three layers (L4 reflections, L5 observations, L6 raw) with
  per-layer visibility + format. v1 stores L6 in-tree; LFS deferred.
- `card source doctor` enforces the byte-equal invariant between the
  manifest and bundled files. If that fails, the card cannot be published.
- The in-repo authoring path (hand-editing a card source that lives outside
  `~/.agents/drwn/sources/`) is a tracked ergonomic gap; document the
  workaround when it comes up.
