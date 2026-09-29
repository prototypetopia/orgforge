# AWS Organization as Code Foundation and Operations: Naming Conventions

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- Pulumi resource names must derive from stable logical keys. If each
  workstream invents its own naming format, renaming a display name forks
  resources and cross-workstream references become unreadable.
- Sibling workstreams need one naming helper to call.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 1 (naming helpers deriving Pulumi names from stable logical
    keys)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#data-model-proposed`
  - Naming convention for Pulumi resources
- Source Sections 8, 105; `AGENTS.md` Stable Logical Identifiers

## Objective

- A Pulumi-free naming module in `src/naming/` that derives Pulumi resource
  names from stable logical keys, with unit tests covering the agreed format.

## Scope

- In:
  - `src/naming/resource-names.ts` deriving Pulumi resource names from stable
    logical keys
  - The name format for each resource class the framework owns (for example
    `Account-${accountKey}` per `AGENTS.md`)
  - Unit tests over the naming rules
- Out:
  - OU alias resolution and alias validation (org-structure owns aliases per
    PRD decision 2026-09-29 and DEC-008)
  - Logical OU path derivation (org-structure)
  - Raw-AWS-ID reference policy enforcement in configuration schemas
    (sibling workstreams)
  - Any Pulumi resource construction

## System Components (Slice View)

- `src/naming/resource-names.ts`: logical key -> Pulumi resource name
- Unit tests: naming determinism and format

## System Flow (Slice Flow)

1. A capability passes a stable logical key to a naming helper.
2. The helper returns the Pulumi resource name for that class.
3. The capability uses the returned name when constructing the resource.
4. A display-name change does not alter the Pulumi name.

## Inputs / Outputs (Known So Far)

- Inputs:
  - Stable logical key (string), resource class (TBD: enum, string union, or
    function per class)
- Outputs:
  - Pulumi resource name string

## Dependencies

- Requires:
  - 01 (project skeleton)
  - 02 (test harness)
- Blocks / Enables:
  - All sibling workstreams that construct resources

## Open Questions

- One function per resource class, or a single function taking a class
  discriminator? `AGENTS.md` shows `Account-${key}` but does not specify the
  general shape.
- How are nested logical keys (for example OU paths) rendered into a Pulumi
  name: flattened with a separator, or only the leaf key?
- What happens on a name collision between two logical keys?
- Is there a maximum-length or character-constraint rule for Pulumi names?

## Risks / Unknowns

- A naming format locked before siblings exist may need to change once OU,
  policy, and deployment names land, which would rename resources.
- Deriving names only from the leaf key risks collisions across OUs.

## Implementation Plan

1. Inventory the resource classes the framework will construct.
2. Choose the helper shape and derive the format per class from logical keys.
3. Implement in `src/naming/` with no Pulumi import.
4. Add unit tests for format, determinism, and collision behavior.

## Initial Acceptance Shape

1. Unit tests assert the documented format for each resource class.
2. The naming module imports no Pulumi module.
3. Renaming a display name does not change the derived Pulumi name.
4. Two distinct logical keys cannot produce the same Pulumi name for one class.

## Notes for Refinement

- Keep it a pure function per class; no registry, no plugin lookup.
- Alias handling stays out (org-structure). If a sibling needs a name derived
  from an alias, that is a new decision, not an extension here.

## Contracts / Decisions Locked For This Slice

- Agent-Owned: Pulumi resource names derive from stable logical keys, never
  from display names or raw AWS IDs (Source Section 8, Section 119 rule 6,
  `AGENTS.md`).
- Agent-Owned: Pulumi-free naming helpers live in `src/naming/`
  (`AGENTS.md`).
- User-approved: org-structure owns OU aliases; foundation provides naming
  conventions only (PRD decision 2026-09-29, DEC-008).
- TBD during refine-plan: helper shape, per-class format, collision handling.

## Architecture Decisions For This Slice

- Reuse pattern: `AGENTS.md` naming conventions table and Pulumi resource
  pattern.
- Layer ownership: pure naming utility.
- Code placement: `src/naming/`.
- Integration boundary: consumed by every capability's resource constructor.
- Non-goals: no alias resolution, no OU path derivation, no Pulumi.

## Contract Inventory

- Logical key + resource class -> Pulumi resource name.

## Schema Ownership

- This slice owns the naming format contract.
- org-structure owns logical keys and OU paths.

## Locked Field Definitions

### Naming input

- `logicalKey: string` - required, stable, framework identity.
- `resourceClass` - required, one of the framework's resource classes (exact
  representation TBD).

## Type / Schema Touchpoints

- Filled by refine-plan.

## Mapping Boundaries

- stable logical key -> Pulumi resource name

## Invariants

- Output depends only on the logical key and class.
- Output never contains a display name or AWS ID.

## Compatibility / Migration Notes

- Changing the format later renames resources; treat a format change as a
  reviewed infrastructure change.

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
