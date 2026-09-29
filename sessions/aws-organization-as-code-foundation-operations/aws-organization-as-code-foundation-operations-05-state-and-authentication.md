# AWS Organization as Code Foundation and Operations: State and Authentication

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- One stack per AWS Organization prevents a dev/staging/prod split from forking
  a single organization's state, which is how an organization gets destroyed
  by accident.
- The framework must work with Pulumi Cloud and a DIY (S3) backend without
  depending on Cloud-specific APIs, and must not require long-lived AWS access
  keys.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 4 (one stack per organization, Cloud or DIY, no Cloud-specific
    framework APIs)
  - Requirement 5 (Identity Center credentials, no long-lived keys)
- Source Sections 88, 89, 90

## Objective

- The repository's state and credential model is configured and documented:
  one long-lived stack per organization, both supported backends, and an
  Identity Center credential path that requires no access keys.

## Scope

- In:
  - `Pulumi.yaml` stack configuration and any backend setup guidance for
    Pulumi Cloud and a DIY S3 backend
  - Documented and scripted Identity Center sign-in path (`aws sso login` with
    a profile, then `AWS_PROFILE` for Pulumi)
  - Documentation stating the one-stack-per-organization rule and that
    dev/staging/prod copies are permitted only for genuinely separate AWS
    Organizations
  - A check that framework source does not depend on Pulumi Cloud-specific APIs
- Out:
  - The safe deploy command and CI workflow (slice 08)
  - The provider pin and lockfile (slice 01)
  - Any backend-specific infrastructure beyond what the framework itself needs
  - Cross-account credential design (deferred; deployments workstream, Source
    Sections 80-81)

## System Components (Slice View)

- `Pulumi.yaml` / stack config: one stack per organization
- Backend configuration: Pulumi Cloud or DIY S3, no Cloud API dependency
- Credential setup: `aws sso login` plus `AWS_PROFILE`, documented and scripted

## System Flow (Slice Flow)

1. An operator signs in with `aws sso login --profile org-admin`.
2. Pulumi runs against the single stack for that organization with
   `AWS_PROFILE` set.
3. Backend choice is an operational decision; the framework behaves identically
   on both.
4. Preview and up operate on the same state, so changes are visible before they
   apply.

## Inputs / Outputs (Known So Far)

- Inputs:
  - AWS credentials from IAM Identity Center (no long-lived keys)
  - Selected backend and stack name (operational input)
- Outputs:
  - A single Pulumi state per organization
  - Working preview/up under Identity Center credentials

## Dependencies

- Requires:
  - 01 (project skeleton, Pulumi program)
- Blocks / Enables:
  - 08 (CI and safe deploy run against this state model)
  - 10 (drift and decommission documentation)

## Open Questions

- Which backend is this repository configured for today: Pulumi Cloud or DIY
  S3? The source supports both; the repo must pick one and document it.
- Should backend choice be documented only, or scripted (for example a
  `pulumi login` bootstrap script)? `AGENTS.md` currently documents neither.
- Are stack config values (for example backend URL) committed, supplied
  per-stack, or passed as secrets?
- What is the exact CI credential path? `AGENTS.md` documents human sign-in
  only; OIDC is not mentioned anywhere in the source or this repo.

## Risks / Unknowns

- Creating a second stack for the same organization is the primary state-fork
  risk this slice must prevent; a mechanical guard is undefined.
- Long-lived keys leaking into CI would violate Requirement 5, but no CI
  credential mechanism is specified anywhere in the evidence.
- DIY backend setup is error-prone and the failure mode is state loss; the
  documentation must be explicit.

## Implementation Plan

1. Choose and configure the backend for this repository; document the setup.
2. Add stack configuration and the one-stack-per-organization statement.
3. Document the Identity Center credential path and any helper script.
4. Verify preview and up work with Identity Center credentials and no access
   keys.
5. Record the CI credential path or mark it TBD for slice 08.

## Initial Acceptance Shape

1. `pulumi preview` succeeds with Identity Center credentials and no static
   access keys in the environment.
2. The configured backend holds a single stack for the organization.
3. No framework source file imports or calls a Pulumi Cloud-specific API.
4. The one-stack-per-organization rule and both supported backends are
   documented.

## Notes for Refinement

- Do not add a multi-environment framework. Environment separation happens
  across genuinely separate organizations (Source Section 88).
- The CI credential question is a real gap: the source requires protected
  deployment without naming a mechanism. Surface it rather than inventing OIDC
  configuration.
- A "no second stack" guard is likely out of scope for KISS/YAGNI; decide
  whether documentation alone satisfies Requirement 4.

## Contracts / Decisions Locked For This Slice

- Agent-Owned: one long-lived Pulumi stack per AWS Organization; no
  dev/staging/prod copies of one organization (Source Section 88, DEC-004).
- Agent-Owned: support Pulumi Cloud and DIY (S3) backends with no dependence
  on Cloud-specific APIs (Source Section 89, DEC-004).
- Agent-Owned: Identity Center credentials for development; no long-lived
  access keys required (Source Section 90).
- TBD during refine-plan: backend selection, bootstrap scripting, CI credential
  mechanism.

## Architecture Decisions For This Slice

- Reuse pattern: `AGENTS.md` Environment section credential flow.
- Layer ownership: operational configuration, not framework code.
- Code placement: `Pulumi.yaml`, stack config, documentation; no `src/` changes
  expected.
- Integration boundary: Pulumi backend and AWS credential resolution.
- Non-goals: no cross-account role design, no environment matrix, no managed
  credential infrastructure.

## Contract Inventory

- Backend selection and setup instructions.
- Credential flow for humans and, if decided, CI.

## Schema Ownership

- This slice owns stack/backend configuration shape.
- Sibling workstreams own resource-level configuration.

## Locked Field Definitions

### Stack model

- One stack per AWS Organization - identity rule, not a field.
- Backend: Pulumi Cloud or DIY S3 - operational selection, TBD.

## Type / Schema Touchpoints

- Filled by refine-plan.

## Mapping Boundaries

- environment credentials -> Pulumi process environment

## Invariants

- One stack per organization.
- No long-lived access keys are required.
- Framework source is backend-agnostic.

## Compatibility / Migration Notes

- TBD during refine-plan (backend choice may require initial state migration).

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
