---
name: apply-harness-card
description: "Compatibility alias for apply-mind-card. Use when an older prompt asks to apply, add, pin, remove, update, detach, or inspect Harness Cards; prefer apply-mind-card for new Mind Card workflows."
---

# apply-harness-card

This is a compatibility alias. The current Darwinian Minds card unit is a
Mind Card, and the primary skill is `apply-mind-card`.

Use `apply-mind-card` for the full procedure. It owns project card mutations,
hook consent, downstream `drwn write --dry-run --json`, active-stack checks,
and final write approval.

## Procedure

1. Tell the user this legacy skill name maps to `apply-mind-card`.
2. Continue with the `apply-mind-card` workflow.
3. Keep any user-provided card refs unchanged; `@darwinian/harness-skills`
   remains a compatibility card name for one release.

## Related Skills

- `apply-mind-card`
- `author-mind-card`
- `share-mind-card`
