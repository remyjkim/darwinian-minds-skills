---
name: organize-workspace
description: "Use when the user asks for cross-project Darwinian Minds organization; this placeholder explains that workspace-level scanning and categorization are not implemented yet."
---

# organize-workspace

> This skill is a future-lane placeholder. It does not implement cross-project
> workspace organization today.

## Why This Exists

The broader Darwinian Minds product vision includes a cross-project organizer
that can scan a workspace, categorize repos, and help layer harness defaults
across multiple projects.

That is not part of the live cards-era CLI today because:

1. `drwn scan` is currently a no-op placeholder.
2. Cross-project classification and recency heuristics are not part of the
   shipped `drwn` surface.

## What To Do Now

If a user wants to organize or onboard repos today:

1. Explain that workspace-level organization is not implemented in this skill.
2. Redirect them to `bootstrap-project` for per-project setup.
3. If they need recommendations first, redirect them to `recommend-harness`.

## Scope

Workspace idea only. No mutations.

## Related Skills

- `bootstrap-project`
- `recommend-harness`
