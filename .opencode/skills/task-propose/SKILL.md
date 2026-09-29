---
name: task-propose
description: Propose adding a new checklist task + slice plan (NOT APPLIED patch)
argument-hint: <workstream-slug> "<task title>" [now|next|later]
---

Propose (but do not apply) a new task slice that follows the repo workflow:

- one new checklist item in `sessions/<slug>/<slug>-next-steps.md`
- one new slice plan file at `sessions/<slug>/<slug>-<NN>-<slice-title>.md`

This skill is read-only. It must output a single apply_patch-ready patch labeled "NOT APPLIED".

## Critical Rules

1. **Read-only.** Do not modify files. Propose all changes as a single "NOT APPLIED" patch.
2. **Exactly one plan file and one checklist item per patch.** Do not create multiple files or items.
3. **Stage 1 stubs only.** Do not lock product, architecture, schema, external-contract, reliability, or pattern-breaking decisions. Put meaningful tradeoffs in `Open Questions` or `Notes for Refinement`.
4. **Slice-scoped plans only.** Do not restate the full feature architecture inside `System Components (Slice View)` or `System Flow (Slice Flow)`.

## Input

- Required: `<workstream-slug>`
- Required: `<task title>` (quoted)
- Optional: section `now|next|later` (default: `next`)

## Preconditions

- `sessions/<slug>/<slug>-next-steps.md` must exist.
  - If missing, stop and recommend: `/prd-breakdown <slug>`

## Slice numbering

- Slice IDs are append-only and stable.
- Compute the next `<NN>` by scanning existing `sessions/<slug>/<slug>-[0-9][0-9]-*.md` and using `max + 1`.
- If no existing slices exist, start at `01`.

## Slice title

- Convert the task title to a safe kebab-case `<slice-title>`.
- Only allow `[a-z0-9-]` in the filename.
- Collapse multiple hyphens; trim hyphens.

## Collision rules

- If the resolved plan filename already exists, stop and ask the user to adjust the task title.
- Do not auto-suffix filenames.

## Optional PRD enrichment

- If `sessions/<slug>/<slug>-prd.md` exists, read it and suggest a best-effort PRD reference line.
- If missing, leave `PRD References` as `TBD`.

## Steps

1. Validate arguments.
2. Read:
   - `AGENTS.md` and `docs/decision-authority.md`
   - `sessions/<slug>/<slug>-next-steps.md`
   - `sessions/<slug>/<slug>-prd.md` (if present)
   - `sessions/<slug>/context.md` and `sessions/<slug>/decision-log.md` (if present)
3. Find the next available `<NN>` from `sessions/<slug>/<slug>-[0-9][0-9]-*.md`.
4. Resolve the new plan path: `sessions/<slug>/<slug>-<NN>-<slice-title>.md`.
5. Ask only targeted questions needed to bound the Stage 1 stub or surface `Needs User Approval` decisions. Do not ask for low-risk `Agent-Owned` details. Examples:
   - What is the scope (config/src/policies/deployments/docs/infra)?
   - Any dependencies (which slice must be done first)?
   - What is the initial acceptance shape (2-5 high-level checks)?
   - What open question or risk should be preserved in the stub?
   If the user does not answer, proceed with `TBD` placeholders.
   Classify decisions per `docs/decision-authority.md`. Use `Agent-Owned` defaults only for low-risk details; put meaningful tradeoffs in `Open Questions`.
   When no exact repo pattern exists, seed the smallest local, reversible, testable best-practice approach as a refinement note.
6. Validate before outputting:
   - [ ] No files modified (Critical Rule #1).
   - [ ] Patch contains exactly one plan file and one checklist item (Critical Rule #2).
   - [ ] Plan is a Stage 1 stub — no decisions locked (Critical Rule #3).
   - [ ] Plan is slice-scoped (Critical Rule #4).
   If any check fails, fix the issue before outputting.
7. Output:
   - The resolved paths and `<NN>`
   - A single apply_patch-ready patch labeled "NOT APPLIED" that:
     - adds the plan file seeded from `docs/templates/implementation-plan-template.md` as a Stage 1 slice stub
     - adds the checklist stage legend if it is missing
     - adds exactly one checklist item under `## Now`/`## Next`/`## Later` in `sessions/<slug>/<slug>-next-steps.md`, prefixed with `newly discovered:` and including `Stage`, `Scope`, `Depends on`, `Acceptance`, `Validation`, and `Links`
   - Instruct the user to say: "Apply the proposed patch"

## Output requirements

- The patch must be syntactically correct for the `apply_patch` tool.
- The patch must not modify any other files.
