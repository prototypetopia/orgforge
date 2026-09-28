---
name: session-overview
description: Sessions, workstreams, overview, progress, next to work on. Use when you want a concise cross-session summary of status, readiness, blockers, and the best workstream to continue next.
---

Produce a concise portfolio-level summary across all canonical workstreams in `sessions/`.

## Goal

Help the user decide what to continue next without making them read every session in detail.

## Critical Rules

1. **Do not implement or edit anything.** This skill is summary-only.
2. **Stay shallow by default.** Prefer canonical handoff/progress files over PRDs and slice plans.
3. **Do not treat placeholders as real progress.** Template content like `<bullet>`, `<task>`, `<question>`, or `<...>` means the handoff is not usable.
4. **Treat `*-next-steps.md` as canonical progress when present.** If it conflicts with `latest.md`, call out the drift briefly.
5. **Missing checklist/PRD files are normal.** Do not treat missing `*-next-steps.md` or PRD files as errors.
6. **Keep the output concise.** The user should be able to scan it quickly.

## Canonical workstream discovery

- Discover workstreams only from `sessions/*/context.md`.
- For each discovered slug, prefer these files in this order:
  1. `sessions/<slug>/latest.md`
  2. `sessions/<slug>/<slug>-next-steps.md` when present
  3. `sessions/<slug>/context.md` when status/objective needs clarification
- Only read PRDs or slice plans when the next action is ambiguous after reading the files above.

## What to extract per workstream

For each workstream, extract only the highest-signal fields:

- last updated date
- current state: completed / in progress / blocked / none
- top next action
- blocker or gate, if any
- validation confidence (`green`, `partial`, `not run`, or `n/a`)
- progress maturity:
  - `Ready now` - clear next action, not blocked
  - `Near closeout` - mostly done, low-effort finish remains
  - `Planning ready` - PRD/context ready, next step is breakdown/refinement
  - `Blocked` - waiting on operator, deploy, approval, or external dependency
  - `Template/inactive` - placeholder handoff or no usable actionable state

## Ranking heuristics

When choosing what to recommend next, prefer:

1. workstreams with a clear next task and no blocker
2. `Refined` or closeout work over `Stub` work
3. active implementation work over brand-new planning work
4. high-leverage sessions with explicit next commands or file references

Deprioritize:

- template-only sessions
- sessions blocked on external/operator action
- sessions whose only next tasks are vague or still placeholders

If the best candidate is blocked, say so and recommend the best unblocked fallback.

## Required output

Produce exactly these sections:

1. **Portfolio Snapshot**
   - total workstreams
   - count by maturity bucket (`Ready now`, `Near closeout`, `Planning ready`, `Blocked`, `Template/inactive`)

2. **Best Next Bets**
   - recommend up to 3 workstreams
   - for each, include:
     - slug
     - 1 short reason
     - the immediate next action
     - 1 to 2 file references

3. **Workstream Matrix**
   - one line per workstream
   - keep each line compact using this shape:
     - ``<slug> | <maturity> | updated <date> | next: <short action> | risk: <short blocker/state>``
   - sort by usefulness to the user:
     1. `Ready now`
     2. `Near closeout`
     3. `Planning ready`
     4. `Blocked`
     5. `Template/inactive`

4. **Recommended Immediate Action**
   - give one clear recommendation
   - include the exact next command when obvious, for example:
     - `/session-resume <slug>`
     - `/prd-breakdown <slug>`
     - `/refine-plan <slug> <NN>`

## Conciseness limits

- Keep the portfolio snapshot to 5 bullets or fewer.
- Keep each recommendation to 2 lines or fewer.
- Keep the matrix to 1 line per workstream.
- Do not dump long task lists, decision logs, or PRD details.
- If more detail is needed for a specific workstream, recommend `/session-resume <slug>`.

## Variation tolerance

Handle these common variations without failing:

- `Open Questions` vs `Unresolved Questions`
- `Summary of What Changed` vs `Summary of Changes This Session`
- empty sections like `(empty)` or `_(empty)_`
- `Done`, `Implemented`, `Shipped`, or `Completed`
- workstreams with `latest.md` but no checklist

If a workstream is clearly a template or stale scaffold, label it `Template/inactive` instead of trying to infer detailed status.
