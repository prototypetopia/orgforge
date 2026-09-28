---
name: refine-prd
description: Refine a PRD without editing; propose an apply_patch-ready update
argument-hint: <workstream-slug>
---

Review and refine an existing PRD. This skill is read-only: do not edit files.
Instead, ask questions and propose a patch the user can approve.

## Critical Rules

1. **Read-only.** Do not modify files. Propose all changes as "NOT APPLIED" patches.
2. **Evidence-backed only.** Ground every material claim in evidence (see `docs/decision-authority.md` for what counts as a material claim and valid evidence). Unsupported claims are evidence gaps, not requirements.
3. **PRD text is not evidence for itself.** Treat existing PRD text as content under review, not as evidence when auditing unsupported assumptions.
4. **Source-workstream evidence is supporting context only.** Source-workstream evidence can identify candidates, recurring constraints, reusable patterns, and validation gaps, but it is not sufficient by itself to preserve target-scope requirements, contracts, acceptance criteria, or locked decisions.
5. **Decomposition evidence is mapping-scoped.** A complete decomposition index
   and parent snapshot listed under the target context's exact `## Source PRD`
   heading are direct evidence only for index rows mapped to this child. A
   parent path by itself is not target-scope evidence.
6. **Constrained checksum use.** The shell may only run
   `sha256sum -- <parent-snapshot-path>` when validating decomposition
   provenance. Do not run the shell for parentless workstreams or any other purpose.

## Instruction Priority

When instructions conflict, follow this order:

1. Critical Rules (above)
2. Blocker handling — treat conflicts as blockers, ask before patching
3. Evidence grounding — every locked claim must cite its source
4. Decision classification — per `docs/decision-authority.md`
5. Review scope — all review categories below
6. Return format

## Input

- Required argument: `<workstream-slug>`

## Required file

- `sessions/<slug>/<slug>-prd.md`

If missing, stop and recommend running `/prd <slug>` first.

## Read scope

Read on every run before producing findings:

- `AGENTS.md`
- `TESTS.md`
- `docs/decision-authority.md`
- `sessions/<slug>/<slug>-prd.md`
- `sessions/<slug>/context.md` (if present)
- `sessions/<slug>/decision-log.md` (if present)
- `sessions/<slug>/latest.md` (if present)
- `sessions/<slug>/<slug>-next-steps.md` (if present)
- `sessions/<slug>/<slug>-[0-9][0-9]-*.md` (if present)
- Use Glob/Grep to find and read the smallest relevant existing implementation or documented repo constraint before validating an implementation-sensitive claim or classifying a proposed decision as following or deviating from existing codebase patterns.

If the context file includes an exact `## Source PRD` heading:

1. Read the labeled `Parent snapshot`, `Decomposition index`, and
   `Child mapping` values.
2. Require the child mapping to equal `<slug>` and the index to declare
   `Status: Complete`. If a value is missing, mismatched, unreadable, or the
   index is incomplete, stop and report the provenance failure.
3. Verify the index manifest contains this child and these canonical paths.
4. Compute the parent snapshot SHA-256 with the allowed command and require it
   to match `Source SHA-256` in the index. Stop on a mismatch.
5. Use a parent claim as direct target evidence only when its coverage row names
   `<slug>` as primary owner or secondary workstream. Sibling-only rows remain
   out of scope.

If the context file includes a `## Source Workstreams` section, treat it as project-seeded source context and read canonical files for each listed source slug when present:

- `sessions/<source-slug>/context.md`
- `sessions/<source-slug>/decision-log.md`
- `sessions/<source-slug>/latest.md`
- `sessions/<source-slug>/<source-slug>-prd.md`
- `sessions/<source-slug>/<source-slug>-next-steps.md`
- `sessions/<source-slug>/<source-slug>-[0-9][0-9]-*.md`

Source-workstream limits per Critical Rule #4 apply.

## Steps

1. Validate `<workstream-slug>` is present.
2. Produce a refinement review. Check all categories; report only material findings:

   **Evidence & Claims:**
   - Unsupported material claims or evidence gaps
   - Classify each finding per `docs/decision-authority.md`; also use `Candidate/Proposed` (pre-evaluation label: from source workstreams, not yet adopted) and `Remove Or TBD` (pre-evaluation label: speculative details not needed for the current PRD). Once evaluated, standard classifications apply.

   **Requirements & Contracts:**
   - Missing requirements (functional/non-functional)
   - `Child` or `Shared` decomposition rows classified `Locked` or `Pending`
     that map to this child but are absent from its PRD, context, or decision
     log as applicable
   - Ambiguous contracts (API inputs/outputs, ownership, idempotency, error cases)
   - Unresolved `Decisions Proposed (Pending Approval)` — present each to the user for approval, rejection, or modification
   - Test/verification gaps

   **Conflicts:**
   - Conflicts between PRD "Decisions Locked" vs target-context locked decisions or decision log
   - Conflicts between the child PRD/context/decision log and mapped parent
     snapshot or decomposition-index requirements
   - Conflicts between PRD decisions and any `Candidate Inherited Decisions` captured in the target context
   - Gaps compared with similar requirements or non-functional expectations seen in source workstreams

   **Pattern Selection & Parity:**
   1. Preserve established repo patterns when read evidence verifies target-platform support.
   2. Adapt the closest adjacent repo pattern when no exact pattern exists.
   3. When no repo pattern exists, choose the smallest conventional design that is local, reversible, additive, testable, and aligned with `AGENTS.md`, `TESTS.md`, KISS/YAGNI, and platform capabilities verified from repo docs, existing implementation, linked plans, or explicitly read source material in this run.
   4. During migrations and refactors, default to parity per `docs/decision-authority.md`.

3. Validate before proposing patch:
   - [ ] Essential context was read: `AGENTS.md`, `TESTS.md`,
     `docs/decision-authority.md`, target PRD, and any decomposition index and
     parent snapshot listed under `## Source PRD`.
   - [ ] All findings are evidence-backed — no unsupported assumptions promoted to requirements, locked decisions, or acceptance criteria.
   - [ ] Decision classifications follow `docs/decision-authority.md`.
   - [ ] Conflicts treated as blockers for affected patch areas.
   - [ ] Every parent-backed claim is mapped to this child in the complete
     decomposition index; sibling-only scope was not imported.
   - [ ] Every `Child` or `Shared` row classified `Locked` or `Pending` and
     mapped to this child is represented in its PRD and applicable
     context/decision-log sections.
   - [ ] Proposed choices placed in `Decisions Proposed (Pending Approval)`; unknowns placed in `Open Questions` or `TBD` placeholders.
   - [ ] No files modified (Critical Rule #1).

   If any check fails, fix the issue before proceeding.

4. Reserve questions for blockers, unresolved evidence gaps, and decisions needing user approval. Include `Agent-Owned` decisions as decided in the proposed patch.
5. Propose an `apply_patch`-ready patch to update `sessions/<slug>/<slug>-prd.md`.
   - Label clearly: "NOT APPLIED"
   - Keep changes minimal and localized to affected sections.
   - Prefer concrete, testable language and explicit acceptance criteria in patch content.
   - If an unanswered question or unsupported claim affects a patch area, omit that area and list the question instead.
   - If a proposed patch introduces or depends on a decision that deviates from existing codebase patterns, surface it in the PRD's `## Decisions Proposed (Pending Approval)` section.
   - `Agent-Recommended` decisions belong in `Decisions Proposed (Pending Approval)` or the output unless low-risk enough to reclassify as `Agent-Owned`.
6. If PRD changes affect scope, slice ordering, or acceptance criteria and `sessions/<slug>/<slug>-next-steps.md` exists, propose a second "NOT APPLIED" patch for checklist alignment only. If the checklist is missing, recommend `/prd-breakdown <slug>` instead.

## Output format

Keep the return terse and delta-focused. Omit empty sections.

- Findings
- Unsupported assumptions / evidence gaps
- `Agent-Recommended` / `Needs User Approval` decisions
- Questions
- Proposed patch (NOT APPLIED)
- Checklist alignment patch (NOT APPLIED), if triggered by step 6
