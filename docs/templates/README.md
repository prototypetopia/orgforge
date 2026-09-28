# Templates

Use these templates to preserve context across long implementation sessions.

## Files

- `context-master-template.md`
  - Long-lived source of truth for a workstream.
- `session-handoff-template.md`
  - Rolling summary for the next session only.
- `workstream-next-steps-template.md`
  - Action checklist with `Now/Next/Later/Done` plus per-item stage metadata.
- `implementation-plan-template.md`
  - Detailed implementation plan with lifecycle headers.
- `decision-log-template.md`
  - Structured record of major decisions and tradeoffs.
- `bootstrap-prompt-template.md`
  - Prompt text to start a new session from saved context.
- `prd-template.md`
  - Product requirements document template for
    `sessions/<slug>/<slug>-prd.md`.
- `prd-decomposition-template.md`
  - Source coverage and dependency index used when a project-level PRD is
    decomposed into multiple workstreams.

## Recommended Workflow

1. For a project-level PRD, optionally create a decomposition index and child
   workstreams with `/prd-decompose <source-prd-path>`.
2. Create a workstream context doc from `context-master-template.md` when it
   was not created by decomposition.
3. Create or update a PRD from `prd-template.md`.
4. Create a next-steps checklist from `workstream-next-steps-template.md`.
5. At end of each session, update a handoff file from
   `session-handoff-template.md`.
6. Record any major decision in a decision log entry.
7. Start next session with the bootstrap prompt template and paths to your
   context docs.

## Plan Status Lifecycle

For detailed implementation plans, use these status values consistently:

- `Planned`
- `In Progress`
- `Implemented`
- `Superseded`

Keep `sessions/<slug>/<slug>-next-steps.md` as the canonical
task-state source, and reconcile related plan statuses during session save.

## Suggested Naming

Self-contained folder per workstream:

- `sessions/<slug>/context.md`
- `sessions/<slug>/decision-log.md`
- `sessions/<slug>/latest.md`
- `sessions/<slug>/<slug>-prd.md`
- `sessions/<slug>/<slug>-next-steps.md`
- `sessions/<slug>/<slug>-<NN>-<slice-title>.md`

Project-level decomposition artifacts (not workstreams):

- `sessions/<parent-slug>-prd-decomposition.md`
- `sessions/<parent-slug>-source-prd.md` (verbatim source snapshot)
