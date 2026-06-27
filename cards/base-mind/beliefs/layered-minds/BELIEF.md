# layered-minds

A project hosts N minds. They run independently or layered as an ordered
stack via `drwn mind use a b c`. Stack order is precedence — later layers
win on tools, beliefs/memory union with provenance, persona concatenates
in stack order.

A single mind is the degenerate one-element stack — the same code path
serves both. Reach for layering when you have orthogonal concerns
(base-mind + a domain-specialist mind, for example); reach for a
single mind when one card covers the whole job.

The runtime sees `.agents/drwn/generated/mind/` — the composed view of
the active stack. The per-mind isolated bundles under
`.agents/drwn/generated/minds/` are the catalog, not the mount target.
