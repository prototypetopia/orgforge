# AWS Organization as Code Foundation and Operations: Operations Documentation

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- Console edits and Organizations propagation delays get misdiagnosed as
  framework bugs when drift and consistency rules are undocumented.
- Destructive lifecycle operations (account removal, deployment removal) have
  explicit staged procedures; without them, "delete the declaration" is the
  obvious and wrong path.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 10 (drift and consistency documentation)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#acceptance-criteria`
  - Acceptance 7 (README documents StackSet drift limitations and
    refresh-plus-preview)
- Source Sections 95, 96, 97, 77, 78

## Objective

- The README documents drift handling, StackSet drift limitations, eventual
  consistency rules, and the account and deployment decommission procedures,
  with no claim of full drift coverage.

## Scope

- In:
  - README drift section: `pulumi refresh` then `pulumi preview`, StackSet drift
    limitations, no automatic adoption of unmanaged resources, deliberate
    imports
  - README consistency section: Pulumi dependency edges first, provider and SDK
    waiters, no arbitrary sleeps, documented unavoidable cases, useful errors
  - Account decommissioning procedure (Section 95) and deployment decommission
    workflow (Section 77), including the separation of
    account-leaves-OU retention from deployment-deleted retention
  - Cross-references to the preview high-risk list (slice 04) and safe deploy
    command (slice 07)
- Out:
  - The deployment retention implementation (deployments workstream owns
    Sections 74-76)
  - Account resource implementation (org-structure)
  - The read-only audit command (deferred, Source Section 79)
  - Any automated drift detection tooling

## System Components (Slice View)

- README: operational guidance for operators and reviewers
- Procedures: account and deployment decommission sequences

## System Flow (Slice Flow)

1. A console change is noticed; the operator runs refresh then preview.
2. The diff is reviewed against the high-risk list.
3. A destructive change follows the staged procedure: preview, explicit
   unprotect, remove declaration, preview, apply, verify.
4. Import of an unmanaged resource is a deliberate, separate step.

## Inputs / Outputs (Known So Far)

- Inputs:
  - An existing Pulumi stack and a pending configuration or console change
- Outputs:
  - A reviewed, staged, operator-executed change

## Dependencies

- Requires:
  - 04 (high-risk list, protection policy)
  - 07 (safe deploy command, gates)
- Blocks / Enables:
  - Nothing; terminal documentation slice for this workstream

## Open Questions

- How much of the Section 77 deployment decommission procedure should the
  foundation document versus the deployments workstream, given the index makes
  foundation a secondary owner of that row?
- Should the procedures live in the README or in a separate `docs/` file? No
  repo convention exists yet beyond the README being named in the source.
- Where do unavoidable propagation cases get recorded, given they are only
  discoverable once sibling resources exist?
- Should the audit command placeholder appear at all, given it is deferred?

## Risks / Unknowns

- Documenting a workflow before the sibling resources exist risks describing
  behavior that changes during their implementation.
- Over-claiming drift coverage is explicitly prohibited (Source Section 78).

## Implementation Plan

1. Draft the drift section with the explicit StackSet limitation.
2. Draft the consistency section with the no-arbitrary-sleep rule.
3. Draft the account decommission procedure and the deployment decommission
   workflow, and state the two retention lifecycles separately.
4. Cross-reference the safe deploy command, the gate order, and the high-risk
   list.
5. Mark propagation cases as to-be-documented by their owning workstreams.

## Initial Acceptance Shape

1. README states `pulumi refresh` is useful but insufficient for StackSet
   target auditing.
2. README documents the Section 95 account decommission steps in order.
3. README documents the Section 77 deployment decommission steps in order and
   separates the two retention lifecycles.
4. No claim of complete drift detection anywhere in the documentation.

## Notes for Refinement

- Keep this slice documentation-only; do not add tooling.
- The read-only audit command stays out of scope; mention it only if the
  README already needs a "future work" note.

## Contracts / Decisions Locked For This Slice

- Agent-Owned: console changes are drift; refresh plus preview; no automatic
  adoption; deliberate imports (Source Section 96, DEC-005).
- Agent-Owned: dependency edges first, waiters, no arbitrary sleeps,
  documented unavoidable cases, useful errors (Source Section 97).
- Agent-Owned: `pulumi refresh` is useful but not sufficient for StackSet
  target auditing; do not claim full drift detection (Source Section 78).
- Agent-Owned: account decommissioning is the explicit nine-step procedure; a
  normal `pulumi up` never closes accounts (Source Section 95).
- Agent-Owned: the staged retain workflow is never combined with a destroy in
  one operation (Source Sections 75-77).
- TBD during refine-plan: README structure, ownership split of Section 77.

## Architecture Decisions For This Slice

- Reuse pattern: `AGENTS.md` Safety Rules, Drift, and Eventual Consistency
  sections.
- Layer ownership: documentation only.
- Code placement: README and, if chosen, a `docs/` file.
- Integration boundary: none; human-facing operational guidance.
- Non-goals: no automation, no audit command, no deployment implementation.

## Contract Inventory

- Documented operator procedures (drift, account decommission, deployment
  decommission).

## Schema Ownership

- This slice owns no schema.

## Locked Field Definitions

### Account decommission procedure

- Ordered nine steps, ending with explicit protection removal then deliberate
  removal from the Organization or account closure.

### Deployment decommission procedure

- Ordered ten steps, with retain configuration and explicit unprotection
  separated by a verified `pulumi up`.

## Type / Schema Touchpoints

- Filled by refine-plan.

## Mapping Boundaries

- TBD during refine-plan.

## Invariants

- Documentation never claims complete drift detection.
- No procedure combines a protection change with a destroy in one operation.
- A normal `pulumi up` never closes an account.

## Compatibility / Migration Notes

- Documentation only; no code or state change.

## Likely File Touchpoints

- Filled by refine-plan.

## Implementation Notes

- Filled by refine-plan.

## Verification

- Automated:
  - Filled by refine-plan.
- Manual:
  - Filled by refine-plan.

## Edge Cases

- Filled by refine-plan.

## Acceptance Criteria

1. Filled by refine-plan.
2. Filled by refine-plan.
3. Filled by refine-plan.
