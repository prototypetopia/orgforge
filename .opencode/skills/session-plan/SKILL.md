---
name: session-plan
description: Generate an implementation-ready next-step plan for a named workstream
argument-hint: <workstream-slug>
---

Create a concrete implementation plan for the next work chunk of an existing workstream.

## Input

- Required argument: `<workstream-slug>`

## Required context files

- `sessions/<slug>/context.md`
- `sessions/<slug>/latest.md`
- `sessions/<slug>/decision-log.md`

If these files are missing, stop and recommend: `pnpm context:new -- <slug>`

## Critical Rules

1. **Do not implement changes.** This skill produces a plan only. Do not edit code, infrastructure, or implementation files.
2. **Do not drop active Now tasks.** Previously active `Now` tasks stay unless explicitly cancelled by the user.
3. **Do not recommend implementation for unresolved decisions.** If a task has unresolved `Needs User Approval` decisions, recommend refinement or approval first.

## Plan sources

Read the following in order:

1. `AGENTS.md`, `TESTS.md`, and `docs/decision-authority.md`.
2. Required context files above.
3. Master workstream checklist:
   - Prefer `sessions/<slug>/<slug>-next-steps.md`
   - If no exact match, read files matching `sessions/<slug>/<slug>-*.md` and state your choice.
4. Additional related plan files from `sessions/<slug>/` (up to 5).

Treat the master workstream checklist as canonical for task state.

## Output goals

Produce a concise but implementation-ready plan for the next session. Address all 5 sections:

1. **Selected execution chunk**
   - 1 to 3 tasks to execute next.
   - Why this chunk is highest leverage now.
   - Prefer slices that have already been refined into implementation-grade specs.
   - If the highest-priority slice is still only a Stage 1 stub, say so explicitly and recommend `/refine-plan <slug> <NN>` before implementation.
   - Treat checklist `Stage` as a selection signal: prefer `Refined`, avoid choosing `Stub` items for direct implementation unless the work chunk is to refine them.

2. **Task breakdown**
   - For each selected task:
     - scope (config/src/policies/deployments/docs/infra)
     - exact files likely to change
     - acceptance criteria
     - validation approach

3. **Risk and dependency check**
   - blocking dependencies
   - migration/cutover concerns
   - data/compatibility risks
   - any `Agent-Recommended` or `Needs User Approval` decisions that should be resolved before implementation

4. **Drift report**
   - identify any mismatch between master checklist state and related plan statuses (`Planned|In Progress|Implemented|Superseded`)
   - suggest exact status/header updates to reconcile

5. **Suggested commit slicing**
   - propose 1-3 logical PR/commit slices
   - include short commit title suggestions

When no exact repo pattern exists for a recommended approach, prefer the smallest local, reversible, testable best-practice option — unless the choice creates broad precedent or changes product, privacy/compliance, external-contract, or reliability semantics.

## Validate before reporting

- [ ] All 5 output sections addressed (or explicitly noted as not applicable).
- [ ] Stage-awareness applied: no `Stub` items selected for direct implementation without noting it.
- [ ] No `Needs User Approval` items recommended for direct implementation (Critical Rule #3).

If any check fails, fix the issue before reporting.

## Optional follow-up

Only when the user explicitly requests it, update `sessions/<slug>/<slug>-next-steps.md` by:

- moving completed tasks to `Done`
- adding newly discovered tasks to `Now`/`Next`
- preserving existing tasks unless explicitly cancelled

If proposing a new task not in plans, mark it as "newly discovered."
