---
name: task-add
description: Add a new checklist task and matching slice plan
argument-hint: <workstream-slug> "<task title>" [now|next|later]
---

Add a new task slice that follows the repo workflow:

- one new checklist item in `sessions/<slug>/<slug>-next-steps.md`
- one new slice plan file at `sessions/<slug>/<slug>-<NN>-<slice-title>.md`

Unlike `/task-propose`, this skill edits files.

## Critical Rules

1. **Exactly one plan file and one checklist item.** Do not create multiple files or items.
2. **Stage 1 stubs only.** Do not lock product, architecture, schema, external-contract, reliability, or pattern-breaking decisions in task creation. Put meaningful tradeoffs in `Open Questions` or `Notes for Refinement`.
3. **Slice-scoped plans only.** Do not restate the full feature architecture inside `System Components (Slice View)` or `System Flow (Slice Flow)`.

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

## Steps

1. Validate arguments.
2. Read:
   - `AGENTS.md` and `docs/decision-authority.md`
   - `sessions/<slug>/<slug>-next-steps.md`
   - `sessions/<slug>/<slug>-prd.md` (if present)
   - `sessions/<slug>/context.md` and `sessions/<slug>/decision-log.md` (if present)
3. Find the next available `<NN>` from `sessions/<slug>/<slug>-[0-9][0-9]-*.md`.
4. Resolve the new plan path: `sessions/<slug>/<slug>-<NN>-<slice-title>.md`.
5. Create the plan file using `docs/templates/implementation-plan-template.md` as the content baseline. Update placeholders:
   - `# <Workstream>: <slice title>` -> `# <Workstream>: <task title>`
   - `**Last updated:** <YYYY-MM-DD>` -> today
   - `**Tracked by:** ...` -> `sessions/<slug>/<slug>-next-steps.md`
   - Seed a Stage 1 slice stub by filling what is already known for:
     - `Why This Slice Exists`
     - `PRD Traceability`
     - `Objective`
     - `Scope`
     - `System Components (Slice View)`
     - `System Flow (Slice Flow)`
     - `Inputs / Outputs (Known So Far)`
     - `Dependencies`
     - `Open Questions`
     - `Risks / Unknowns`
     - `Implementation Plan`
     - `Initial Acceptance Shape`
   - Leave refinement-stage sections in placeholder form for `/refine-plan`.
   - Classify decisions per `docs/decision-authority.md`. Use `Agent-Owned` defaults only for low-risk details; put meaningful tradeoffs in `Open Questions`.
   - When no exact repo pattern exists, seed the smallest local, reversible, testable best-practice approach as a refinement note.
6. Add one checklist item under the selected section in `sessions/<slug>/<slug>-next-steps.md`:
   - Add the stage legend near the top if it does not already exist
   - Prefix the task with `newly discovered:`
   - Include:
     - `Stage: Stub`
     - `Scope: TBD`
     - `Depends on: TBD`
     - `Acceptance:` with 2-5 `TBD` checks
     - `Validation:` with 1-2 observable outcomes or `TBD during refine-plan`
     - `Links:` with the new plan file path and best-effort PRD reference if known
7. Validate before reporting:
   - [ ] Exactly one plan file created (Critical Rule #1).
   - [ ] Checklist item links to the new plan file path.
   - [ ] Plan is a Stage 1 stub — no decisions locked (Critical Rule #2).
   - [ ] Plan is slice-scoped — no full feature architecture restated (Critical Rule #3).
   If any check fails, fix the issue before reporting.
8. Print the created plan path and remind the user to run: `/refine-plan <slug> <NN>`
