---
name: implement-slice
description: Implement one refined slice plan, verify it, and return a workflow result
argument-hint: <workstream-slug> <NN>
---

Implement exactly one slice. This skill is called by `slice-workflow` step 4 and
does not read, create, or modify workflow state files.

## Critical Rules

1. Resolve the workspace, `sessions/`, and matching session directory before
   globbing only `sessions/<slug>/<slug>-<NN>-*.md`. Reject lexical or resolved
   paths outside the matching session root. An in-root symlink is allowed only
   when repository conventions permit it and its resolved target is authorized.
   Never choose among multiple plans.
2. Read the resolved plan, applicable `AGENTS.md`, and
   `docs/decision-authority.md` before editing. Read every source the plan names
   as required evidence.
3. Capture baseline `git status --short`, staged and unstaged diffs, relevant
   untracked files, prospective targets, and the plan's required verification
   commands. Git commands are inspection-only: never commit, stage, reset,
   restore, checkout, rebase, stash, clean, or otherwise mutate git state.
4. Implement only locked, evidence-backed, or `Agent-Owned` decisions. Never
   implement an unresolved `Needs User Approval` decision. Preserve unrelated,
   staged, unstaged, untracked, and intervening work.
5. Run every mandatory plan verification command and fix only slice failures.
   Report each command, working directory, exit result, and any rerun. A skipped
   mandatory command cannot support a successful result.
6. Re-read every edited target and inspect final diffs. Classify every final
   path and hunk as preexisting, authorized, intervening, unexpected, or
   uncertain. Preserve unexpected or uncertain content and return `FAILED`.
7. An unresolved user-owned product, clinical, privacy, external-contract,
   reliability, destructive, or precedent-setting decision is a user blocker;
   do not implement it. An unresolved operational, command, credential, or
   environment failure is an operational failure.
8. Do not invoke another agent or load any skill other than this one.

## Inputs

Accept exactly `<slug> <NN>`. Normalize `NN` to two digits. Reject empty values,
path separators, traversal, or malformed numbers before constructing a path.

Plan resolution outcomes:

- Multiple matches: list every candidate, ask the user to choose, include
  `Resume step: 4`, then return `NEEDS_USER`.
- Zero matches: report the attempted glob. Return `NEEDS_USER` with
  `Resume step: 4` only when the current context establishes that the user can
  identify or provide the missing plan; otherwise return `FAILED`.
- Filesystem access failure: return `FAILED`.

## Execution

1. Map each proposed edit and verification command to the resolved plan before
   changing files. Re-read each target immediately before editing. If an
   intervening target change cannot be reconciled, ask one question, include
   `Resume step: 4`, and return `NEEDS_USER`.
2. Implement only the authorized scope. Re-read every changed file after editing
   and run the plan's mandatory verification commands. Record commands, working
   directories, exit results, fixes, and rerun results.
3. Capture final status, staged and unstaged diffs, and relevant untracked files.
   Reconcile each final path and hunk against the baseline. Unexpected or
   uncertain deltas must be preserved and return `FAILED`; never revert them.
4. For a user-owned decision, ask once, include `Resume step: 0`, and return
   `NEEDS_USER`. For an operational failure, return `FAILED`. Otherwise return
   `CLEAN` only after all mandatory verification passes.

## Results

Report actual work, changed files, verification, failures, and blockers. End
with exactly one final nonblank line:

- `WORKFLOW_RESULT: CLEAN` when implementation and all mandatory verification
  succeeded and every resulting change is authorized or preexisting.
- `WORKFLOW_RESULT: NEEDS_USER` when a user-owned decision or an unambiguous
  plan-selection issue blocks safe progress. Before the footer, include exactly
  `Resume step: 0` for a user-owned decision or `Resume step: 4` for plan
  selection. Ask the minimum question once.
- `WORKFLOW_RESULT: FAILED` for operational failures, unavailable mandatory
  evidence, failed required verification, unexpected or uncertain deltas, or an
  invalid invocation.

Do not emit `CHANGED`, `ADVISORY`, `PATCH_READY`, or `REMEDIATE`.
