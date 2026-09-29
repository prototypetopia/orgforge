# AWS Organization as Code Foundation and Operations: Layered Architecture and Validation Framework

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- Sibling workstreams need one place to plug in validators and one way to
  enforce that pure logic does not import Pulumi.
- Without a shared structured error type, each capability invents its own error
  shape and the "actionable error" quality bar cannot be checked.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 3 (validate the complete logical model before dependent
    resources, actionable errors)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#api-contracts-high-level`
  - API contract 2 (validation CLI)
- Source Sections 6, 82

## Objective

- A shared `ValidationError` shape, a validation entrypoint that collects
  capability validators, and a `pnpm validate` command that reports every
  offending reference without requiring AWS credentials.

## Scope

- In:
  - `src/validation/` with the shared `ValidationError` type (`code`,
    `message`, optional `reference`)
  - An aggregation entrypoint that runs registered validators and returns
    structured errors
  - `pnpm validate`, taking the full configuration and printing actionable
    errors, making no AWS calls
  - The layer-directory skeleton from `AGENTS.md` with the purity rule recorded
    as a placement rule
  - Unit tests over the aggregation behavior and error shape
- Out:
  - Specific validators for organization, account sets, policies, Identity
    Center, or deployments (sibling workstreams)
  - `OrganizationDefinition` and its schema (org-structure)
  - The pure OU graph, `AccountModel`, and account-set evaluation
    (account-targeting and org-structure)
  - The auto-enforcement mechanism for the purity rule (see Open Questions)

## System Components (Slice View)

- `src/validation/`: shared error type and validator aggregation
- `pnpm validate`: credential-free configuration validation entrypoint
- Layer directories (`src/types/`, `src/model/`, `src/runtime/`,
  `src/naming/`, and the capability directories): the five-layer skeleton
- Unit tests: validation aggregation and error-shape behavior

## System Flow (Slice Flow)

1. Configuration is passed to the validation entrypoint.
2. Registered capability validators run against the pure model.
3. Structured errors are collected, not thrown one at a time.
4. `pnpm validate` prints every error with its `code` and `reference` and exits
   non-zero.

## Inputs / Outputs (Known So Far)

- Inputs:
  - The full organization configuration (TBD: exact shape owned by
    org-structure)
- Outputs:
  - `ValidationError[]`, each naming the exact offending reference
  - Non-zero exit on any error

## Dependencies

- Requires:
  - 01 (project skeleton, typecheck)
  - 02 (test harness for the unit tier)
- Blocks / Enables:
  - 08 (CI runs configuration validation)
  - All sibling workstreams, which supply capability validators

## Open Questions

- How do sibling workstreams register validators: an exported array per
  capability directory, or a central registry module that imports each?
- Is the validator signature `(config) => ValidationError[]` or
  `(model) => ValidationError[]`, given the model does not exist yet?
- Should the purity rule be enforced mechanically (an ESLint `no-restricted-imports`
  rule, or a test asserting `src/model/` and `src/validation/` do not import
  Pulumi), and does that enforcement belong here or to account-targeting?
- Does `pnpm validate` fail fast or report all errors? `AGENTS.md` implies full
  collection but does not say.

## Risks / Unknowns

- Creating the aggregation before any real validator exists risks an interface
  that does not fit the siblings' needs; keep it minimal.
- The pure-model dependency chain is unsettled until org-structure and
  account-targeting land, so the validator input type is likely to change.

## Implementation Plan

1. Create the layer directories with minimal placeholder exports.
2. Add the shared `ValidationError` type and a validator signature.
3. Add the aggregation entrypoint and `pnpm validate`.
4. Add unit tests for aggregation, error shape, and exit behavior.
5. Decide the purity-enforcement mechanism and record it in `AGENTS.md` if
   mechanical.

## Initial Acceptance Shape

1. `pnpm validate` runs on a configuration with a known-bad reference and
   prints an error naming the exact reference, with no AWS credentials.
2. Multiple errors are reported in one run rather than failing on the first.
3. Unit tests cover error shape and aggregation, importing no Pulumi module.

## Notes for Refinement

- Keep the entrypoint small (YAGNI). Do not build a plugin registry, a schema
  language, or a config file format that no sibling requires.
- If the purity enforcement belongs to account-targeting per the decomposition
  index, record that here as a decision and place the mechanism in the slice
  that owns it.
- Consider whether `pnpm validate` should be able to consume a model object in
  tests without a Pulumi runtime.

## Contracts / Decisions Locked For This Slice

- Agent-Owned: validators are pure functions returning `ValidationError[]`,
  never throw, and never import Pulumi (`AGENTS.md` validation pattern, Source
  Section 82).
- Agent-Owned: `ValidationError` carries `code`, `message`, and optional
  `reference` (`AGENTS.md`).
- User-approved: fail on ambiguous or unsupported behavior rather than
  guessing (Source Section 119 rule 49, PRD DEC-007/008 carry-over).
- Agent-Owned: directory layout from `AGENTS.md` replaces the source's
  illustrative Section 7 tree (PRD decision 2026-09-29).
- TBD during refine-plan: validator signature, registration mechanism, purity
  enforcement.

## Architecture Decisions For This Slice

- Reuse pattern: `AGENTS.md` validation pattern and file placement rules.
- Layer ownership: pure validation layer; no Pulumi.
- Code placement: `src/validation/`; layer directories per `AGENTS.md`.
- Integration boundary: `pnpm validate` script.
- Non-goals: no schema DSL, no validator for any capability, no OU alias
  resolution (org-structure owns aliases).

## Contract Inventory

- `ValidationError` shape.
- Validation entrypoint signature.
- `pnpm validate` exit-code behavior.

## Schema Ownership

- `src/validation/` owns the validation error contract.
- org-structure owns the configuration schema.

## Locked Field Definitions

### ValidationError

- `code: string` - required, stable identifier asserted by tests.
- `message: string` - required, human-readable, names the offender.
- `reference?: string` - optional, the exact account set, OU path, account, or
  policy at fault.

## Type / Schema Touchpoints

- Filled by refine-plan.

## Mapping Boundaries

- configuration -> validator input (shape TBD, owned by org-structure)
- validator results -> `ValidationError[]` -> CLI output

## Invariants

- Validators never import Pulumi and never throw.
- Validation runs before dependent resource construction wherever possible.
- Errors name the exact offending reference.

## Compatibility / Migration Notes

- Additive only; no configuration changes in this slice.

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
