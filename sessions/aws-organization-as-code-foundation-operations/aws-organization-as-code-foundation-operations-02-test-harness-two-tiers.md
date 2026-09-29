# AWS Organization as Code Foundation and Operations: Test Harness Two Tiers

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- The framework's confidence rests on pure tests; every later slice needs a way
  to run them.
- The two tiers must be separated from the start, because a Pulumi mock test
  silently promoted into a unit test imports Pulumi into logic that is supposed
  to stay Pulumi-free.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#api-contracts-high-level`
  - API contract 3 (`pnpm test:unit` / `pnpm test:mock`)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 11 (two tiers, no live tier, no automatic org create/destroy)
- Source Section 98

## Objective

- `pnpm test:unit` and `pnpm test:mock` run Vitest over the two naming patterns,
  with at least one exemplar test per tier proving the harness works and
  requires no AWS credentials.

## Scope

- In:
  - Vitest configuration selecting `*.unit.test.ts` and `*.mock.test.ts` by
    tier, plus the combined `pnpm test`
  - One exemplar pure unit test and one exemplar Pulumi `setMocks` test,
    colocated next to the code they exercise
  - Script wiring for both tiers
- Out:
  - The behavior-specific test suites of later slices
  - Any live-AWS tier (explicitly out of scope; `TESTS.md` forbids proposing one)
  - The validation CLI (slice 05)

## System Components (Slice View)

- Vitest configuration: tier-to-pattern mapping
- `package.json` scripts: `test:unit`, `test:mock`, `test`
- Exemplar unit test: proves a pure function can be tested without Pulumi
- Exemplar mock test: proves `setMocks` intercepts before any AWS call

## System Flow (Slice Flow)

1. Vitest config maps each tier to its file suffix.
2. The unit script runs only pure tests; the mock script runs only mock tests.
3. The mock tier installs `setMocks` and constructs a resource without
   credentials.
4. Both tiers pass locally with no AWS environment.

## Inputs / Outputs (Known So Far)

- Inputs:
  - Test files under `src/` using the two suffixes
- Outputs:
  - Pass/fail per tier; no AWS calls; no credential requirement

## Dependencies

- Requires:
  - 01 (project skeleton, `typecheck` script)
- Blocks / Enables:
  - 03, 04, 05, 07, 08, 10 (all add tests)
  - 08 (CI runs both tiers)

## Open Questions

- Is the mock tier run in the same Vitest process as unit tests, or a separate
  project/workspace so `setMocks` module-global state cannot interact with unit
  tests?
- Should the unit tier enforce "no Pulumi import" mechanically, or leave it to
  review?

## Risks / Unknowns

- `setMocks` installs module-global runtime state; sharing a process with unit
  tests could mask a purity violation.
- An exemplar test written before any real module exists may not survive slice
  03; plan to relocate or replace it.

## Implementation Plan

1. Add Vitest and configure tier-to-suffix selection.
2. Wire the three scripts.
3. Add one exemplar unit test and one exemplar mock test.
4. Verify both tiers run with no AWS environment.

## Initial Acceptance Shape

1. `pnpm test:unit` runs only `*.unit.test.ts` and passes.
2. `pnpm test:mock` runs only `*.mock.test.ts` and passes.
3. Both tiers pass with no AWS credentials configured.

## Notes for Refinement

- The "unit tests must not import Pulumi" rule is a `TESTS.md` requirement; a
  mechanical check belongs in refine-plan if cheap, otherwise note it as a
  review rule.
- Purity-rule enforcement for `src/model/` and `src/validation/` is mapped to
  `aws-organization-as-code-account-targeting` in the decomposition index, not
  here. Do not expand this slice into that contract.

## Contracts / Decisions Locked For This Slice

- User-approved: Vitest with `pnpm test:unit` and `pnpm test:mock`; no live tier
  in ordinary CI (PRD DEC-006, `TESTS.md`).
- Agent-Owned: colocated test files, no global `test/` directory
  (`TESTS.md`).

## Architecture Decisions For This Slice

- Reuse pattern: `TESTS.md` test tiers, naming, and mock pattern.
- Layer ownership: test infrastructure only.
- Code placement: Vitest config at repo root; tests colocated in `src/`.
- Integration boundary: package scripts.
- Non-goals: no new production logic, no live tier, no snapshot of a
  nonexistent module.

## Contract Inventory

- Tier scripts and their file-selection rules.

## Schema Ownership

- TBD during refine-plan.

## Locked Field Definitions

### Test tier selection

- `test:unit`: `*.unit.test.ts` only.
- `test:mock`: `*.mock.test.ts` only.

## Type / Schema Touchpoints

- TBD during refine-plan.

## Mapping Boundaries

- TBD during refine-plan.

## Invariants

- Neither tier requires AWS credentials.
- A test file's suffix determines its tier.

## Compatibility / Migration Notes

- TBD during refine-plan.

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
