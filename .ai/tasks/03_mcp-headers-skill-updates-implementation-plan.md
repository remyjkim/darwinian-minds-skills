# MCP `headers` Support — Skill Doc Updates - Implementation Plan

**Status**: Implemented 2026-06-30 (Phases 1–3 done; `import-mcp-from-claude` 4 sites + literal-secret step, `author-mind-card` note; stale-claim sweep clean)

**Created**: 2026-06-30

**References**: darwinian-minds task 61 (`feat/http-mcp-headers-passthrough`, v0.6.0), `skills/import-mcp-from-claude/SKILL.md`, `skills/author-mind-card/SKILL.md`

---

## Executive Summary

`darwinian-minds` v0.6.0 adds `RegistryServer.headers` and renders it across Claude, Codex, and
Cursor (Claude verbatim, Cursor `${env:VAR}`, Codex `bearer_token_env_var` / `http_headers`).
This **closes the gap** that `skills/import-mcp-from-claude/SKILL.md` documents in four places as
"drwn doesn't support `headers` yet".

This task updates the skills to reflect header support: the import skill must stop telling users
to drop or abort header-auth servers, and instead import them — converting any literal secret to a
`${ENV_VAR}` reference so it is never committed. One minor note is added to `author-mind-card`.

**No code in this repo** — these are SKILL.md doc edits only. The skills now assume `drwn >= 0.6.0`.

---

## Investigation Findings

### What drwn v0.6.0 actually does (verified)

- `headers?: Record<string,string>` on `RegistryServer`; rendered per target:
  - **Claude**: `headers` verbatim — `${VAR}` expands at launch (official `.mcp.json` behavior).
  - **Cursor**: header values rewritten `${VAR}` to `${env:VAR}`.
  - **Codex**: `Authorization: Bearer ${VAR}` becomes `bearer_token_env_var`; literal headers
    become `http_headers`. A **non-bearer** `${VAR}` header cannot be expressed by Codex — drwn
    emits a write-time warning and omits it (carries fine on Claude/Cursor).
- Validation rejects non-string header maps in card manifests and the MCP library.

### Affected skills

- `skills/import-mcp-from-claude/SKILL.md` — **4 edit sites**, all currently saying headers are
  unsupported: the plan-summary example table, the field-mapping `headers` row, the Failure Modes
  bullet, and the Notes bullet.
- `skills/author-mind-card/SKILL.md` — no field-level schema is enumerated today; add one short
  note that MCP definitions support a `headers` map for header-authenticated hosted HTTP servers.

### Key nuance — literal secrets

Claude's `.mcp.json` often stores a **literal** token in `headers`, not a `${VAR}` reference. On
import, a literal secret must be converted to a `${ENV_VAR}` reference (and the env var recorded in
`notes`) so the card or library never embeds the secret. This is the most important behavioral
addition, not just deleting the warnings.

---

## Implementation Strategy

Edit SKILL.md prose only. Keep the existing dry-run, summarize, confirm safety posture; the change
is *what* we tell the user about headers, plus the literal-secret conversion step.

### Phase 1 — Update import-mcp-from-claude

File: `skills/import-mcp-from-claude/SKILL.md`.

#### Site 1 — plan-summary example table row

Before:

```text
custom-api  http (with headers) not present    transform + library add (warn: headers won't carry)
```

After:

```text
custom-api  http (with headers) not present    transform + library add (headers carry; convert literal secrets to ${VAR})
```

#### Site 2 — field-mapping headers row

Before: the `headers` row maps to "(no equivalent today)" and warns the user to drop, abort, or
skip because drwn does not support headers.

After: the `headers` row maps to `headers` and reads, as a single table cell:

```text
Passthrough as a string map (drwn >= 0.6.0). Per target: Claude keeps ${VAR} verbatim, Cursor
rewrites to ${env:VAR}, Codex maps Authorization: Bearer ${VAR} to bearer_token_env_var and
literal headers to http_headers. A non-bearer ${VAR} header can't be expressed on Codex — drwn
warns at write time and omits it (carries on Claude/Cursor). If a header holds a literal secret,
convert it to a ${ENV_VAR} reference (and record the env var in notes) so it is never committed.
```

#### Site 3 — Failure Modes bullet

After:

```text
- headers present in Claude config: import them (drwn >= 0.6.0). Convert any literal secret to a
  ${ENV_VAR} reference before add so it isn't committed. Warn only for a non-bearer ${VAR} header
  (Codex can't express it; it still carries on Claude/Cursor).
```

#### Site 4 — Notes bullet

After:

```text
- Header-based (bearer) auth is supported as of drwn >= 0.6.0: Claude/Cursor carry the header;
  Codex maps Authorization: Bearer ${VAR} to bearer_token_env_var. Convert a literal token to a
  ${ENV_VAR} reference on import so the secret isn't committed.
```

#### Site 5 — new transformation sub-step

In Step 2, add a literal-to-`${VAR}` conversion step: when a `headers` value contains an inline
secret, prompt for an env var name, replace the secret with `${ENV_VAR}`, and append a `notes`
hint naming the variable.

#### Phase 1 verification

- A sweep for "doesn't support headers", "won't carry", "Phase 4 gap", "waiting for drwn" returns
  nothing.
- Manual read: the headers row, failure mode, and notes describe support plus literal-secret
  conversion.

### Phase 2 — Minor note in author-mind-card

File: `skills/author-mind-card/SKILL.md`.

Near the `drwn card source add-mcp` description, add one sentence: MCP server definitions may
include a `headers` map to authenticate hosted HTTP servers; use a `${ENV_VAR}` reference rather
than a literal token.

Verification: read-through; `add-mcp` guidance mentions `headers` and the `${VAR}` convention.

### Phase 3 — Repo-wide consistency sweep

- Sweep `skills/*/SKILL.md` for any remaining "unsupported" or "won't carry" claims.
- If a skills-repo analysis or knowledge doc tracks the headers gap, mark it resolved by drwn
  v0.6.0 (none found in `.ai/` at draft time).

---

## Risks & Mitigation

- **Leaking a literal secret into a card or library** — the conversion-to-`${VAR}` step is
  mandatory, not optional. The skill must never `add` a server whose `headers` contain an inline
  secret without converting first. Make this a hard checkpoint in the prose.
- **Codex non-bearer `${VAR}` header** — still unsupported; the skill must surface drwn's
  write-time warning rather than imply full Codex parity.
- **Version assumption** — these edits assume `drwn >= 0.6.0`. Default recommendation: state the
  requirement in prose without a runtime gate.

---

## Out of Scope

- The `@remyjkim/fal` card and its hosted-MCP variant (tracked in mindspace-landing planning docs).
- Any darwinian-minds code change (already shipped in v0.6.0).
