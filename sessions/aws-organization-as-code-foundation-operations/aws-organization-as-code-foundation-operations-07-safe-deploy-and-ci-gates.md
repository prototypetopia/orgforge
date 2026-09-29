# AWS Organization as Code Foundation and Operations: Safe Deploy Command and CI Gates

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- Account creation is the operation most likely to hit AWS Organizations
  throttling; unbounded Pulumi parallelism turns that into a failed or partial
  `up`.
- Organization modifications must never apply from an arbitrary branch, and
  every change must pass preview before it applies.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#api-contracts-high-level`
  - API contract 1 (`pnpm run deploy`)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 6 (CI gates, approved protected workflow)
  - Requirement 7 (safe deploy with enforced parallelism)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#acceptance-criteria`
  - Acceptance 4 (CI gate order, protected deployment)
  - Acceptance 5 (`--parallel 5`, used by CI)
- Source Sections 62, 91, 92, 115

## Objective

- `pnpm run deploy` runs `pulumi up --parallel 5`, and the repository has CI
  gates that run install, typecheck, both test tiers, configuration validation,
  and preview, with deployment only through an approved protected workflow.

## Scope

- In:
  - `pnpm run deploy` mapping to `pulumi up --parallel 5`, documented and used
    consistently
  - A CI pipeline running, in order: dependency install, typecheck,
    `pnpm test:unit`, `pnpm test:mock`, configuration validation, Pulumi preview
  - The approved protected deployment workflow definition, including the
    no-auto-deploy-from-arbitrary-branches rule
  - Documentation of the gate order and the safe command
- Out:
  - The specific CI platform (user decision 2026-09-29: scripts plus
    provider-agnostic gates; platform is TBD)
  - The CI credential mechanism (open in slice 05)
  - Concurrency throttling inside Pulumi programs (deferred in the
    decomposition index; Section 62 batching is not a v1 requirement)
  - Preview high-risk classification tooling (slice 04 provides the list)

## System Components (Slice View)

- `package.json` `deploy` script: the safe `pulumi up` invocation
- CI pipeline definition: gate order and preview
- Protected deployment workflow: approval-gated apply

## System Flow (Slice Flow)

1. A pull request runs install, typecheck, both test tiers, validation, and
   preview.
2. Only an approved, protected workflow may apply.
3. The apply step invokes the same `pnpm run deploy` command developers run.
4. Account creation proceeds with concurrency constrained to 5.

## Inputs / Outputs (Known So Far)

- Inputs:
  - A commit or pull request; AWS credentials for the preview step (TBD)
- Outputs:
  - Gate results; a preview artifact; an approval-gated apply

## Dependencies

- Requires:
  - 01 (typecheck, install)
  - 02 (test tiers)
  - 03 (`pnpm validate`)
  - 05 (backend, credentials)
- Blocks / Enables:
  - 08 (README safety documentation)

## Open Questions

- Which CI platform is used? Not named in the source, `AGENTS.md`, or this
  repo. Kept TBD per user decision 2026-09-29.
- How does CI obtain AWS credentials for the preview step (OIDC is not
  mentioned in any evidence)?
- Does the preview step need organization credentials, and against which stack
  in a multi-organization setup?
- Should `pnpm run deploy` require confirmation beyond Pulumi's own prompt?
- Is `--parallel 5` applied on every `up`, or only when account creation is
  detected? The source says "when account creation may occur"; the locked
  decision says the safe command always maps to `--parallel 5`.

## Risks / Unknowns

- Preview in CI against the real organization state can trigger AWS calls that
  are slow or throttled.
- A protected workflow cannot be verified in this repo without a CI platform;
  the evidence for the gate is documentation plus a pipeline definition.
- The decision that `--parallel 5` is always applied (rather than conditionally)
  is a locked operational choice, not a source requirement.

## Implementation Plan

1. Add the `deploy` script with `--parallel 5` and document it.
2. Define the CI gate order using the existing scripts.
3. Define the protected deployment workflow and branch rules.
4. Determine the CI credential path or record it as a blocker for CI preview.
5. Verify the gate order locally by running each command in sequence.

## Initial Acceptance Shape

1. `pnpm run deploy` invokes `pulumi up --parallel 5` and nothing else.
2. CI runs all six gates in order and fails on the first failing gate.
3. Deployment cannot be triggered from a non-protected branch path.
4. Documentation states that a stricter parallelism value requires
   re-approval.

## Notes for Refinement

- Do not build a generic CI/CD framework (explicit non-goal, Source Section 3).
- The CI platform question must be answered before the pipeline file can be
  written; do not guess a provider.

## Contracts / Decisions Locked For This Slice

- User-approved: `pnpm run deploy` maps to `pulumi up --parallel 5`
  (PRD DEC-006).
- User-approved: enforced parallelism is `--parallel 5`; a stricter value is an
  operational change requiring re-approval (PRD decision 2026-09-29).
- Agent-Owned: CI runs install, typecheck, both test tiers, validation, and
  preview; deployment requires an approved protected workflow; no auto-deploy
  from arbitrary branches (Source Section 91, DEC-005).
- User-approved 2026-09-29: scripts plus provider-agnostic gate definition; the
  CI platform is TBD.
- TBD during refine-plan: CI platform, CI credential mechanism, branch and
  approval configuration.

## Architecture Decisions For This Slice

- Reuse pattern: `AGENTS.md` CI/CD section and build/test commands.
- Layer ownership: repository scripts and pipeline definition.
- Code placement: `package.json`, CI config (TBD), documentation.
- Integration boundary: Pulumi CLI and CI provider (TBD).
- Non-goals: no generic pipeline framework, no conditional concurrency logic,
  no deployment orchestration logic.

## Contract Inventory

- `deploy` script -> `pulumi up --parallel 5`.
- CI gate order (six steps).
- Protected workflow definition (TBD platform).

## Schema Ownership

- This slice owns the gate order and the safe command.
- Sibling workstreams own what each gate validates.

## Locked Field Definitions

### Safe deploy command

- `deploy`: `pulumi up --parallel 5` - fixed value; changes require
  re-approval.

### CI gate order

1. dependency install
2. typecheck
3. `pnpm test:unit`
4. `pnpm test:mock`
5. configuration validation
6. Pulumi preview

## Type / Schema Touchpoints

- Filled by refine-plan.

## Mapping Boundaries

- gate command -> underlying script
- approval -> `pulumi up` invocation

## Invariants

- The same safe command runs locally and in CI.
- Organization modifications never apply from an arbitrary branch.
- Preview precedes every apply.

## Compatibility / Migration Notes

- TBD during refine-plan (adding CI credentials may require a protected-branch
  setup change).

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
