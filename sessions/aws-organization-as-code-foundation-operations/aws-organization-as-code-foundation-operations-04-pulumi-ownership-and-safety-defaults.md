# AWS Organization as Code Foundation and Operations: Pulumi Ownership and Safety Defaults

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- Protection defaults are the primary guard against destroying an entire AWS
  account or organization-wide infrastructure, and they must be defined once,
  centrally, before any resource exists.
- Pulumi ownership of the whole configuration surface needs a single stated
  boundary so a later slice does not quietly hand a resource to the SDK or to a
  manual step.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 2a (Pulumi ownership wherever AWS permits; Identity Center
    instance is the known manual bootstrap exception)
  - Requirement 8 (preview mandatory, high-risk list)
  - Requirement 9 (protect the Section 94 minimum set)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#data-model-proposed`
  - Protection rules for resource classes
- Source Sections 2.3, 93, 94, 19, 115

## Objective

- One central policy module declaring the Pulumi ownership boundary and the
  protection requirement for each resource class in the Section 94 minimum set,
  plus the preview high-risk list as a reviewable artifact, with unit tests over
  the policy data.

## Scope

- In:
  - A central, Pulumi-free module declaring which resources the framework
    owns, with the organization-level Identity Center instance recorded as the
    manual bootstrap exception
  - A central protection policy: resource class -> protected by default, with
    critical policies available as opt-in
  - The Section 93 high-risk preview list as a named, reviewable artifact
  - Unit tests asserting the policy covers every Section 94 entry
- Out:
  - Constructing any AWS resource (sibling workstreams; org-structure owns
    `Organization`, accounts, and `closeOnDeletion: false`)
  - Asserting `protect` on real resources (belongs to each owning workstream's
    mock tests per PRD Acceptance 6)
  - Account and deployment decommission procedures (documentation slice 10)

## System Components (Slice View)

- Ownership boundary declaration: which resources are Pulumi-managed
- Protection policy module: resource class -> protection requirement
- Preview high-risk list: the Section 93 review triggers
- Unit tests: policy completeness

## System Flow (Slice Flow)

1. The framework consults the protection policy when a resource class is
   constructed.
2. Sibling workstreams pass the policy's requirement through to their resource
   options.
3. The high-risk list drives the documented preview review step.
4. A routine destroy fails on a protected resource before anything is removed.

## Inputs / Outputs (Known So Far)

- Inputs:
  - Resource class identifier (TBD: exact type shape)
- Outputs:
  - Protection requirement per class; documented ownership boundary; preview
    review list

## Dependencies

- Requires:
  - 01 (project skeleton)
  - 02 (test harness)
- Blocks / Enables:
  - 10 (safety documentation references these policies)
  - All sibling workstreams that construct protected resources

## Open Questions

- What is the resource-class identifier shape: a string union, a symbol, or an
  enum? It must be stable and Pulumi-free.
- How does a policy that says "protected by default" interact with a
  deliberate unprotect for decommission? Is the unprotect an explicit override
  argument, a config flag, or an out-of-band `pulumi state` change?
- Is the ownership boundary a documented list, a typed constant, or both?
  `AGENTS.md` asserts a hard boundary, but the enforcement mechanism is
  unspecified.
- Should the preview high-risk list be machine-readable so a future wrapper can
  classify a preview diff, or documentation only?

## Risks / Unknowns

- A protection policy that is advisory rather than enforced gives false
  confidence; the enforcement point is undefined until the first resource
  exists.
- Over-abstracting the policy before sibling resources exist risks a shape that
  does not fit (KISS/YAGNI).
- The ownership boundary is unverifiable by test while no resources exist.

## Implementation Plan

1. Enumerate the Section 94 minimum set and the opt-in critical policies.
2. Add the protection policy module and its Pulumi-free unit tests.
3. Add the ownership boundary declaration including the Identity Center
   bootstrap exception.
4. Add the Section 93 high-risk list.
5. Define the explicit-unprotect shape for decommission use, or record it as
   TBD for the slice that performs decommissioning.

## Initial Acceptance Shape

1. Unit tests assert every Section 94 entry appears in the protection policy,
   with no Pulumi import.
2. The Identity Center instance is recorded as the only manual bootstrap
   exception.
3. The high-risk list contains every Section 93 item verbatim.
4. The policy data is consumable by a sibling workstream without importing
   Pulumi or the provider.

## Notes for Refinement

- Resist a general resource-metadata framework. A small map plus a lookup is
  enough until siblings demonstrate a need for more.
- The explicit-unprotect mechanism is genuinely deferred (slices 10 and the
  owning workstreams); do not implement a general override system here.

## Contracts / Decisions Locked For This Slice

- Agent-Owned: organization configuration is Pulumi-managed wherever AWS
  exposes an appropriate API; the organization-level Identity Center instance is
  the known manual bootstrap exception (Source Section 2.3).
- Agent-Owned: protect the Section 94 minimum set by default; critical policies
  are opt-in (Source Section 94).
- Agent-Owned: `pulumi preview` is mandatory before applying, with the Section
  93 high-risk list (Source Section 93).
- Agent-Owned: no automatic account closing during a normal `pulumi up`
  (Source Section 95, `AGENTS.md`).
- TBD during refine-plan: policy data shape, unprotect mechanism, enforcement
  point.

## Architecture Decisions For This Slice

- Reuse pattern: `AGENTS.md` Safety Rules and protection defaults.
- Layer ownership: pure policy data; no Pulumi.
- Code placement: TBD during refine-plan; a `src/` policy module is the
  expected home.
- Integration boundary: consumed by sibling resource constructors.
- Non-goals: no resource construction, no decommission workflow, no account
  closing logic.

## Contract Inventory

- Protection policy lookup by resource class.
- Ownership boundary declaration.
- Preview high-risk list.

## Schema Ownership

- This slice owns the protection policy and ownership boundary declarations.
- org-structure owns the `Organization` and `Account` resource classes.

## Locked Field Definitions

### Protection policy entry

- `resourceClass: string` - required, stable identifier, Pulumi-free.
- `protectedByDefault: boolean` - required; `true` for every Section 94 entry.
- `reason: string` - required, why protection applies.

## Type / Schema Touchpoints

- Filled by refine-plan.

## Mapping Boundaries

- resource class -> protection requirement -> sibling resource options
- preview change list -> review guidance

## Invariants

- Every Section 94 minimum entry is protected by default.
- Ordinary refactoring never removes protection.
- Pulumi names derive from stable logical keys, never display names or AWS IDs.

## Compatibility / Migration Notes

- Additive only; no configuration schema change in this slice.

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
