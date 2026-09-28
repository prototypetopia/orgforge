---
name: prd
description: Generate or update a PRD for a workstream at sessions/<slug>/<slug>-prd.md
argument-hint: <workstream-slug>
---

Generate or update a PRD for a feature/workstream.

## Input

- Required argument: `<workstream-slug>` (kebab-case).
  If missing, stop and ask for it.

## Hard Rules

These override all other instructions in this skill:

1. **Never silently import source-workstream scope.** Source workstreams
   provide supporting context only — they cannot lock target-scope
   requirements, contracts, or decisions.
2. **Stop and ask on conflicts.** If target context, decision log, existing
   PRD, decomposition index/parent snapshot, or source workstreams conflict on
   scope or locked decisions, stop and ask the user before updating affected
   sections.
3. **Existing PRD text is not evidence for itself.** If an existing PRD
   contains an unsupported claim outside your edit scope, leave it unchanged
   but flag it in output.
4. **Do not write code.** This skill produces documentation only.
5. **Do not create task plans.** Use `/prd-breakdown <slug>` for that.
6. **Honor decomposition provenance.** A complete decomposition index and
   parent snapshot listed under the target context's exact `## Source PRD`
   heading are direct evidence only for index rows mapped to the target child.
   Do not import sibling scope from the parent.
7. **Constrained checksum use.** The shell may only run
   `sha256sum -- <parent-snapshot-path>` when validating decomposition
   provenance. Do not run the shell for parentless workstreams or any other purpose.

## Instruction Priority

When instructions conflict, follow this order:

1. Hard Rules (above)
2. Evidence grounding (detailed rules in step 4)
3. Decision classification (detailed rules in step 4)
4. Pattern selection (detailed rules in step 4)
5. KISS/YAGNI — smallest conventional design
6. Prose style — dated entries, `TBD` usage, implementation detail

## Conventions

- PRD path: `sessions/<slug>/<slug>-prd.md`
- Required context path: `sessions/<slug>/context.md`

## Steps

### 1. Validate prerequisites

- Confirm `<workstream-slug>` is provided. If missing, stop and ask.
- Check that `sessions/<slug>/context.md` exists. If missing, stop and
  recommend `/session-init <slug>` (or `/session-init-from-project <slug>`
  for project-seeded context).
- If `sessions/<slug>/<slug>-prd.md` is missing, require
  `docs/templates/prd-template.md`. If the template is missing, stop and report
  it instead of attempting create mode.

### 2. Read context (fixed order)

Read all of the following. If a file does not exist, note its absence and
continue.

1. `AGENTS.md`
2. `TESTS.md`
3. `docs/decision-authority.md`
4. `docs/templates/prd-template.md` (only when creating a new PRD)
5. `sessions/<slug>/context.md` (required — already validated)
6. `sessions/<slug>/decision-log.md`
7. `sessions/<slug>/latest.md`
8. `sessions/<slug>/<slug>-prd.md`
9. `sessions/<slug>/<slug>-next-steps.md`
10. `sessions/<slug>/<slug>-[0-9][0-9]-*.md` (glob; if more than 10
    matches, read only the 5 most recent by filename sort)

If `context.md` contains a section with the exact heading `## Source PRD`:

1. Read the labeled `Parent snapshot`, `Decomposition index`, and
   `Child mapping` values.
2. Require the child mapping to equal `<slug>` and the index to declare
   `Status: Complete`. If a value is missing, mismatched, unreadable, or the
   index is incomplete, stop and report the provenance failure.
3. Verify the index manifest contains this child and these canonical paths.
4. Compute the parent snapshot SHA-256 with the allowed command and require it
   to match `Source SHA-256` in the index. Stop on a mismatch.
5. Treat a parent claim as target evidence only when its coverage row names
   `<slug>` as primary owner or secondary workstream. A path alone is not
   evidence that the claim belongs to this child.

Use Glob/Grep to find and read the smallest relevant existing
implementation or documented repo constraint before validating an
implementation-sensitive claim or classifying a decision as
repo-pattern-derived or pattern-breaking.

### 2a. Read source workstreams (conditional)

If `context.md` contains a section with the exact heading
`## Source Workstreams`, read these files for each listed slug (if present):
`context.md`, `decision-log.md`, `latest.md`, `<source-slug>-prd.md`,
`<source-slug>-next-steps.md`, `<source-slug>-[0-9][0-9]-*.md`.

Skip if no `## Source Workstreams` heading found. Use as supporting context
only (Hard Rule 1). Source-workstream evidence can strengthen shared
constraints and open questions but cannot lock target-scope requirements
or decisions.

### 3. Determine mode

- If `sessions/<slug>/<slug>-prd.md` exists → **update mode**: preserve
  stable sections, make minimal edits.
- If missing → **create mode**: use `docs/templates/prd-template.md` as
  skeleton.

### 4. Plan PRD content (do not write yet)

**Structure:** Use the heading structure from `docs/templates/prd-template.md`.

**Prose style:** Use dated entries in `Decisions Locked` (e.g.,
`- YYYY-MM-DD <decision, with evidence>`), concrete implementation-oriented
detail, and `TBD` for genuinely unknown fields.

**Decision classification** (per `docs/decision-authority.md`):

- `Decisions Locked`: user-approved decisions + low-risk `Agent-Owned`
  decisions that follow repo patterns verified in this run. Keep aligned
  with target-context locked decisions and decision log.
- `Decisions Proposed (Pending Approval)`: `Agent-Recommended` or
  `Needs User Approval` decisions, including choices that would deviate
  from or replace an existing pattern. Include a one-line rationale each.
- Never place `Agent-Recommended` decisions in `Decisions Locked`. Place
  them in `Decisions Proposed` or `Open Questions`.
- Lock a decision as repo-pattern-derived only when the relevant repo
  constraint or implementation pattern was read in this run.

**Evidence grounding** (per `docs/decision-authority.md`):

Every material claim (scope, behavior, contracts, data shapes, auth,
validation) must cite its source: user input, a mapped parent-snapshot row in a
complete decomposition index, locked decision, decision-log entry, `AGENTS.md`,
or read implementation pattern. Place unsupported claims in `Open Questions`
or mark `TBD`. Derive all product behavior, data fields, status values, and
integration boundaries from evidence.

**Pattern selection:**

1. Preserve an established repo pattern when read evidence verifies target-platform support.
2. When no exact pattern exists, adapt the closest adjacent repo pattern.
3. If no repo pattern applies, use the smallest conventional design that is local, reversible, additive, testable, and aligned with `AGENTS.md` / `TESTS.md` / KISS/YAGNI.
4. Lock only when low-risk enough to be `Agent-Owned`; otherwise list as `Agent-Recommended`.
5. During migrations/refactors, default to preserving existing behavior.
6. Verify target-platform support before removing or weakening an established pattern.
7. When an adjacent pattern is more complex than needed, flag the choice as `Agent-Recommended` rather than silently simplifying.

### 5. Validate before writing

Before writing the file, verify all of the following. If any check fails, stop and report the failure before writing.

- [ ] No proposed/recommended decisions appear in `Decisions Locked`.
- [ ] Every locked decision cites evidence read in this run.
- [ ] No source-workstream-only scope leaked into target requirements.
- [ ] No sibling-only parent scope leaked into target requirements.
- [ ] Every decomposition row with disposition `Child` or `Shared` and
      classification `Locked` or `Pending` that maps to this child is
      represented in the target PRD.
- [ ] No conflicts exist between context.md, decision-log, existing PRD,
      decomposition index, and parent snapshot. If conflicts found, stop and
      ask per Hard Rule 2.
- [ ] `TBD` is used only for genuinely unknown fields, not as a placeholder
      for decisions you could classify.
- [ ] PRD heading structure matches `docs/templates/prd-template.md`.
- [ ] In create mode, plan includes adding PRD path to `Related Docs` in
      context.md.

### 6. Write the PRD

- **Create mode:** Write `sessions/<slug>/<slug>-prd.md` from template.
  Add `sessions/<slug>/<slug>-prd.md` under `Related Docs` in
  `sessions/<slug>/context.md`. If `Related Docs` is missing, create it
  while preserving the existing context structure.
- **Update mode:** Edit `sessions/<slug>/<slug>-prd.md` in place. Keep
  updates minimal; preserve stable sections.

### 7. Report results

Before reporting, confirm the written PRD still passes the step 5 checklist.

End your response with all of the following:

1. **Action taken:** Whether the PRD was created or updated.
2. **Files read:** List all files read (note any that were absent).
3. **Files changed:** List files written or edited.
4. **Unresolved unknowns:** Fields or questions that still need user input.
5. **Decisions & evidence gaps:** Unsupported claims and agent-recommended
   decisions found during the update. For each, classify as:
   `Agent-Recommended`, `Needs User Approval`, `Needs Repo Evidence`,
   `Candidate/Proposed`, or `Remove Or TBD`. Include claims left untouched
   because they were outside edit scope.
6. **Approval request:** If `Decisions Proposed` is non-empty, present each
   proposed decision and ask the user to approve, reject, or modify. If
   approval is already present in conversation context, move approved
   decisions to `Decisions Locked`. Recommend `/refine-prd <slug>` for a
   full assumption audit when the evidence-gap list is long.
