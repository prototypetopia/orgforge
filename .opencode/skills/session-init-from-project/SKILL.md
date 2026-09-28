---
name: session-init-from-project
description: Initialize a new workstream context from all canonical project sessions
argument-hint: <workstream-slug>
---

Initialize a new named workstream under `sessions/<slug>/` and seed it with context gathered from all existing canonical workstreams in this repository.

## Input

- Required argument: `<workstream-slug>`
- Slug format: kebab-case (letters, numbers, hyphens)

## Critical Rules

1. **Do not create PRDs or plans.** Do not create or update `sessions/<slug>/<slug>-prd.md` or slice plans in this skill.
2. **Do not lock inherited decisions.** Candidate decisions from source workstreams are labeled as candidates, not locked decisions for the new workstream.
3. **Decision-log is append-only.** Do not add inherited or candidate decisions to `sessions/<slug>/decision-log.md` unless a new decision is explicitly made.
4. **Only run `pnpm context:new` via bash.** Do not run other commands beyond file reads and globs.

## Canonical workstream discovery

- Discover workstreams only from `sessions/*/context.md`.
- For each discovered slug, treat these as canonical related files:
  - `sessions/<slug>/context.md`
  - `sessions/<slug>/decision-log.md`
  - `sessions/<slug>/latest.md`
  - `sessions/<slug>/<slug>-prd.md`
  - `sessions/<slug>/<slug>-next-steps.md`
  - `sessions/<slug>/<slug>-[0-9][0-9]-*.md`
- Ignore non-canonical files that do not match the conventions above.

## Steps

1. Validate `<workstream-slug>` is present.
2. If `sessions/<slug>/context.md` already exists, stop and ask the user to either use `/session-resume <slug>` or choose a new slug.
3. Run:
   ```bash
   eval "$(fnm env --use-on-cd --shell bash)" && pnpm context:new -- <workstream-slug>
   ```
   If the command fails, report the error and stop.
4. Verify the files were created:
   - `sessions/<slug>/context.md`
   - `sessions/<slug>/decision-log.md`
   - `sessions/<slug>/latest.md`
   If any file is missing, report which ones and stop.
5. Discover all existing canonical workstreams from `sessions/*/context.md`, excluding the new slug.
6. Read all canonical files for each discovered workstream when present.
7. Synthesize project context for the new workstream. Extract project-wide patterns that appear in 2+ workstreams or are clearly repository-level constraints:
   - recurring architecture patterns
   - constraints that appear project-wide
   - relevant implementation lessons
   - validation habits and recurring gaps
   - candidate decisions worth considering for the new workstream
8. Update `sessions/<slug>/context.md` with these sections:
   - `## Objective` — leave a short placeholder if the user has not defined one yet
   - `## Scope` — `In: TBD` / `Out: TBD`
   - `## Current Architecture` — write only reusable project patterns, not a copy of one source workstream's architecture
   - `## Constraints` — include only clearly recurring constraints from the discovered workstreams
   - `## Source Workstreams` — list every discovered canonical slug with key paths
   - `## Reusable Context` — summarize shared patterns, implementation lessons, and validation norms
   - `## Candidate Inherited Decisions` — list decisions from existing workstreams that may apply here; mark them as candidates, not locked decisions
   - `## Cross-Workstream Risks / Gaps` — summarize repeated risks or missing validation patterns
   - `## Open Questions For PRD` — list unresolved questions for `/prd <slug>` to address or preserve as `TBD`
   - `## Locked Decisions` — leave empty unless the new workstream already has explicitly confirmed decisions
   - `## Related Docs` — include the new PRD path and source workstream references
9. Update `sessions/<slug>/latest.md` with a bootstrap handoff that:
   - explains the context was seeded from all canonical workstreams
   - lists the discovered source workstreams
   - sets `Next 3 Tasks` to:
     1. run `/prd <slug>`
     2. run `/refine-prd <slug>`
     3. run `/prd-breakdown <slug>` after the PRD is approved
   - sets validation fields to `not run`
10. Validate before reporting:
    - [ ] All 11 context.md sections from step 8 are populated or explicitly TBD.
    - [ ] Candidate decisions are labeled as candidates, not locked (Critical Rule #2).
    - [ ] Decision-log not modified beyond its initial state (Critical Rule #3).
    - [ ] latest.md bootstrap handoff written with next tasks.
    If any check fails, fix the issue before proceeding.
11. Print the created files, discovered source workstreams, and recommend the next command: `/prd <slug>`

## Output

- Confirm created files.
- List discovered canonical source workstreams.
- Summarize the reusable context that was seeded.
- Recommend the next command.
