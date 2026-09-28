---
name: session-resume
description: Resume a named workstream by loading context, handoff, and plan files
argument-hint: <workstream-slug>
---

Load context for a named workstream and produce a concise resume summary before implementation.

## Input

- Required argument: `<workstream-slug>`

## Required files

- `sessions/<slug>/context.md`
- `sessions/<slug>/latest.md`
- `sessions/<slug>/decision-log.md`

If files are missing, stop and recommend: `pnpm context:new -- <slug>`

## Critical Rules

1. **Do not implement anything.** This skill produces a summary only.
2. **Do not treat pending decisions as locked.** Pending `Agent-Recommended` items and candidate inherited decisions are not locked decisions.

## Steps

1. Read required context files and `docs/decision-authority.md`.
2. Read related plans:
   - `sessions/<slug>/<slug>-prd.md`
   - `sessions/<slug>/<slug>-next-steps.md`
   - `sessions/<slug>/<slug>-[0-9][0-9]-*.md`
   - Include files matching `sessions/<slug>/<slug>-*.md`.
   - Treat `sessions/<slug>/<slug>-next-steps.md` as the canonical progress source.
3. Produce a concise summary. Address all sections:
   - Current status
   - Locked decisions
   - Pending `Agent-Recommended` or `Needs User Approval` decisions
   - Next task to execute now
   - Top risks/gaps
   - Validation state
   - Drift check (if plan statuses conflict with master progress)
4. End by stating one recommended immediate action with explicit file references.

## Output format

- Keep it brief and actionable.
- Include explicit file references for the next action.
