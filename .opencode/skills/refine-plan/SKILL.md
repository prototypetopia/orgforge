---
name: refine-plan
description: Refine a slice plan without editing; propose a git-compatible unified diff
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

Follow these rules in order:

1. **Read-only targets.** Never modify files. Represent changes only as one
   unapplied unified diff targeting the plan and, only when needed, its referenced
   checklist.
2. **Authorized, traceable evidence.** Lock detail only when supported by a source
   read in this run and permitted by `docs/decision-authority.md`. The plan
   describes its current state but is not evidence for its unsupported claims.
   Record each locked decision or contract using the plan's traceability convention
   or, if none exists, one source path plus relevant section or symbol.
3. **No invented certainty.** Do not invent paths, contracts, fields, ownership,
   boundaries, statuses, migrations, or validation commands. When no repository
   pattern exists, lock a fallback only if it is evidence-backed, local,
   reversible, testable, and `Agent-Owned`; otherwise keep it outside the patch.
4. **Slice and stage safety.** Refine only the target slice; do not redesign the
   whole feature. Preserve existing stage metadata unless governing workflow
   evidence authorizes an update and all applicable readiness checks pass.
5. **Blockers before patches.** If an accessible evidence gap or approval needed
   for implementation leaves authority, behavior, or ownership unresolved, ask
   the minimum related questions in one concise round and emit no patch. An
   inaccessible mandatory source is an operational failure, not a user decision.
6. **Honest patch validation.** Perform every structural check under `Final
   Validation`. The available tools cannot run `git apply --check`; never claim
   that command ran or that its result is known.

## Instruction Priority

When instructions conflict, apply this order:

1. Read-only safety and allowed patch targets.
2. Mandatory source access and applicable repository safety constraints.
3. Evidence grounding and decision authority; never invent locked detail.
4. User-resolvable blockers before any patch.
5. Slice scope, stage preservation, and existing authorized behavior.
6. Applicable implementation-readiness completeness, then minimality.
7. Unified-diff integrity, honest validation, output format, and brevity.

An explicit user request controls choices only within higher-priority safety,
evidence, authority, and scope rules. A footer name never permits claiming that an
unrun validation succeeded.

## Task

Refine one slice plan into the smallest evidence-backed, implementation-ready
specification. Ask only necessary questions. When authorized changes are ready,
propose one standard unified diff the user can approve; optionally align the
referenced checklist in that same patch.

## Inputs

Supported invocations:

- `/refine-plan sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/refine-plan <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing first-argument path; otherwise
glob `sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: report the attempted glob and stop as an operational failure.
- Multiple matches: list all candidates and stop with a plan-selection question.
  Never auto-pick.
- One match: continue.

## Output Format

Return a concise report using only nonempty sections:

- `### Findings`
- `### Unsupported Assumptions / Evidence Gaps`
- `### Decisions` for `Agent-Recommended` or `Needs User Approval` items
- `### Questions`
- `### Patch Validation`
- `### Proposed Patch (NOT APPLIED)`

Immediately before a patch, state:

`Patch authority: Authorized only; authorities: <Agent-Owned and/or User-Approved>; targets: <paths>`

List every authority used and every target path. Put the complete plan and
optional checklist diff in one fenced block. Use standard `diff --git`,
`--- a/...`, `+++ b/...`, and `@@` headers; never use `*** Begin Patch` or
`*** Update File` envelopes. In `Patch Validation`, state that structural review
passed and `git apply --check` was not run due to tool limits.

## Source Material

Always read the complete plan, root `AGENTS.md`, applicable nested `AGENTS.md`
files, and `docs/decision-authority.md`. An inaccessible mandatory source is an
operational failure; do not continue with reduced authority.

Read when applicable:

- The referenced PRD and tracked checklist.
- `sessions/<slug>/context.md`, `sessions/<slug>/decision-log.md`, and referenced
  dependency plans when needed to verify scope, approval, or locked decisions.
- The smallest relevant implementation patterns before locking placement,
  ownership, schemas, statuses, retries, or integration boundaries.
- `TESTS.md`, package scripts, and repository command conventions before locking
  test tiers or verification commands.

Apply authority by subject:

- Applicable `AGENTS.md` files govern KISS/YAGNI, layering, ownership, file
  placement, logging, infrastructure, and established feature patterns.
- `docs/decision-authority.md` governs whether a choice is `Agent-Owned`,
  `Agent-Recommended`, `Needs User Approval`, or `User-Approved`.
- Explicit user decisions, the PRD, checklist, target context, and decision log
  govern approved product behavior and scope.
- Dependency plans govern their already-locked interfaces.
- Current implementation and tests prove existing patterns and behavior; they do
  not independently authorize product changes.

If same-subject authorities conflict, applicable `AGENTS.md` engineering and
safety constraints win over implementation directions. Otherwise do not lock the
choice; classify and route it under `docs/decision-authority.md`.

## Readiness Inventory

Review only facets applicable to the slice:

- scope and requirements: PRD coverage, in/out boundaries, component and flow
  clarity, dependencies, and enabled follow-up slices;
- architecture: pattern reuse, placement, layer ownership, structural choices,
  and integration boundaries;
- each introduced or changed contract: inventory and owner files; field names and
  types; required, optional, nullable, and default semantics; enums or statuses;
  transport, domain, and persistence mapping boundaries; invariants; and
  compatibility or migration behavior;
- verification: each acceptance criterion and applicable runtime, schema,
  integration, edge, failure, and migration risk maps to an outcome-focused
  scenario, authoritative test tier or check, and exact command found in
  `TESTS.md`, package scripts, or repository conventions;
- safety where applicable: destructive-change protection (`protect`,
  `closeOnDeletion`, retain sequencing), layer purity, pinned-provider limits,
  secret handling, and external-contract constraints;
- completeness: likely touchpoints, dependencies, edge cases, failure behavior,
  and enabled follow-up slices.

## Workflow

1. Resolve the plan and read all applicable source material.
2. Assess the plan against the `Readiness Inventory`. Build an internal ledger of
   every new or materially changed decision, contract, path, schema field,
   boundary, stage value, and verification command with its source and authority.
   Preserve correct content and avoid irrelevant sections or boilerplate.
3. Apply authority under `Source Material`. Lock evidence-backed `Agent-Owned`
   choices and explicit `User-Approved` decisions. A recommendation required for
   implementation or any relevant `Needs User Approval` decision invokes Critical
   Rule 5. A nonblocking `Agent-Recommended` choice stays out of dependent patch
   content and may be reported separately.
4. If Critical Rule 5 applies, ask questions and stop. Otherwise draft the
   smallest complete refinement, tightening applicable sections such as:
   - `Contracts / Decisions Locked For This Slice`
   - `Architecture Decisions For This Slice`
   - `Contract Inventory`
   - `Schema Ownership`
   - `Locked Field Definitions`
   - `Type / Schema Touchpoints`
   - `Mapping Boundaries`
   - `Invariants`
   - `Compatibility / Migration Notes`
   - `Likely File Touchpoints`
   - `Implementation Notes`
   - `Verification`
   - `Edge Cases`
   - `Acceptance Criteria`
   Also tighten earlier summary, scope, requirements, and dependency sections when
   evidence shows they are vague, contradictory, or not slice-scoped.
5. If the referenced checklist item is out of sync, align its dependencies,
   outcome-focused validation, and acceptance checks in the same patch. Set
   `Stage: Refined` only under Critical Rule 4.
6. Run `Final Validation`, correct agent-fixable issues in the draft patch or
   report without modifying files, and report.

## Final Validation

Before responding, confirm:

1. The plan and every mandatory and applicable source were read; the internal
   evidence ledger shows that every materially changed locked detail and command
   is authorized and traceable to evidence from this run.
2. No required question, required unresolved recommendation, approval-gated
   choice, or inaccessible mandatory source coexists with a proposed patch;
   nonblocking recommendations do not affect its content.
3. The applicable `Readiness Inventory` is complete without irrelevant
   boilerplate. Every acceptance criterion and applicable risk maps to an
   outcome-focused scenario and authoritative tier or check; every proposed
   command exactly matches a governing source. No code check is claimed executed.
4. Applicable safety, secret-handling, layer-purity, provider-version, access,
   external-contract, and compatibility concerns are addressed from evidence
   rather than templates.
5. A semantic comparison with the current plan preserves every unrelated or
   still-authorized requirement, decision, dependency, acceptance criterion,
   verification obligation, and edge case. If the checklist is included, its
   stage, dependencies, validation outcomes, and acceptance scope agree with the
   plan, and every stage change is authorized.
6. The single patch targets only the plan and optional referenced checklist;
   paths and context match files read in this run, each target appears once,
   standard unified-diff headers are present, forbidden envelopes are absent, and
   nothing was applied.
7. Every hunk is ordered and nonoverlapping; old/new counts match its prefixed
   lines; context and removals match current content; line prefixes and newline
   markers are valid; additions contain only authorized changes; and no prose is
   inside the diff.
8. `Patch Validation` says structural review passed only if items 6-7 passed and
   says `git apply --check` did not run. `PATCH_READY` does not claim external
   application validation.
9. Exactly one result footer is the final nonblank line.

Choose the footer in this order:

1. `WORKFLOW_RESULT: NEEDS_USER` when an accessible evidence gap, plan selection,
   blocker, or approval-gated decision requires a user response.
2. `WORKFLOW_RESULT: FAILED` when an operational failure or inaccessible mandatory
   artifact prevents refinement.
3. `WORKFLOW_RESULT: PATCH_READY` when a substantive authorized patch is present
   and every available structural validation passed.
4. `WORKFLOW_RESULT: ADVISORY` when no patch is present and only nonblocking
   Agent-Recommended guidance remains.
5. `WORKFLOW_RESULT: CLEAN` when no substantive change, blocker, or recommendation
   remains.

Never emit `CHANGED` or any content after the footer.
