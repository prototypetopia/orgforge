---
name: slice-workflow
description: Orchestrate the full slice pipeline — plan refinement, implementation, review, tests, auditing, and docs
argument-hint: <slug> <NN> | status | advance | back | reset
---

Drive one slice through the full development pipeline. Perform exactly one
explicit command or one pipeline work attempt per invocation. `/loop` may invoke
the skill again only after `LOOP_RESULT: CONTINUE`.

## Critical Rules

1. Invoke at most one mapped role agent and never skip a step except through
   `advance`.
2. State is the source of truth. Validate it before normal use and persist every
   transition through `Persist Transition`. Never guess through invalid state.
3. Protect content outside exact authorized targets. Never commit, stage, or run
   mutating git commands, including `git reset`, `git restore`, `git checkout`,
   `git rebase`, `git stash`, or `git clean`. The sole exception is the parent
   applying a validated step-0 `PATCH_READY` patch exactly as defined below. The
   workflow `reset` command is a separate exact-path state deletion.
4. Never auto-lock or implement an unresolved `Needs User Approval` decision.
   Use repository evidence before asking and durably record approved answers in
   the owning plan, decision log, or code before continuing. Product approval
   does not override this workflow's safety, schema, transition, or output
   contracts.
5. Normalize arguments once. Pass the resulting `slice_arg` unchanged to one
   mapped role agent, accept only a result allowed for the current step, and
   perform only its defined transition.
6. After validation, emit exactly one `LOOP_RESULT` as the final nonblank line.

## Task

Handle exactly one global or slice command, or execute exactly one attempt of the
current pipeline step. The mapped role agent and validated `PATCH_READY`
application are the only modes allowed to mutate non-state repository content.
Canonical state writes are allowed only through `Persist Transition`. Both
non-state modes require verified targets, baseline/final reconciliation, and
preservation of unrelated work. Select one loop status; render it only in
`Final Validation`.

## Instruction Priority

When instructions conflict, apply this order:

1. Execute exactly one command or work attempt and invoke at most one mapped role
   agent.
2. Preserve content outside exact authorized targets. Canonical state changes
   use `Persist Transition`; only a mapped role agent acting within its owner
   skill or parent-owned validated `PATCH_READY` application may mutate non-state
   content. Never commit or stage, and never run a mutating git command outside
   that exact patch-application procedure.
3. Validate normalized arguments, canonical paths, and command scope. No command
   overrides path or outside-target safety.
4. Honor an exact command within its named exception: workflow `reset` bypasses
   state-content validation only for canonical deletion; `back` bypasses terminal
   closure only for canonical reopening.
5. Validate slice-specific state, legacy shape, and decision authority. Global
   status may report malformed states read-only. Product approval does not
   override workflow contracts.
6. Validate and apply current-step result, owner, retry, remediation, patch, and
   implementation rules. Never infer an unsupported result or route.
7. Persist and reread every required transition. Persistence failure overrides
   the intended status and selects `FAILED`.
8. Report actual work, checks, changes, failures, and blockers before rendering
   one final result. Brevity never permits omission of required details.

## Inputs

| Argument | Effect |
| -------- | ------ |
| `<slug> <NN>` | Start or resume one slice |
| `status` | List all workflows |
| `status <slug> <NN>` | Show one workflow |
| `advance <slug> <NN>` | Explicitly skip the current step |
| `back <slug> <NN>` | Explicitly return one step |
| `reset <slug> <NN>` | Delete this slice's state |
| none | Same as `status` |

Normalize `NN` to two digits once. The resulting `<slug> <NN>` is `slice_arg`
and must remain unchanged thereafter. Its canonical state path is exactly
`sessions/<slug>/<slug>-<NN>-workflow.json`. Slice commands use only this path;
never glob or select among state candidates. `advance`, `back`, and `reset`
require the canonical file to exist. The exact reset invocation confirms deletion
of only that file after verifying it is inside the matching session directory.
Explicit `reset` validates arguments and path, not state contents.

Before constructing a path, require nonempty `<slug>` and decimal `<NN>`.
Reject separators, traversal, and malformed numbers. Apply stricter naming only
when existing session conventions require it. Resolve the workspace, `sessions/`,
matching session directory, and any existing target; reject any lexical or
resolved path outside the matching session root. An in-root symlink is allowed
only when repository conventions permit it and its resolved target is authorized.

## Output Format

Execution selects exactly one status: `CONTINUE`, `WAITING_USER`, `FAILED`, or
`COMPLETE`. Only `Final Validation` renders it as `LOOP_RESULT: <status>`. If an
external wrapper supplied an exact correlation suffix such as
`; LOOP_RUN_ID: <id>`, append only that suffix. Emit nothing after the result.

## Pipeline And Transition Contract

| Step | Role agent | Owner skill |
| ---- | ---------- | ----------- |
| 0 | `slice-design-readonly` | `refine-plan` |
| 1 | `slice-design-edit` | `refine-plan-requirements` |
| 2 | `slice-design-edit` | `refine-plan-schemas` |
| 3 | `slice-design-edit` | `refine-plan-architecture` |
| 4 | `slice-implement-code` | `implement-slice` |
| 5 | `slice-review-fix` | `review-slice-implementation` |
| 6 | `slice-review-audit` | `audit-slice-implementation` |
| 7 | `slice-implement-tests` | `implement-slice-tests` |
| 8 | `slice-review-audit` | `audit-slice-tests` |
| 9 | `slice-implement-docs` | `update-slice-docs` |

`ADVISORY` advances only when every remaining item is explicitly nonblocking.
Severity never determines remediation ownership.

Every owner must return exactly one supported `WORKFLOW_RESULT` as its
final nonblank line. The table defines intended transitions; any required
`Persist Transition` failure replaces its status with `FAILED`. Validate the
result against this table before any mutation:

| Step | Result | Transition | Loop status |
| ---- | ------ | ---------- | ----------- |
| 0 | `PATCH_READY` | Apply validated patch; remain 0 | `CONTINUE` |
| 0 | `CLEAN`, `ADVISORY` | Record outcome; advance to 1 | `CONTINUE` |
| 1-3, 5, 9 | `CHANGED` | Remain on step | `CONTINUE` |
| 1-3, 5 | `CLEAN`, `ADVISORY` | Record outcome; advance one | `CONTINUE` |
| 4 | `CLEAN` | Record outcome; advance to 5 | `CONTINUE` |
| 9 | `CLEAN`, `ADVISORY` | Record outcome; set step 10 and `complete` | `COMPLETE` |
| 6, 8 | `CLEAN`, `ADVISORY` | Record outcome; advance one | `CONTINUE` |
| 7 | `CLEAN`, `CHANGED` | Record outcome; advance to 8 | `CONTINUE` |
| 0-9 | `NEEDS_USER` | Set `waiting_user` and validated `resume_step` | `WAITING_USER` |
| 0-9 | `FAILED` | Set `failed` | `FAILED` |
| 6 | `REMEDIATE:0|1|2|3|5` | Route to owner | `CONTINUE` |
| 7 | `REMEDIATE:5` | Route production issue | `CONTINUE` |
| 8 | `REMEDIATE:0|1|2|3|5|7` | Route to owner | `CONTINUE` |

Any other, missing, duplicate, or malformed result is a contract failure: set
`failed` through `Persist Transition` and select `FAILED`.

For `NEEDS_USER` from steps 6 or 8, every blocking finding must contain exact
`Owner step: <n>` text; use the earliest allowed owner. At step 7, use owner 5
only for an exact `Owner step: 5` production issue. At step 4, require exactly
one `Resume step: 0` or `Resume step: 4` line from `implement-slice`. Other
steps use null. Missing or invalid required ownership or resume evidence is a
contract failure.

For `REMEDIATE`, require an allowed owner matching the stated finding owner and
disposition. Record `remediation-route`, move to that step, reset `iteration`,
set `running`, and preserve attempts. Earlier routing invalidates downstream
completion, so all downstream steps run again. Step 6 never routes ordinary
missing test coverage.

## State

New state is:

```json
{
  "schema_version": 2,
  "slice_arg": "<slug> <NN>",
  "status": "running",
  "current_step": 0,
  "iteration": 0,
  "total_iterations": 0,
  "step_attempts": {},
  "resume_step": null,
  "history": []
}
```

### Valid State

- `schema_version` is exactly 2 and `slice_arg` matches the request.
- `status` is `running`, `waiting_user`, `failed`, or `complete`.
- `current_step` is an integer 0-10. Counters and attempt values are
  nonnegative integers. `resume_step` is null or an integer 0-9. `history` is an
  array.
- Every `step_attempts` key is a decimal step key 0-9 and every value is a
  nonnegative integer.
- Step 10 requires `complete`. `complete` requires step 10 and a step-9 history
  outcome of `clean`, `advisory`, or `manual-advance`.

For slice-specific commands and workflow runs, unreadable JSON, unsupported
versions, mismatched slices, or invalid state end `FAILED` without mutation.
Read-only global status may report malformed entries and complete. Explicit
workflow `reset` is the sole mutation exception: validate arguments and canonical
path, not file contents, before deletion.

Preserve original event fields and unknown fields. Completion and
`manual-advance` events include `step`, `skill`, `outcome`, `iterations`, ISO
`completed_at`, and `attempts`; `step` is the completed source step. Route events
add `from_step`, `to_step`, and optional `reason`. `manual-back` and
`attempt-window-reset` include their applicable source/destination or prior-count
fields. Whenever an event is used as transition, routing, attempt-reset, or
terminal evidence, validate required strings, timestamp, step ranges,
nonnegative counters, allowed outcome, and event-specific fields. Preserve
malformed legacy events, but do not let them satisfy an invariant.

`iteration` counts attempts since the last step transition or manual move.
`total_iterations` never resets. `step_attempts[step]` counts attempts in its
current ten-attempt window. Remediation does not reset it. A direct rerun after
`failed` may renew that window and must record `attempt-window-reset` with the
prior attempt count and reason.

### Persist Transition

Every create, migration, or state change uses this procedure:

1. Snapshot the complete prior state. Derive and validate exact expected values
   for status, step, iteration, counters, attempts, `resume_step`, and latest
   history; every field not named by the transition must remain unchanged.
2. Write the complete next state to a unique, nonexisting sibling temporary file
   in the same directory/filesystem.
3. Rename it over the canonical state file and verify the temporary path is gone.
4. Re-read and compare persisted state with the exact expected state, including
   required history evidence and unchanged fields.
5. If any write, rename, comparison, or cleanup step fails, select `FAILED`;
   inspect and report any stale temporary path, and never report the intended
   transition as successful. Remove only the known temporary path if cleanup is
   needed.

### Legacy Migration

- Unversioned `status: superseded` is terminal and remains unchanged.
- Unversioned step 9+ is legacy-complete and remains unchanged except under
  explicit `back`.
- Upgrade active unversioned step 0-8 through `Persist Transition`: preserve
  `slice_arg`, `current_step`, `iteration`, `history`, and unknown history
  fields; initialize `status: running`, `total_iterations: 0`,
  `step_attempts: {}`, and `resume_step: null`.

## Source Material

Step 4's `implement-slice` owner requires the resolved plan, applicable `AGENTS.md`,
`docs/decision-authority.md`, baseline and final git status plus staged/unstaged
diffs, untracked slice files, prospective targets, and the plan's verification
commands. `PATCH_READY` requires the owner output, every patch header and hunk,
the resolved plan and tracked checklist paths, target context, and explicit hunk
authority. These sources govern mutation scope; the current diff does not prove
its own correctness.

## Execution

### Global Status

For no arguments or `status`, glob `sessions/*/**-workflow.json`, sort paths,
and read without mutation. Show slice, schema version, status, current step and
owner, iteration, and total iterations. Mark malformed states and duplicate
canonical slice identities; never choose one. Treat legacy step 9+ as
`legacy-complete` and legacy `superseded` as terminal. Select `COMPLETE`.
Derive identity from normalized `slice_arg` and canonical path; list every path
that collides on either identity.

### Slice Commands

Malformed commands or missing canonical state select `FAILED`.

- `status`: validate readable state, then show pipeline, state, attempts, and
  history. Select `COMPLETE`.
- `advance`: validate state; reject terminal state or step 10. Record
  `manual-advance`, move one step, reset `iteration`, and set `running`; from
  step 9 set step 10 and `complete`. Persist; select `COMPLETE`.
- `back`: validate state or applicable legacy terminal shape. Record
  `manual-back`, move to `max(0, current_step - 1)`, reset `iteration`, and set
  `running`. Migrate a reopened legacy terminal state in this transition.
  Persist; select `COMPLETE`.
- `reset`: without parsing contents, verify exact arguments and canonical path,
  delete only that file, and verify absence. Select `COMPLETE` on success or
  `FAILED` otherwise.

### Load One Run

1. Create missing canonical state at step 0 through `Persist Transition`.
2. Apply legacy rules, then validate version-2 state. Terminal state selects
   `COMPLETE` without work.
3. After validation, a rerun of `waiting_user` sets `running`, moves first to a
   nonnull `resume_step`, and clears it. A rerun of `failed` records
   `attempt-window-reset`, sets `running`, and resets only the current step's
   attempt count. Persist either transition.
4. If the current attempt count is 10, set `failed`, persist, report the step,
   and select `FAILED`. Otherwise increment `iteration`, `total_iterations`, and
   the current attempt count, then persist before work.
5. Print the exact header below. On retries, reconcile existing work instead of
   repeating blindly.

```text
-- SLICE WORKFLOW ---------------------
Step {current_step}/9: {skill_name} | attempt {step_attempts[current_step]}/10
Slice: {slice_arg} | total iterations: {total_iterations}
--------------------------------------
```

### Invoke One Mapped Role Agent

At steps 0-9, invoke the listed role agent exactly once through the `subagent`
tool, with the
exact `slice_arg` unchanged. Tell the child to load exactly the listed owner
skill, execute it once, avoid child-agent delegation, and return the owner's
final nonblank `WORKFLOW_RESULT` unchanged. Read that final line in the same turn
and apply the transition contract. The parent alone persists workflow state.

For every `NEEDS_USER`, persist `status: waiting_user` and the validated
`resume_step` through `Persist Transition` before selecting `WAITING_USER`. For
step 4, use the child's validated exact `Resume step: 0` or `Resume step: 4`
line. Preserve the child's blocker question and do not repeat it.

For step 0 `PATCH_READY`, require one standard unified diff without an
`*** Begin Patch` envelope. Inspect every header and target context. Every hunk
must target only the resolved plan and its tracked checklist, be explicitly
authorized, and have no unresolved dependency. Write it to a unique nonexisting
file under `/tmp/opencode`; immediately re-read targets and run
`git apply --check` only if their bytes/diff contexts still match the preflight
snapshot, then run `git apply` exactly once. Capture initial and final staged and
unstaged state; confirm the index is unchanged. Delete only that temporary file
and verify absence. Classify each delta as preexisting, authorized patch,
intervening, unexpected, or uncertain. If apply or cleanup fails, freshness is
lost, or any delta is unexpected/uncertain, preserve actual content, never roll
it back, report what landed, set `failed`, persist if possible, and select
`FAILED`. On success reconcile every landed hunk, remain at step 0, and select
`CONTINUE` so the next invocation verifies clean.

For `NEEDS_USER`, do not repeat questions visible in the owner output. Apply its
validated transition. Apply all other valid results exactly as the table states;
use `Persist Transition` whenever state changes.

## Final Validation

Before responding, confirm:

1. Exactly one command or work attempt and at most one mapped role agent ran.
2. The current step/result pair was allowed before mutation; `resume_step` and
   remediation ownership came only from valid exact owner fields.
3. Every state change used `Persist Transition`; persisted state and latest
   history match the selected status. Persistence failure selects only `FAILED`.
4. Step 4 or `PATCH_READY` touched only authorized targets, preserved unrelated,
   staged, untracked, and intervening work, and reconciled every resulting path
   and hunk.
5. Reported commands and checks actually ran and their outcomes are accurate.
6. `WAITING_USER` matches persisted `waiting_user`; a persisted failure matches
   `failed`; `COMPLETE` matches valid step 10; and `CONTINUE` matches the exact
   table-defined state. For no-state-change results, only the pre-work attempt
   increment may differ from the prior invocation state.

Report all actual work, checks, changes, failures, skips, and blockers before the
footer. Do not omit required details for brevity.

Render the selected status exactly once as the final nonblank line:
`LOOP_RESULT: CONTINUE|WAITING_USER|FAILED|COMPLETE`. If an external wrapper
supplied an exact correlation suffix such as `; LOOP_RUN_ID: <id>`, append only
that suffix. Emit nothing afterward.
