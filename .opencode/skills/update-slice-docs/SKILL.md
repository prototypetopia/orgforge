---
name: update-slice-docs
description: Update project documentation to match a completed slice; auto-update in-scope docs and gate sensitive docs behind approval
argument-hint: <plan-path> | <workstream-slug> <NN>
---

Bring project documentation back in sync with the code a single slice changed.
Runs after the slice's implementation and tests are complete and audited. This
skill edits directly, so it applies only safe in-scope doc updates and gates
sensitive docs behind user approval.

## Critical Rules

1. **The tiered scope (below) is absolute.** Auto-update only Tier 1 docs. Never
   edit Tier 2 docs without explicit user approval. Never touch Tier 3 docs.
2. **Git is read-only.** Use git only to inspect status and diff. Never commit,
   reset, stash, rebase, or otherwise modify git state.
3. **No tests, builds, or deploys.** Only git inspection and documentation edits.
4. **Documentation only.** Only edit or create documentation files. Never edit
   source code, infrastructure, or config.
5. **Minimal, factual edits.** Update only what the slice made stale. No cosmetic
   rewrites, no speculative content. Match each doc's existing structure and tone.
6. **Slice-scoped.** Only update docs that describe code this slice changed.
   Ignore unrelated worktree changes and pre-existing doc drift outside the
   slice's surface.

## Input

Supported invocations:

- `/update-slice-docs sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/update-slice-docs <workstream-slug> <NN>`

Where `<NN>` can be `2` or `02` (normalize to 2 digits).

## Plan resolution

1. If the first argument is a path and exists, use it.
2. Else treat inputs as `<slug> <NN>` and resolve with:
   - `sessions/<slug>/<slug>-<NNpad>-*.md`
3. If 0 matches: stop and print the glob attempted.
4. If >1 match: list candidates and ask the user which one to use. Do not
   auto-pick.

## Read scope

### Always read

- The full target plan, to recall the slice's scope and touchpoints.
- The slice's changes. The slice is uncommitted at this point (the pipeline
  commits only at `/pr`), so inspect the working tree, not a commit range:
  `git status` (catches new untracked files), `git diff`, and
  `git diff --staged`. Identify touched features, domains, infra, and SDK surface.
- Any candidate doc before editing it.

### Read when useful

- The Tier 2 docs (`docs/development-flow.md`, `docs/decision-authority.md`)
  when the slice plausibly affects what they describe — read them to judge
  whether they are stale (never edit without approval; see Tier 2 below).
- `AGENTS.md` as a convention source when writing or structuring a README
  (read-only — never edited; it is Tier 3).
- A sibling README when creating a new one, to match its structure and tone.

## Documentation tiers

### Tier 1 — auto-update (edit directly)

Update any of these whose content is now stale or incomplete relative to the
slice:

- Per-feature READMEs: `backend/features/<feature>/README.md`, including nested
  sub-feature READMEs (e.g.
  `backend/features/visit-summary/get-visit-summary/README.md`).
- Per-domain READMEs: `backend/domains/<entity>/README.md` (e.g.
  `backend/domains/patient-gap/README.md`) — when the slice changes that
  entity's types, operations, or DB access patterns.
- `docs/architecture.md` — when the slice adds or changes a component, data
  flow, or cross-cutting pattern.
- SDK package docs — `packages/provider-copilot-sdk/README.md` and
  `packages/provider-copilot-sdk/SDK_REFERENCE.md` — when the slice changes the
  SDK's public surface: classes/methods, exported types, realtime events,
  lifecycle, or usage rules. (`SDK_REFERENCE.md` is a compact reference tightly
  coupled to the SDK's public TypeScript API; backend API-contract changes that
  flow through to the SDK belong here too.)

If the slice introduced a brand-new feature or domain folder with no README,
create one following the existing per-feature / per-domain README pattern (read
a sibling README first to match its structure).

### Tier 2 — approval-gated (never edit unprompted)

`docs/development-flow.md` and `docs/decision-authority.md`.

- Check whether the slice makes them stale.
- If the user has already approved a specific change to one of them in this
  conversation, apply that approved edit.
- Otherwise, surface the needed change as a `Needs User Approval` item naming
  the specific doc, the change, and why — and do not edit it.

### Tier 3 — never touch

`AGENTS.md` (root or package, e.g. `packages/provider-copilot-sdk/AGENTS.md`),
`TESTS.md`, `CLAUDE.md`, the no-longer-used PRDs/ADRs in `docs/`
(`docs/*-prd.md`, `docs/adr-*.md`), anything under `docs/templates/`, and all
session docs under `sessions/` (owned by the session skills).

## Repeat-run behavior

- Focus on docs still stale relative to the slice. Skip docs already aligned in
  a prior run.
- If a prior user approval for a Tier 2 change is already in context, apply it
  now instead of re-asking.
- If the user already declined a specific Tier 2 change in this conversation, do
  not re-surface it — treat that doc as settled for this slice.

## Stop when

- Every in-scope (Tier 1) doc is aligned with the slice.
- All Tier 2 staleness is either applied (with prior approval) or surfaced as a
  `Needs User Approval` item.
- No new doc edits remain for this pass.

## Return

Keep the return terse and delta-focused. Omit empty sections.

- Docs created or updated in this run (Tier 1)
- `Needs User Approval` items for Tier 2 docs, if any
- Remaining gaps or findings, if any

If nothing needed changing, say: `No documentation changes needed in this pass.`

## Machine footer

End every response with exactly one machine footer as the final nonblank line.
Do not put text, bullets, or code fences after it:

`WORKFLOW_RESULT: CLEAN|CHANGED|ADVISORY|NEEDS_USER|FAILED`

Choose one result:

- `NEEDS_USER` when plan resolution is ambiguous or a stale Tier 2 document
  requires approval. Do not auto-pick a plan or edit Tier 2 documentation
  without approval; this takes precedence over other results.
- `CHANGED` when this run safely created or updated any approved or Tier 1 doc
  and no approval blocker remains.
- `ADVISORY` when no files changed and only nonblocking documentation
  recommendations remain.
- `CLEAN` when no files changed and no documentation work remains.
- `FAILED` only when an operational inability prevents completing the docs pass,
  such as required files or git inspection being unavailable. Do not use it for
  Tier 2 approval needs.
