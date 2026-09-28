---
name: prd-breakdown
description: Break a PRD into small execution slices and linked plan files
argument-hint: <workstream-slug>
---

Turn a PRD into an actionable, small-slice execution backlog and per-slice
plan stubs.

## Input

- Required argument: `<workstream-slug>`

## Critical Rules

1. **No code.** Do not implement feature code. This skill produces plan documents only.
2. **No silent assumption conversion.** Do not silently convert unsupported PRD or target-context assumptions into slice scope, dependencies, contracts, file touchpoints, validation, or acceptance checks. Keep unsupported claims as `TBD`, open questions, or refinement notes.
3. **No silent behavior changes.** Do not silently convert a migration/refactor into a behavior or operational semantics change. Preserve parity unless a supported source requires the change.
4. **Preserve existing patterns.** Do not create slices that remove or replace existing capabilities, integrations, queues, retries, DLQs, auth boundaries, persistence flows, event paths, observability, or reliability semantics unless the PRD, target context, decision log, or user explicitly requires it.
5. **Checklist is canonical.** Treat `sessions/<slug>/<slug>-next-steps.md` as the canonical task-state source.
6. **Decomposition evidence is mapping-scoped.** When `context.md` contains an
   exact `## Source PRD` section, use the parent snapshot only through its
   complete decomposition index. Do not slice sibling-only scope.
7. **Constrained checksum use.** The shell may only run
   `sha256sum -- <parent-snapshot-path>` when validating decomposition
   provenance. Do not run the shell for parentless workstreams or any other purpose.

## Instruction Priority

When instructions conflict, follow this order:

1. Critical Rules (above)
2. Contradiction and assumption checks (step 3)
3. Two-stage model — preserve Stage 1/Stage 2 boundaries
4. Slicing strategy — PRD-derived smallest increments
5. Decision classification — per `docs/decision-authority.md`
6. Output format

## Output files

- Canonical checklist: `sessions/<slug>/<slug>-next-steps.md`
- Per-slice plans: `sessions/<slug>/<slug>-<NN>-<slice-title>.md`

Where `<NN>` is a 2-digit execution order (01, 02, ...) and `<slice-title>` is PRD-derived kebab-case text.

## Two-stage slice planning model

This skill creates Stage 1 slice stubs. Do not finalize implementation details.

- **Stage 1** (`/prd-breakdown`): bounded, traceable, slice-scoped plan stub with explicit unknowns.
- **Stage 2** (`/refine-plan`): implementation-grade spec with locked decisions, file touchpoints, verification, edge cases, and exact acceptance criteria.

When a detail is not yet grounded in the PRD, target-context locked decisions, decision-log evidence, or repo conventions, preserve uncertainty with `TBD` or an explicit open question. PRD and plan text are inputs to decompose; they are not evidence for themselves when they contain unsupported claims. Do not invent exact file paths, schemas, commands, or internal APIs just to make the plan feel complete.

## Slicing strategy

Derive slices from the PRD in this order:

1. `## API Contracts (High-Level)` — usually one endpoint contract = one slice.
2. `## Proposed Architecture (V1)` numbered flow steps — additional slices where steps imply concrete build work.
3. `## Requirements -> Functional` — slices for behavior not already covered above.
4. `## Acceptance Criteria` — fill verification gaps; do not create oversized slices.

Slice size rules:

- Prefer slices completable in 1-2 sessions.
- Prefer more small slices over fewer broad work areas.
- Keep each slice independently testable with explicit acceptance checks.
- Avoid fixed backend/frontend/infra buckets when PRD-derived slices are available.

## Steps

### 1. Validate prerequisites

- Confirm `<workstream-slug>` is provided. If missing, stop and ask.
- Check that `sessions/<slug>/<slug>-prd.md` exists. If missing, stop and recommend `/prd <slug>`.
- Require `docs/templates/implementation-plan-template.md`. If missing, stop
  and report it before deriving or writing slices.

### 2. Read context

Read all of the following. If a file does not exist, note its absence and continue.

1. `AGENTS.md` and `docs/decision-authority.md`
2. `docs/templates/implementation-plan-template.md`
3. `sessions/<slug>/<slug>-prd.md`
4. `sessions/<slug>/context.md`
5. `sessions/<slug>/decision-log.md`
6. `sessions/<slug>/<slug>-next-steps.md`
7. `sessions/<slug>/<slug>-[0-9][0-9]-*.md` (existing slice plans)

If `context.md` contains a section with the exact heading `## Source PRD`:

1. Read the labeled `Parent snapshot`, `Decomposition index`, and
   `Child mapping` values.
2. Require the child mapping to equal `<slug>` and the index to declare
   `Status: Complete`. If a value is missing, mismatched, unreadable, or the
   index is incomplete, stop and report the provenance failure.
3. Verify the index manifest contains this child and these canonical paths.
4. Compute the parent snapshot SHA-256 with the allowed command and require it
   to match `Source SHA-256` in the index. Stop on a mismatch.
5. Treat a parent claim as evidence only when its coverage row names `<slug>`
   as primary owner or secondary workstream.

Use Glob/Grep to find and read the smallest relevant existing implementation or infrastructure pattern before deriving slices that touch migrations, integrations, queues, API routes, auth boundaries, persistence flows, event paths, retries, DLQs, observability, or reliability semantics.

### 3. Contradiction and assumption checks

Before slicing, verify all of the following:

1. **Locked-decision conflicts.** If PRD `Decisions Locked` conflicts with
   target-context, decision-log, mapped parent-snapshot, or decomposition-index
   decisions, report the conflict as a blocker and keep existing checklist
   items untouched.
2. **Parent conflicts.** If any child requirement, contract, architecture,
   acceptance criterion, non-functional constraint, or decision conflicts with
   a mapped parent-snapshot/index row, report it as a blocker and keep existing
   checklist items untouched.
3. **Unsupported claims.** If a material PRD claim lacks support from a mapped
   parent-snapshot row in a complete decomposition index, target-context locked
   decisions, decision-log evidence, `AGENTS.md`, or repo conventions read in
   this run, do not turn it into a locked slice requirement. Keep it as `TBD`,
   an open question, or a refinement note.
4. **Pattern preservation.** Preserve established repo patterns during migrations/refactors when read evidence verifies target-platform support (Critical Rule #4).
5. **No-pattern fallback.** If no exact repo pattern exists, derive the slice from the closest adjacent pattern or the smallest conventional design that is local, reversible, testable, and aligned with `AGENTS.md` / KISS/YAGNI and platform capabilities verified from repo docs, existing implementation, linked plans, or source material read in this run. Do not block on user input solely because no exact pattern exists.
6. **Decision classification.** Classify slice-scoping decisions per `docs/decision-authority.md`. Lock scope, ordering, and dependencies that follow directly from the PRD or established patterns. Surface meaningful tradeoffs as `Agent-Recommended` refinement notes. Escalate scope decisions that change product behavior, external contracts, or established patterns as `Needs User Approval`.
7. **Mapped scope.** Verify every parent-backed PRD claim has an index row
   mapped to this child. Treat sibling-only parent scope as a contradiction
   blocker, not slice input.
8. **Mapped completeness.** Verify every `Child` or `Shared` row classified
   `Locked` or `Pending` and mapped to this child is represented in the child
   PRD. Missing mapped scope is a blocker rather than an invitation to create
   incomplete slices.

### 4. Build slice list

Build a small ordered slice list using the slicing strategy above.

### 5. Create or update slice plans

For each slice, create or update `sessions/<slug>/<slug>-<NN>-<slice-title>.md` using `docs/templates/implementation-plan-template.md`.

All Stage 1 sections must be slice-scoped — do not restate whole-feature architecture.

**Stage 1 sections (populate now):**
- Why This Slice Exists
- PRD Traceability
- Objective
- Scope (In/Out)
- System Components (Slice View)
- System Flow (Slice Flow)
- Inputs / Outputs (Known So Far)
- Dependencies (if any)
- Open Questions
- Risks / Unknowns
- Implementation Plan (high-level work buckets)
- Initial Acceptance Shape
- Notes for Refinement

**Stage 2 sections (placeholder only, unless clearly grounded):**
- Contracts / Decisions Locked For This Slice
- Likely File Touchpoints
- Implementation Notes
- Verification
- Edge Cases
- Acceptance Criteria

Set: `Status: Planned` (or preserve current if file exists), `Last updated: <today>`, `Tracked by: sessions/<slug>/<slug>-next-steps.md`.

Use `Agent-Owned` defaults only for low-risk slice-scoping decisions that follow `AGENTS.md`, PRD, target context, decision log, existing patterns, or KISS/YAGNI. Put meaningful tradeoffs in `Notes for Refinement`. Classify decisions per step 3.6.

### 6. Validate before writing checklist

Before writing the checklist, verify:

- [ ] No unresolved contradiction blockers from step 3.
- [ ] No unsupported PRD claims leaked into slice scope or acceptance.
- [ ] No sibling-only parent scope leaked into slice scope or acceptance.
- [ ] Every mapped `Child` or `Shared` parent row classified `Locked` or
      `Pending` is represented in the PRD and resulting slices.
- [ ] Decision classification is correct per `docs/decision-authority.md`.
- [ ] Two-stage boundaries respected — Stage 2 sections are placeholders.
- [ ] Slice components/flows are slice-scoped, not whole-feature restated.
- [ ] Slice plans follow the heading structure from `docs/templates/implementation-plan-template.md`.
- [ ] Every slice plan has a corresponding checklist item, and vice versa.

If any check fails, fix the issue before proceeding.

### 7. Create or update checklist

Create or update `sessions/<slug>/<slug>-next-steps.md`:

- Keep `Now/Next/Later/Done` sections.
- `## Now` should prefer slices at `Stage: Refined`; keep `Stub` items in `## Next`/`## Later` unless the immediate next action is to refine them.
- Add a short stage legend near the top when missing: `Stub` = breakdown draft, `Refined` = implementation-ready, `In Progress` = active build, `Done` = completed.
- Each checklist item maps to exactly one slice plan and includes: Stage (`Stub` by default), Scope, Depends on (when known), Acceptance (2-5 checks), Validation (`TBD during refine-plan` when not yet known), Links.

**Merge behavior for reruns:**
- Never delete completed `Done` items.
- Preserve existing checked state and user-edited detail where still valid.
- Add new items as `newly discovered` when not present previously.

### 8. Report results

End your response with:

1. **Files generated/updated.** List all files created or modified.
2. **Recommended next step(s).** Which slices to build or refine first.
3. **Blockers.** Contradictions or ambiguities found in the PRD, target context, or decision log.
4. **Evidence gaps.** Unsupported assumptions kept as `TBD`, open questions, or refinement notes.
