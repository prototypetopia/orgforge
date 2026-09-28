# <Workstream>: <slice title>

**Owner:** TBD
**Status:** Planned
**Last updated:** <YYYY-MM-DD>
**Tracked by:** `sessions/<slug>/<slug>-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- <why this slice matters now>
- <what capability it unlocks or risk it reduces>

## PRD Traceability

- `sessions/<slug>/<slug>-prd.md#<section>`
- <requirement / architecture step / acceptance criterion covered by this slice>

## Objective

- <smallest independently useful outcome>

## Scope

- In:
  - <specific behavior included in this slice>
  - <specific system boundaries touched>
- Out:
  - <specific behavior intentionally excluded>
  - <follow-up slices that own deferred work>

## System Components (Slice View)

- <component / module / boundary>: <role in this slice>
- <component / module / boundary>: <role in this slice>
- <component / module / boundary>: <role in this slice>

## System Flow (Slice Flow)

1. <step introduced or changed by this slice>
2. <next step>
3. <next step>
4. <result / output / state change>

## Inputs / Outputs (Known So Far)

- Inputs:
  - <request / event / entity / dependency or TBD>
- Outputs:
  - <response / event / persisted state / UI effect or TBD>

## Dependencies

- Requires:
  - <prior slice, existing domain, infra, or None>
- Blocks / Enables:
  - <later slice(s) enabled by this work>

## Open Questions

- <question that must be answered during refine-plan>
- <question that must be answered during refine-plan>

## Risks / Unknowns

- <authz / ordering / idempotency / migration / UX / replay / performance risk>
- <unknown that could change implementation details>

## Implementation Plan

1. <initial high-level work bucket>
2. <initial high-level work bucket>
3. <initial high-level work bucket>

## Initial Acceptance Shape

1. <high-level testable outcome>
2. <high-level testable outcome>
3. <high-level compatibility / non-regression outcome>

## Notes for Refinement

- Expand contracts and locked decisions
- Identify likely file touchpoints
- Add verification commands
- Add edge cases and failure behavior
- Replace TBDs before implementation

## Contracts / Decisions Locked For This Slice

- <filled by refine-plan>

## Architecture Decisions For This Slice

- Reuse pattern: <existing repo or workstream pattern this slice must follow>
- Layer ownership: <adapter / feature / domain / db / frontend provider / infra boundary>
- Code placement: <where new logic belongs>
- Integration boundary: <api / event / storage / provider / ui boundary touched>
- Non-goals: <what this slice must not introduce structurally>

## Contract Inventory

- <shape introduced or changed by this slice>
- <request / response / event / domain entity / dto / db return contract>

## Schema Ownership

- `<path/to/file>` owns <transport / domain / persistence / event schema>
- `<path/to/file>` owns <canonical entity or dto>

## Locked Field Definitions

### <Shape Name>

- `<fieldName>: <type>` - <required|optional>, <nullable|non-null>, <default or omission behavior>
- `<fieldName>: <type>` - <allowed enum values / identity semantics / ordering semantics>

## Type / Schema Touchpoints

- `<path/to/file>`
- `<path/to/file>`

## Mapping Boundaries

- `<input shape>` -> `<normalized feature input>`
- `<feature/domain input>` -> `<domain entity or dto>`
- `<domain entity or dto>` -> `<transport or event payload>`

## Invariants

- <rule that must stay true across files>
- <stable identity / enum / ordering / idempotency rule>

## Compatibility / Migration Notes

- <additive-only / placeholder-safe / versioning / no-backfill / same-slice update rule>

## Likely File Touchpoints

- <filled by refine-plan>

## Implementation Notes

- <filled by refine-plan>

## Verification

- Automated:
  - <filled by refine-plan>
- Manual:
  - <filled by refine-plan>

## Edge Cases

- <filled by refine-plan>

## Acceptance Criteria

1. <filled by refine-plan>
2. <filled by refine-plan>
3. <filled by refine-plan>
