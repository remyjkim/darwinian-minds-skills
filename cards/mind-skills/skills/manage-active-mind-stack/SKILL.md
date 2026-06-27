---
name: manage-active-mind-stack
description: "Use when the user says /manage-active-mind-stack, asks what minds are active, wants to switch minds, layer multiple minds, or clear the active stack. Wraps drwn mind list/use/clear with explicit approval before activation and write."
---

# manage-active-mind-stack

**Assumes**: project is a drwn project (`.agents/drwn/config.json` exists).
If not, redirect to `bootstrap-project` first.

## Input

Parse args after the slash invocation, or read intent from prose. Three
operations:

- **list** — `/manage-active-mind-stack` with no args, or prose like "what
  minds are active", "show me my mind stack".
- **use** — `/manage-active-mind-stack use <name1> <name2>...` with one or
  more mind names, or prose like "switch to my frontend mind", "stack
  base-mind and my domain mind".
- **clear** — `/manage-active-mind-stack clear`, or prose like "clear the
  stack", "deactivate all minds".

If the user's intent is ambiguous (e.g., they named minds but didn't say
use vs add), ask before mutating.

## Directive

1. **Read current state** with `drwn mind list --json`.
   - Output includes installed minds (from card.lock) + the active stack
     (from project config `activeMinds`).
   - Note the default: absent `activeMinds` means "all installed cards
     active in lockfile order" — explicit empty `[]` means "none active".
2. **Present the state** to the user before any mutation:
   - List installed minds with versions.
   - Show the current active stack (or note the default if absent).
3. For **list** intent, stop here.
4. For **use** or **clear** intent, preserve the current active stack from the
   `drwn mind list --json` output and summarize the proposed replacement.
5. Ask for approval before activation. `drwn mind use` and `drwn mind clear`
   mutate project config immediately and do not support `--dry-run`.
6. On approval, run exactly one activation command:

   ```bash
   drwn mind use --json <names...>
   # or
   drwn mind clear --json
   ```

7. Preview the downstream projection after activation:

   ```bash
   drwn write --dry-run --json
   ```

   - Show the user which skills, MCPs, and hooks would be added/removed
     from `.claude/`, `.codex/`, `.cursor/`.
   - Highlight any tool-name collisions (last layer wins on conflict).
8. Ask a second time before running the real `drwn write`.
9. If the user rejects the downstream write after activation, offer to restore
   the previous explicit stack with `drwn mind use --json <previous...>` or
   `drwn mind clear --json` for a previous empty stack. If the previous state
   was the absent default, explain that the CLI has no command to return to
   absent/default state; only a deliberate config edit can do that today.
10. **Materialize** with `drwn write`.
11. **Report final state** by re-running `drwn mind list --json`.

For strict pre-mutation previews, copy the project to a temporary directory,
run the proposed `mind use`/`mind clear` and `write --dry-run` there, then
return to the real project for the approved activation.

## Output

- Updated `activeMinds` in `<project>/.agents/drwn/config.json`.
- Updated `.claude/`, `.codex/`, `.cursor/` config files reflecting the
  active stack.
- Updated `.agents/drwn/generated/mind/` composed view (or removed if the
  stack is now empty).
- Per-mind isolated bundles under `.agents/drwn/generated/minds/<scope>/<name>/`
  remain regardless of activation state (the catalog).

## Failure Modes

- **Not a drwn project**: stop; suggest `drwn init` or `bootstrap-project`.
- **Named mind not installed**: `drwn mind use` errors loudly. Surface to
  the user and suggest `drwn card add <ref>` first.
- **Stack reordering with tool-name conflicts**: surface the resolved
  winner per conflict in the preview. Don't silently let one mind shadow
  another.
- **Write preview rejected**: offer rollback to the previous explicit stack
  before stopping.
- **Dry-run output too large**: summarize counts (e.g., "8 new symlinks,
  2 removed") instead of pasting the full JSON.

## Wraps

`drwn mind list [--json]`, `drwn mind use --json <names...>`, `drwn mind clear --json`,
`drwn write --dry-run [--json]`, `drwn write`.

## Notes

- The active stack is **per-project**, not machine-wide.
- Pinning matters: last layer wins on tool conflicts (per
  `effective-state.ts` precedence). Reorder via another `drwn mind use`
  if the resolution is wrong.
- Default (absent `activeMinds`) = all installed cards in lockfile order.
  After `drwn mind use` or `drwn mind clear`, the field is explicitly set;
  there's no way back to "absent" except hand-editing config.json.
- See the `layered-minds` and `explicit-activation` beliefs in this card
  for the model behind these rules.
