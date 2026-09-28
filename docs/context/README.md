# Context Docs (moved)

Workstream context used to live here as a flat folder of per-workstream files.
It now lives in self-contained folders under `sessions/<slug>/`, one folder per
workstream, holding context + PRD + plan files together.

## Where to find things

- **Active workstreams** — `sessions/<slug>/` (one folder per workstream)
  - `context.md` — long-lived source of truth
  - `decision-log.md` — decision history
  - `latest.md` — rolling handoff for the next session
  - `<slug>-prd.md` — PRD
  - `<slug>-next-steps.md` — master checklist
  - `<slug>-<NN>-<slice-title>.md` — slice plan files

- **Project PRD decomposition indexes** —
  `sessions/<parent-slug>-prd-decomposition.md` (not workstreams themselves)
- **Project PRD source snapshots** — `sessions/<parent-slug>-source-prd.md`
  (verbatim evidence captured during decomposition)

- **Naming convention** — [`docs/templates/README.md`](../templates/README.md)
- **Workflow and commands** — [`docs/development-flow.md`](../development-flow.md)
- **Template source** — [`docs/templates/`](../templates/)

## Starting a new workstream

If a large PRD describes several independent capabilities, first run
`/prd-decompose <source-prd-path>`. It creates a coverage index plus the full
context, decision log, handoff, and PRD scaffold for every child workstream. It
also stores a repository-local source snapshot and can resume a matching
`In Progress` run. Continue each dependency-ready child with
`/refine-prd <child-slug>` only after the index reports `Status: Complete`.

Workstreams created without `/prd-decompose` do not require a parent PRD or a
`## Source PRD` section.

Run one of:

- `/session-init <slug>` — scaffolds the 3 core files (context, decision log,
  session handoff) under `sessions/<slug>/` and prints a bootstrap prompt.
- `/session-init-from-project <slug>` — same as `/session-init`, but also seeds
  the new context from all existing canonical workstreams.

From there, use `/prd <slug>` → `/prd-breakdown <slug>` → `/session-plan <slug>`
to build out the PRD, break it into slices, and pick the next work chunk. See
`docs/development-flow.md` for the full command loop.
