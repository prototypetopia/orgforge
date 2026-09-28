---
name: refine-plan-requirements
description: Refine a slice plan's requirements and update it directly when safe
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

1. **Requirements mode only.** Edit functional and non-functional requirements,
   observable behavior, scope, dependencies, edge cases, failure behavior,
   verification, and acceptance criteria. Never design schemas or architecture.
2. **Authorized edits only.** Apply only evidence-backed `Agent-Owned` requirements
   or explicit `User-Approved` decisions already in context. Never apply unresolved
   `Agent-Recommended` or `Needs User Approval` choices. Preserve `User-Approved`
   labels. Completeness review never authorizes invented requirements.
3. **Target safety.** Edit only the target plan and, when materially required, its
   referenced checklist. Preserve fresh, unrelated, and settled supported content.
   Never edit the PRD, context, decision log, dependency plans, or code.
4. **Evidence and conflicts.** The plan proves its text, not the truth of its claims.
   Ground each locked requirement in an authoritative source read in this run. An
   unresolved same-subject source conflict blocks every dependent edit. Investigate
   applicable evidence before removing unsupported-looking text; absent evidence is
   an evidence gap, not authority to delete, unless an authoritative source
   contradicts the text.
5. **Independent progress only after mandatory reads.** If required authority is
   unavailable, make no edits and return `FAILED`. Otherwise apply all edits
   independent of unresolved blockers, then return `NEEDS_USER`. Ask current
   blockers in the response; never persist them as future `Open Questions`. Use
   `Open Questions` only for nonblocking future requirements follow-up. Missing or
   conflicting information needed to determine safe requirements behavior is a
   blocker. An evidence gap is nonblocking only when no dependent text is edited.
6. **Verify actual results.** Re-read edited targets and validate final content;
   never infer success from intended edits.

## Instruction Priority

When instructions conflict, apply this order:

1. Requirements-mode, allowed-target, and fresh/unrelated-content safety.
2. Mandatory governing-source access and operational completion. If unavailable,
   make no edits and return `FAILED`.
3. Repository safety constraints and verification of actual final content.
4. A latest explicit user decision that clearly changes and supersedes the same
   product decision, within priorities 1-3; otherwise block dependent edits.
5. Subject-specific source authority, decision classification, and evidence
   grounding. Investigate applicable evidence before removing unsupported-looking
   text; absence of evidence alone becomes an evidence gap.
6. Blocker independence after mandatory reads succeed.
7. Existing authorized behavior and settled content, unless authoritative evidence
   supersedes it or an authorized edit makes it stale.
8. Requirements completeness, traceability, and checklist consistency.
9. Complete reporting, then minimal edits, concise wording, and cosmetic restraint.

Requirements-mode boundaries always win over making acceptance criteria more
specific. Reporting brevity never permits omitting a required edit, gap, decision,
blocker, or failure.

## Task

Directly refine one slice plan's requirements. Prefer concrete, observable,
testable behavior over implementation speculation. On repeat runs, focus on new
gaps and contradictions, avoid cosmetic churn, and reuse prior explicit answers.
Report schema or architecture needs only as blockers or brief routing notes.

## Inputs

Supported invocations:

- `/refine-plan-requirements sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/refine-plan-requirements <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing first-argument path; otherwise glob
`sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: report the attempted glob and return `FAILED`.
- Multiple matches: list candidates, ask the user to choose, and return
  `NEEDS_USER`. Never auto-pick.
- One match: continue.

## Output Format

Return a terse delta report using only nonempty sections:

- `### Changes Applied` with each edited file and a one-line delta
- `### Suggested Requirements Changes Not Applied`
- `### Evidence Gaps`
- `### Decisions` for `Agent-Recommended` or `Needs User Approval`
- `### Blocker Questions`
- `### Remaining Requirements Gaps`
- `### Validation Limits` only when an applicable planned check's command or
  expected outcome cannot be validated from authoritative sources

If nothing material changed, say `No substantive changes needed in this mode.`

End with exactly one footer as the final nonblank line. Choose in this order:

1. `WORKFLOW_RESULT: FAILED` when an operational failure or inaccessible mandatory
   source prevents completion, even if a user decision also remains.
2. `WORKFLOW_RESULT: NEEDS_USER` when required work otherwise completed and a
   blocker, ambiguous plan selection, or relevant `Needs User Approval` decision
   requires a response, even if independent edits were applied.
3. `WORKFLOW_RESULT: CHANGED` when substantive edits were applied and no response
   is required.
4. `WORKFLOW_RESULT: ADVISORY` when no edits were applied and only nonblocking
   evidence gaps, routing notes, or `Agent-Recommended` guidance remain.
5. `WORKFLOW_RESULT: CLEAN` when no substantive edit or unresolved item remains.

Never emit `PATCH_READY` or content after the footer.

## Source Material

Always read the full target plan, root and applicable nested `AGENTS.md` files, and
`docs/decision-authority.md`. If a mandatory source is operationally inaccessible,
return `FAILED`; do not continue with reduced authority.

Always read a referenced PRD and tracked checklist. Read a named dependency plan
when relevant to a proposed requirement, dependency, or claimed interface.

Read other sources only when relevant to a proposed edit:

- Explicit user decisions, the referenced PRD, checklist, context, and decision log
  govern approved product behavior and scope.
- Applicable `AGENTS.md` files govern repository and safety constraints.
- Dependency plans and owned contracts govern their locked interfaces.
- The smallest relevant implementation set proves current behavior and
  compatibility constraints, but cannot authorize new product behavior. This limit
  does not apply to mandatory governing files.
- `TESTS.md`, package scripts, and repository conventions govern valid verification
  commands.
- `docs/decision-authority.md` governs unresolved decision classification.

A latest explicit user decision overrides earlier product evidence only when it
clearly changes the same decision and complies with mode, target, and repository
safety constraints. Otherwise report the conflict and block dependent edits.

Use the plan's traceability convention or cite one source path plus section or
symbol per locked requirement.

## Review Scope

Review the entire plan, focusing on `Why This Slice Exists`, `PRD Traceability`,
`Objective`, `Scope`, `Dependencies`, `Open Questions`, `Risks / Unknowns`,
`Verification`, `Edge Cases`, and `Acceptance Criteria`, plus consistency with
`Inputs / Outputs (Known So Far)` and `Implementation Plan`.

Check evidence-applicable observable success, failure, edge-case, compatibility,
and non-functional outcomes. Acceptance and verification must not prescribe schema
or architecture merely to become more specific. Route missing schema or architecture
decisions instead. Update other sections only for material requirements gaps or
staleness caused by an authorized edit. Preserve settled content unless superseded
or made stale by an authorized edit; always preserve unrelated content.

## Workflow

1. Resolve the plan and read all mandatory and applicable sources.
2. Build an internal requirement-to-edit map with each edit's source, authority,
   affected sections, acceptance/verification coverage, and blocker dependencies.
   Snapshot each allowed target and keep explicit approvals classified as
   `User-Approved`.
3. Exclude out-of-mode, unauthorized, unsupported, or blocker-dependent entries.
   Prepare one concise question batch for user-resolvable blockers.
4. Re-read each target immediately before editing. If it changed since the
   snapshot, preserve the change and recompute affected entries; never overwrite or
   revert it.
5. Apply independent edits. Update the checklist only when slice meaning,
   dependencies, or validation expectations materially change.
6. Re-read edited targets, compare them with snapshots, and reconcile every changed
   block with the map. Correct only in-scope defects introduced by this edit set,
   add each correction to the map, then re-read, repeat changed-block accounting,
   and run `Final Validation`.
7. Return prepared blocker questions with `NEEDS_USER` after independent edits.

## Final Validation

Before responding, confirm:

1. Every new citation, dependency, symbol, and command exists in a source read in
   this run and supports its attached claim. Every map entry is applied, rejected
   with a reason, or blocked; every changed block maps to one authorized entry.
2. Every changed block is requirements-only, target-safe, minimal, and independent
   of unresolved blockers. No schema, architecture, unsupported behavior, current
   blocker, or unrelated change was written into the plan.
3. Compare governing source scope and `PRD Traceability` with objective and scope.
   Every claimed source requirement is covered, explicitly excluded, or deferred
   with evidence; no plan requirement expands authorized scope.
4. Every materially changed requirement has evident coverage by an observable
   acceptance criterion and verification scenario. Changed requirements are
   unambiguous and sufficiently atomic, identify actor/system and trigger when
   applicable, and state observable success, failure, or boundary outcomes required
   by evidence without implementation prescriptions.
5. Changed non-functional requirements preserve source-backed thresholds, units,
   scope, and measurement conditions. Missing thresholds remain evidence gaps or
   decisions. Evidence-applicable safety, compliance, compatibility, and
   external-contract semantics agree across scope, edge cases, acceptance, and
   verification; do not invent requirements from these categories.
6. Changed commands match `TESTS.md`, package scripts, or repository conventions,
   and planned runtime or deployed checks match stated outcomes. Never claim an
   implementation check ran or passed. Report `Validation Limits` only when an
   applicable command or expected outcome could not be validated from authoritative
   sources; omit it from clean no-change responses.
7. Every checklist field change is evidence-backed, authorized, and caused by a
   material plan change. Scope, dependencies, and validation expectations match the
   plan; implementation or validation status is unchanged unless separately
   evidenced.
8. Snapshot comparison accounts for every initial and corrective change and
   preserves intervening and unrelated content. Final files have no formatting
   damage or stale dependent text.
9. Every blocker, evidence gap, unapplied choice, validation limit, and operational
   failure appears in the appropriate output section, and the footer matches actual
   results.

Emit exactly one matching `WORKFLOW_RESULT` footer as the final nonblank line, with
no content after it.
