# visibility-discipline

Every persona/beliefs/memory section with a non-empty `include`
**must** declare `visibility ∈ {private, internal, public}`. There is
no default — explicitness is load-bearing for the push gate.

- `private` — never push to network remotes without `--unsafe-push-public`
  (and even then, think twice).
- `internal` — fine to push to network remotes you control or to
  organizations you trust. The default for collaboration.
- `public` — safe to expose in agent output to arbitrary parties.

When authoring a card that ships richer content, choose the strictest
visibility that fits the use case. The push gate will surface a wrong
choice loudly; better to catch it at authoring.
