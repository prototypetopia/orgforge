---
name: session-save
description: Save end-of-session context for a named workstream
argument-hint: <workstream-slug>
---

Update context files at the end of a work session so future sessions can resume quickly.

## Input

- Required argument: `<workstream-slug>`

## Files

- `sessions/<slug>/context.md`
- `sessions/<slug>/decision-log.md`
- `sessions/<slug>/latest.md`
- `sessions/<slug>/<slug>-next-steps.md` (master progress file)
- `sessions/<slug>/<slug>-<NN>-workflow.json` (optional slice-workflow state, if present)

If `context.md`, `decision-log.md`, or `latest.md` is missing, stop and
recommend `/session-init <slug>`. If the master progress file is missing, stop
and recommend `/prd-breakdown <slug>` when the PRD exists; otherwise recommend
`/prd <slug>` followed by `/prd-breakdown <slug>`. Do not run initialization for
a missing checklist.

## Critical Rules

1. **Decision-log is append-only.** Never overwrite or reorder existing entries.
2. **Do not invent completed validation.** Mark unknown validation as `not run`.
3. **Do not log unresolved decisions.** Only resolved decisions belong in the decision log. Keep unresolved items (pending `Agent-Recommended` or `Needs User Approval`) in `latest.md` unresolved questions / risks.
4. **Do not silently drop tasks.** Preserve existing active tasks in the master progress file.
5. **Section updates only.** Never replace entire docs when a section update is sufficient.
6. **Completed work is the terminal tracking state.** A slice is `Done` once the work is complete. For workflow schema version 2, only `status: complete`, `current_step: 10`, and a terminal step 9 history entry (`clean`, `advisory`, or explicit `manual-advance`) prove completion. For legacy unversioned workflow files, `current_step >= 9` remains completion evidence under the legacy terminal convention. Preserve unversioned `status: superseded` workflows without treating them as work to resume. If a PR/issue already exists, record the durable link once; do not make PR-open/merge state a gate for `Done`.
7. **Never record transient VCS state.** Do not write `uncommitted`, `working tree dirty`, `not yet committed`, or `not yet pushed` anywhere in the session docs. A slice's code and its session docs are committed together around `/session-save`, so commit-status is instantly stale and forces cleanup. Record only durable VCS facts (branch name, PR #, `Done`). This governs the text written here — it does not make this skill run git.
8. **Never list PR creation as a task.** Do not add "open the PR", "create the PR", `/pr`, or any PR-status follow-up to `## Now`/`## Next`/`## Later`, "Next 3 Tasks", the bootstrap prompt, or anywhere else in the session docs. A slice ships together with its session docs in the same PR, so opening the PR *is* shipping the slice — not a tracked follow-up. Listing it only creates cleanup overhead next session (the action is stale the moment the PR is opened). Record a PR only as a durable fact once it exists (e.g. `PR #N`), per Rule #7.

## Steps

1. Read these files (and related plans):
   - `sessions/<slug>/context.md`
   - `sessions/<slug>/latest.md`
   - `sessions/<slug>/decision-log.md`
   - `sessions/<slug>/<slug>-next-steps.md` (master progress file)
   - Related plans linked from the master file
   - Matching `sessions/<slug>/<slug>-<NN>-workflow.json` files for slices touched this session, if present
   - `docs/decision-authority.md`
2. Infer what changed in this session from conversation/worktree state and touched files.
3. Run a reconciliation pass:
   - Compare `Done` items in the master progress file against related plan files.
   - Use matching `slice-workflow` state files as strong evidence of slice completion when present.
   - If a related plan still says `Status: Planned` but appears implemented in `Done`, update that plan status to `Implemented` and set `Implemented on: <today>`.
   - If a plan is partially done, set status to `In Progress`.
   - Add/refresh `Tracked by: <master progress file path>` in related plans.
   - If evidence is unclear, leave file unchanged and add a short note to unresolved questions.
   - **Terminal slice lifecycle (Critical Rule #6):**
      - A slice becomes terminal `Done` once the work is complete. A version 2 `slice-workflow` file is sufficient evidence only with `status: complete`, `current_step: 10`, and a terminal step 9 history outcome (`clean`, `advisory`, or `manual-advance`). An unversioned legacy file remains complete at `current_step >= 9`; preserve an unversioned `superseded` workflow as terminal without resuming it.
     - If the work is complete but no PR exists yet, still write the terminal entry now — plan `Status: Implemented` / board `Stage: Done`.
     - If a durable issue/PR link already exists, include it once in that terminal entry — e.g. plan `Status: Implemented — PR #N (closes #M)`, board `Stage: Done — PR #N (issue #M)`.
     - **Idempotent / no post-merge pass:** if a slice is already `Done`, leave its status untouched. Do **not** hold it open for a missing PR, flip `open → merged`, add `merged <date>`, or otherwise edit a `Done` entry to reflect the merge event — even when told "the PR merged."
     - Never create `ready for PR` / `awaiting merge` / `merged` status or stage values.
     - **Edge case:** if later evidence shows the work was not actually complete, or the slice was explicitly reopened for follow-up on the same plan, move it back to `In Progress` / `Now` and note why.
     - Leave already-written terminal entries (e.g. an existing `Done — merged in PR #N`) **as-is** — this changes future behavior, it does not rewrite history.
4. Re-sync next actions from master progress (required):
   - Re-read `sessions/<slug>/<slug>-next-steps.md` after reconciliation edits.
   - Set `sessions/<slug>/latest.md` "Next 3 Tasks" to the first 3 unchecked items (`[ ]`) from `## Now`.
   - Prefer `Stage: Refined` or `Stage: In Progress` items from `## Now`.
   - Only include `Stage: Stub` items when the immediate next action is clearly to refine them.
   - If fewer than 3 items exist in `## Now`, continue with unchecked items from `## Next`, then `## Later`.
   - Never include tasks that are checked (`[x]`) in the master progress file.
   - Never include opening/creating a PR (`/pr`) as a Next task or bootstrap action (Critical Rule #8).
   - Update the bootstrap prompt to mirror these same next tasks (do not repeat completed tasks).
   - Add concrete file references (plan paths) for each next task.
   - If a task is discovered but not in the master progress file, add it to the master file first before including it in Next 3 Tasks.
5. Consistency pass (required):
   - Ensure `Validation State` does not contradict "Next 3 Tasks". Example: if smoke is marked completed, "Next 3 Tasks" must not include the smoke plan.
   - If contradictions exist, update only the inconsistent sections and add a short note under "Unresolved Questions" if anything cannot be reconciled.
   - Merge status, PR-open status, and local commit/push status are **not** tracked states (Critical Rules #6/#7): do not flag a `Done` slice as inconsistent for lacking a PR or `merged` marker, and do not add `uncommitted` / `pending-commit` notes.
6. Update `sessions/<slug>/latest.md` with:
   - Date
   - Summary of changes
   - Completed/in-progress/blocked — describe **work state** (implemented / verified / `Done`), **not** git plumbing or pending-PR state. Per Critical Rule #7, do **not** include a working-tree / uncommitted / committed / pushed status line; if a branch/PR is relevant, reference the durable fact only as metadata (e.g. `branch X`, `PR #N`), never as a blocker/open-state qualifier such as `in PR`, `awaiting merge`, or a clean/dirty/uncommitted note. Treat the slice's code + these session docs as committed together.
   - Next 3 tasks
   - Validation state (lint/typecheck/tests)
   - Important file references
   - Bootstrap prompt for the next session
7. If architecture/scope/locked decisions changed materially, update `sessions/<slug>/context.md`.
8. If a decision was resolved this session, append a decision entry to `sessions/<slug>/decision-log.md`.
   - Log any decision that was actually made (resolved), regardless of its original authority classification. Include the rationale (ADR-style).
   - Do not log decisions that were merely surfaced or proposed but not resolved — those belong in `latest.md` unresolved questions.
9. Validate before confirming:
   - [ ] "Next 3 Tasks" sourced from master progress file (not invented).
   - [ ] Decision-log only appended, not modified (Critical Rule #1).
   - [ ] No active tasks silently dropped from master progress (Critical Rule #4).
   - [ ] No validation marked as completed without evidence (Critical Rule #2).
   - [ ] No transient VCS text (`uncommitted`, `dirty`, `not yet pushed`, etc.) was written (Critical Rule #7).
   - [ ] No PR-creation task (`open the PR`, `/pr`) was listed in Now/Next, Next 3 Tasks, or the bootstrap (Critical Rule #8).
   - [ ] No pending-PR / merge-lifecycle state (`in PR`, `ready for PR`, `awaiting merge`, `merged`) was introduced, and no workflow-complete slice was left open solely due to missing PR state (Critical Rule #6).
   - [ ] Consistency pass applied — no contradictions between Validation State and Next 3 Tasks.
   If any check fails, fix the issue before confirming.
10. Confirm exactly which files were updated and list any unresolved questions.

## Output requirements

Always include a short **Reconciliation Report**:

- Master progress file used
- Related plans checked
- Status updates applied (note any slice marked terminal `Done` from completed work / workflow-complete evidence, with PR links only when they already existed)
- Any drift not auto-resolved
