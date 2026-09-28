---
name: refine-plan-schemas
description: Refine a slice plan's schemas and update it directly when safe
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

1. **Schema mode only.** Edit introduced or changed input, output, event,
   persistence, and error contracts: ownership, fields, types, requiredness,
   nullability, defaults, enums, mappings, invariants, and compatibility. Never
   change product requirements or structural architecture.
2. **Authorized edits only.** Apply only evidence-backed `Agent-Owned` decisions or
   explicit `User-Approved` decisions already in context. Never apply unresolved
   `Agent-Recommended` or `Needs User Approval` choices. Preserve `User-Approved`
   labels.
3. **Do not invent semantics.** Repository patterns may establish naming,
   placement, and mapping conventions. Owned schema declarations and implementation
   may prove existing internal field presence, type, and mapping. New field meaning,
   requiredness/nullability semantics, defaults, enum membership, and external or
   persisted compatibility require direct contract, platform, or authorized product
   evidence. Product sources govern product-visible semantics; owned contracts and
   platform specifications govern interfaces.
4. **Target safety.** Edit only the target plan and, when materially required, its
   referenced checklist. Preserve fresh, unrelated, and settled supported content.
   Never edit the PRD, context, decision log, dependency plans, contracts, or code.
   Never mark implementation or validation complete without separate evidence.
5. **Evidence and conflicts.** The plan proves its text, not the truth of its claims.
   Ground every locked schema detail in an authoritative source read in this run.
   An unresolved same-subject source conflict blocks every dependent edit.
   Investigate applicable evidence before removing settled text; absence of evidence
   is a gap, not authority to delete, unless authoritative evidence contradicts or
   supersedes it.
6. **Independent progress after mandatory reads.** If required authority is
   inaccessible, make no edits and return `FAILED`. Otherwise apply all edits
   independent of unresolved blockers, then return `NEEDS_USER` while any blocker
   remains. Prepare one concise question batch, apply independent edits, then ask in
   the response. Current blockers never become plan `Open Questions`; edit `Open
   Questions` only for nonblocking future follow-up. Missing or conflicting
   information needed to determine a safe schema semantic is a blocker; an evidence
   gap is nonblocking only when no dependent edit is applied.
7. **Verify actual results.** Re-read edited targets and validate final content;
   never infer success from intended edits.

## Instruction Priority

When instructions conflict, apply this order:

1. Schema-mode, allowed-target, and fresh/unrelated-content safety.
2. Mandatory governing-source access and operational completion. If unavailable,
   make no edits and return `FAILED`.
3. Repository safety constraints and verification of actual final content.
4. Subject-specific authority: authorized product sources govern product semantics;
   owned contracts and platform specifications govern interfaces; implementation
   proves current shape only.
5. A latest explicit user decision that clearly supersedes the same product
   decision within priorities 1-4; it cannot override an unchanged external or
   platform contract.
6. No-invention and direct-evidence requirements. Investigate applicable evidence
   before removing settled text; absence of evidence alone becomes an evidence gap.
7. Same-subject conflict handling and blocker independence after mandatory reads.
   Apply partial edits only when the affected contract remains accurate end to end.
8. Existing authorized contracts and settled supported content unless authoritative
   evidence supersedes or contradicts them.
9. Contract completeness, compatibility/data safety, verification, and checklist
   consistency.
10. Complete reporting and actual-delta accounting, then minimal edits, concise
    wording, and cosmetic restraint.

Completeness never authorizes invented semantics. Brevity never permits omitting a
nonempty required output category.

Classify schema choices per `docs/decision-authority.md`: established
naming/placement/mapping conventions may be `Agent-Owned`; local reversible
no-pattern tradeoffs are `Agent-Recommended`; product-visible,
external-contract, and pattern-breaking decisions are `Needs User Approval`.

## Task

Directly refine one slice plan's schema and contract details. Follow each changed
contract from producer/source through every mapping boundary to
consumer/destination. On repeat runs, focus on new gaps and contradictions, avoid
cosmetic churn, and reuse prior explicit answers. Report requirements or
architecture needs only as blockers or brief routing notes.

## Inputs

Supported invocations:

- `/refine-plan-schemas sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/refine-plan-schemas <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing first-argument path; otherwise glob
`sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: report the attempted glob and return `FAILED`.
- Multiple matches: list candidates, ask the user to choose, and return
  `NEEDS_USER`. Never auto-pick.
- One match: continue.

## Output Format

Return a terse delta report using only nonempty sections:

- `### Changes Applied` with each edited file and a one-line delta
- `### Suggested Schema Changes Not Applied`
- `### Evidence Gaps`
- `### Decisions` for `Agent-Recommended` or `Needs User Approval`
- `### Blocker Questions`
- `### Remaining Schema Gaps`
- `### Validation Limits` only when an applicable planned check or command cannot
  be validated from authoritative repository sources

If nothing material changed, say `No substantive changes needed in this mode.`

End with exactly one footer as the final nonblank line. Choose in this order:

1. `WORKFLOW_RESULT: FAILED` when an operational failure or inaccessible mandatory
   source prevents completion.
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
`docs/decision-authority.md`. Always read a referenced PRD and tracked checklist.
If a mandatory source is operationally inaccessible, return `FAILED` without edits.

Read other sources when relevant to a proposed schema decision:

- Explicit user decisions, the PRD, checklist, context, and decision log govern
  authorized product-visible semantics and scope.
- Applicable `AGENTS.md` files govern repository and safety constraints.
- Owned contracts and platform specifications govern their interfaces and
  compatibility promises.
- Read every named dependency plan that owns or constrains an in-scope contract;
  skip dependencies unrelated to schema scope.
- Files named in schema, contract, touchpoint, or ownership sections prove current
  declarations when a proposed edit relies on them.
- The smallest relevant implementation set proves current shapes and repository
  conventions but cannot authorize new product or external-contract semantics.
- `TESTS.md`, package scripts, and repository conventions govern valid verification
  commands and test tiers when verification changes.
- `docs/decision-authority.md` governs unresolved decision classification.

The smallest-set limit applies only to implementation evidence. It never limits
owned contracts, platform specifications, applicable governing instructions, named
dependency interfaces, or referenced PRDs and checklists.

Use the plan's traceability convention or cite one source path plus section or
symbol per locked schema decision. If authoritative sources conflict on the same
subject, report the conflict and do not edit dependent text.

## Review Scope

Review the entire plan, focusing on `Inputs / Outputs (Known So Far)`, `Contracts /
Decisions Locked For This Slice`, `Contract Inventory`, `Schema Ownership`, `Locked
Field Definitions`, `Type / Schema Touchpoints`, `Mapping Boundaries`, `Invariants`,
and `Compatibility / Migration Notes`, plus consistency with `Open Questions`,
`Verification`, `Edge Cases`, `Acceptance Criteria`, and `Likely File Touchpoints`.

For each changed contract, follow the data from producer/source through every
mapping boundary to consumer/destination. Check evidence-applicable contract
identity and ownership, field semantics, mappings and invariants, and compatibility
or data-safety behavior.

Do not invent details because a category could apply. Route missing product or
architecture decisions instead. Preserve section structure unless an authorized
edit makes it stale.

## Workflow

1. Resolve the plan and read all mandatory sources plus every source governing a
   proposed or claimed contract decision.
2. Build an internal schema-decision-to-edit map with each proposed edit's source,
   authority, affected sections/contracts, mapping dependencies, and blocker
   dependencies, plus verification coverage. Snapshot each allowed target and
   preserve `User-Approved` labels.
3. Exclude out-of-mode, unauthorized, unsupported, invented, or blocker-dependent
   entries and prepare one concise question batch for user-resolvable blockers.
4. Re-read each target immediately before editing. If it changed since the
   snapshot, preserve the change and recompute affected entries; never overwrite or
   revert it.
5. Apply independent edits. Update the checklist only when schema-definition work
   materially changes its scope or validation expectations. Apply a partial
   contract edit only when all affected sections remain accurate and unresolved
   dependent semantics are reported rather than represented as locked or complete.
6. Re-read edited targets, compare them with snapshots, and reconcile every changed
   block with the map. Correct only in-scope defects introduced by this edit set,
   add corrections to the map, then re-read and run `Final Validation`. If validation
   discovers a preexisting issue absent from the map, add and classify it before
   editing; otherwise report it. After any correction, repeat snapshot accounting
   and every affected contract, checklist, and reporting check.
7. Report the prepared blocker questions after independent edits.

## Final Validation

Before responding, confirm:

1. Every changed block maps to an authorized, evidence-backed schema decision; each
   map entry is applied, rejected with reason, or blocked. Each new citation's exact
   section or symbol supports every attached semantic, not merely the contract name.
2. Every edit is schema-only, target-safe, minimal, and independent of unresolved
   blockers. No requirement, architecture decision, invented semantic, current
   blocker, or unrelated content was written into the plan.
3. Every changed contract has one canonical owner/source, direction, producers,
   consumers, boundary type, and consistent references/touchpoints. Competing
   canonical definitions are blocked or reported.
4. At each changed boundary, every affected field and consequentially affected
   mapping is preserved, renamed, transformed, derived, defaulted, or intentionally
   dropped with authoritative evidence; no collision or silent loss remains. Require
   complete field accounting only for a new or materially reshaped contract,
   canonical definition, or mapping boundary.
5. Applicable field and boundary semantics are evidence-backed: presence/null/empty,
   defaults/normalization, enum/unknown and serialization behavior, validation/error
   outcomes, compatibility/version skew, migration/existing-data/rollback effects,
   and sensitive-data/trust/logging/persistence constraints. Missing semantics remain
   gaps or blockers; never invent product or architecture decisions.
6. Every material contract or invariant change maps to relevant evidence-backed
   verification scenarios. Changed commands and test tiers match `TESTS.md`, package
   scripts, or repository conventions. This plan-only skill runs no typecheck, test,
   build, lint, schema, migration, security, or runtime command and never claims one
   passed; report `Validation Limits` only when an applicable planned check cannot
   be validated from authoritative sources.
7. Every checklist field change is authorized, evidence-backed, caused by a
   material schema-plan change, and consistent with the final plan. Do not mark
   implementation or validation complete without separate evidence.
8. Snapshot comparison accounts for every initial and corrective change, preserves
   intervening and unrelated content, and finds no formatting damage or stale
   dependent text.
9. Every blocker, evidence gap, unapplied decision, validation limit, and
   operational failure appears in the appropriate output section, and the footer
   matches actual results.

Emit exactly one matching `WORKFLOW_RESULT` footer as the final nonblank line, with
no content after it.
