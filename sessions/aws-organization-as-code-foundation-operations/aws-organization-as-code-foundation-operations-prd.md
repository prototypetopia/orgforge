# PRD: AWS Organization as Code Foundation and Operations

## Context

The source PRD (v2.1, `sessions/aws-organization-as-code-source-prd.md`) defines a greenfield Pulumi-based replacement for OrgFormation: TypeScript configuration over AWS Organizations, Identity Center, and service-managed CloudFormation StackSets, with Pulumi state and preview plus strong destructive-change protections (Preamble; Section 1). Every capability workstream needs the same project rails: a pinned provider, a layered architecture with a Pulumi-independent pure model, a validation quality bar, one-stack-per-organization state, Identity Center credential auth, CI with preview, a safe deploy command, protection defaults, and documented drift and consistency behavior (Sections 4-7, 82, 88-98).

---

## Problem

- Without a pinned provider policy, AWS API capabilities get assumed before `@pulumi/aws` exposes them, producing late runtime failures instead of explicit configuration errors (Section 5).
- Without enforced layering, Pulumi Outputs leak into target resolution and validation, making organization logic untestable (Section 6).
- Without one-stack-per-organization discipline, dev/staging/prod copies of a single organization fork state and invite cross-environment destruction (Section 88).
- Without mandatory preview, protected workflows, and protection defaults, routine automation can silently remove accounts, policies, or organization-wide deployments (Sections 91-95).
- Without documented drift and consistency rules, console edits and propagation delays get misdiagnosed as framework bugs (Sections 96-97).

---

## Goals

- Provide a strict TypeScript + Pulumi project foundation with a pinned `@pulumi/aws` version, naming helpers, and a validation framework (Section 105).
- Enforce the five-layer architecture with a Pulumi-independent pure model (Section 6).
- Validate the complete logical model before dependent resources with actionable errors (Section 82).
- Operate one long-lived Pulumi stack per AWS Organization on Pulumi Cloud or DIY backends (Sections 88-89).
- Authenticate development with IAM Identity Center credentials and no required long-lived keys (Section 90).
- Gate changes through CI (install, typecheck, unit tests, validation, preview) and an approved protected deployment workflow with a safe `npm run deploy` command (Sections 91-92, 62).
- Make routine automation incapable of silently removing protected accounts or deployments (Section 115).

---

## Decisions Locked

- 2026-09-28 Recorded from source; original decision date unknown: Use TypeScript with `@pulumi/pulumi`, `@pulumi/aws`, and AWS SDK v3 contained to provider gaps (Section 4).
- 2026-09-28 Recorded from source; original decision date unknown: Keep OrgFormation, Terraform CLI, CDKTF, Control Tower, AFT, LZA, and SST out of this project without a separate architecture decision; SST apps stay separate state boundaries (Section 4).
- 2026-09-28 Recorded from source; original decision date unknown: Pin `@pulumi/aws` via lockfile; behavior follows the pinned provider; unsupported requests fail explicitly; no silent `@pulumi/aws-native`; upgrades are infrastructure changes (Section 5).
- 2026-09-28 Recorded from source; original decision date unknown: Five layers with Pulumi-independent target resolution, account-set evaluation, OU traversal, dependency analysis, and most validation (Section 6).
- 2026-09-28 Recorded from source; original decision date unknown: Stable TypeScript logical keys own framework identity; Pulumi names derive from them; no raw AWS IDs in human-authored config when a logical reference resolves (Section 8; Section 119 rule 6).
- 2026-09-28 Recorded from source; original decision date unknown: One long-lived Pulumi stack per AWS Organization; Pulumi Cloud and DIY backends; no Cloud-specific framework APIs (Sections 88-89).
- 2026-09-28 Recorded from source; original decision date unknown: Identity Center credentials for development; no long-lived access keys required (Section 90).
- 2026-09-28 Recorded from source; original decision date unknown: CI runs install, typecheck, unit tests, validation, and preview; no auto-deploy from arbitrary branches (Section 91).
- 2026-09-28 Recorded from source; original decision date unknown: `npm run deploy` with org-safe defaults and enforced parallelism (`--parallel 5` or lower) used consistently by CI (Sections 62, 92).
- 2026-09-28 Recorded from source; original decision date unknown: Mandatory `pulumi preview` with explicit high-risk list (Section 93).
- 2026-09-28 Recorded from source; original decision date unknown: Protected-resources minimum set including Organization, accounts, StackSets access, artifact bucket, StackSets, StackInstances, and critical management stacks (Section 94).
- 2026-09-28 Recorded from source; original decision date unknown: Console changes are drift; refresh plus preview guidance with StackSet caveats; deliberate imports only (Section 96).
- 2026-09-28 Recorded from source; original decision date unknown: Dependency edges first, provider/SDK waiters, no arbitrary sleeps, documented unavoidable cases, useful errors (Section 97).
- 2026-09-28 Recorded from source; original decision date unknown: Pure unit tests plus Pulumi mock tests; no automatic org create/destroy in ordinary CI (Section 98).
- 2026-09-28 Recorded from source; original decision date unknown: Platform-behavior conflicts resolved by verifying current docs/API, documenting the conflict, and following verified behavior (Section 119 rule 50).

## Decisions Proposed (Pending Approval)

- 2026-09-28 Agent-Recommended: Adopt the Section 7 directory layout as the starting skeleton, treating it as recommended rather than normative since the source marks it "Recommended" - rationale: it gives siblings stable homes without locking file paths prematurely.
- 2026-09-28 Agent-Recommended: Prefer secret references (Secrets Manager, SSM, dynamic references) over plaintext secret StackSet parameters, preserving Pulumi secret semantics where secrets must flow as parameters - rationale: Section 71 states this as a preference ("Prefer"), not an absolute, so parameter-secret edge cases stay open for `/refine-prd`.

---

## Non-Goals (V1)

- AWS Control Tower, Account Factory for Terraform, Landing Zone Accelerator (Section 3).
- Terraform, CDK, SST inside this project; generic task runners, CI/CD frameworks, CloudFormation preprocessors (Sections 3-4).
- Nunjucks templating, custom `!Sub`/`!Join`, generic `Foreach`, shell/Terraform/Serverless/CDK task execution (Section 3).
- OrgFormation annotated per-resource CloudFormation compiler recreation (Section 103).
- Automatic dev/staging/prod organization copies (Section 88).
- Per-account parameter overrides before the dedicated spike completes (Section 73; Section 119 rule 44).
- Cross-account/cross-deployment outputs before security design approval (Sections 80-81; Section 119 rule 45).
- Future read-only audit command, except as needed for a critical drift gap (Section 79).
- Sibling capability scope: OU/account resources, account-set semantics, policy content, Identity Center objects, and StackSet deployment modes live in their own workstreams.

---

## User Stories

- As a platform engineer, I can scaffold the project with typecheck, tests, and a pinned provider so that minimal config previews cleanly (Section 105).
- As an operator, I can run `npm run deploy` with safe parallelism so that account creation never relies on undocumented provider serialization (Sections 62, 92).
- As a reviewer, I can require preview on every PR through a protected workflow so that organization modifications never auto-deploy from arbitrary branches (Section 91).
- As an organization owner, I can rely on protection defaults and explicit decommission workflows so that routine refactors never silently destroy the organization (Sections 94-95).
- As a developer, I can read validation errors naming the exact account set, OU path, or policy at fault so that misconfiguration is fixable without console inspection (Section 82).

---

## Requirements

### Functional

1. Scaffold strict TypeScript + Pulumi project with provider pinning, naming helpers, aliases, validation framework, and tests such that typecheck passes, tests execute, and minimal config previews (Section 105).
2. Enforce pinned-provider behavior: unions and limits reflect the pinned `@pulumi/aws`; unsupported requests fail with explicit upgrade guidance (Sections 5, 85).
3. Validate the complete logical model before constructing dependent resources wherever possible, with actionable errors naming the offending reference (Section 82; example in Section 82).
4. Operate one long-lived stack per organization on Pulumi Cloud or DIY backends without Cloud-specific framework APIs (Sections 88-89).
5. Authenticate via IAM Identity Center credentials (`aws sso login`, `AWS_PROFILE`) without requiring long-lived keys (Section 90).
6. Run CI with dependency install, typecheck, unit tests, configuration validation, and Pulumi preview; deploy only via approved protected workflow (Section 91).
7. Provide `npm run deploy` with org-safe defaults and enforced parallelism, used consistently by CI (Sections 62, 92).
8. Require `pulumi preview` before applying, with review attention on the Section 93 high-risk list.
9. Protect the Section 94 minimum set by default, including critical management-account stacks and optionally critical policies.
10. Document drift handling (refresh plus preview, StackSet limitations, no auto-adoption, deliberate imports) and consistency handling (dependency edges, waiters, no arbitrary sleeps) (Sections 96-97).
11. Implement the Section 98 testing strategy: pure unit tests, Pulumi mock tests for resources and options, no automatic org create/destroy in ordinary CI.

### Non-Functional

- Security: no long-lived keys required; no unmanaged credentials for future cross-account designs (Sections 90, 81).
- Privacy/Compliance: no secret leakage into previews or logs; secret references preferred (Sections 70-71).
- Observability: safe parallelism documented; unavoidable propagation cases documented with useful errors (Sections 62, 97).
- Scalability: account-creation concurrency constrained rather than relying on arbitrary Pulumi parallelism (Section 62).

---

## Proposed Architecture (V1)

Single-stack organization lifecycle: typed TypeScript configuration -> schema plus semantic validation (Pulumi-independent) -> pure organization model -> Pulumi runtime (ComponentResources, Outputs, AccountContext) -> AWS resources (Section 6). Cross-cutting rails owned here: pinned provider policy (Section 5), logical-key identity (Section 8), validation quality bar (Section 82), state and backend (Sections 88-89), auth (Section 90), CI and safe deploy (Sections 62, 91-92), preview and protections (Sections 93-94), drift and consistency (Sections 96-97). Sibling inputs: capability validators plug into the shared framework; capability resources inherit protection defaults and the safe deploy path. Shared constraints from the decomposition index (provider pinning, logical identity, pure-model layering, protection defaults, technology exclusions) apply in full.

---

## Data Model (Proposed)

Framework-level entities: pinned provider version record, `OrganizationDefinition` top-level shape (owned structurally by org-structure; referenced here for validation ordering), validation error type with source locators, protection metadata (protect flags per resource class), deployment command configuration (parallelism value), backend configuration (Cloud vs DIY pointer). Invariants: validation runs before dependent construction where possible; protection defaults cannot be weakened by ordinary refactoring; state identity is one stack per organization.

---

## API Contracts (High-Level)

1. `npm run deploy`
   - Input: organization configuration checkout with AWS Identity Center credentials.
   - Output: Pulumi up with org-safe defaults and constrained parallelism.
   - Behavior: same safe command locally and in CI (Sections 62, 92).
2. `npm run audit` (deferred, post-v1)
   - Input: configured vs actual organization state.
   - Output: read-only drift comparison.
   - Behavior: recommended future command; only accelerated if needed for a critical drift gap (Section 79).
3. Validation CLI (configuration validation in CI)
   - Input: full organization configuration.
   - Output: actionable errors naming exact references.
   - Behavior: runs before dependent resource construction where possible (Section 82).

---

## Session State Machine (If Applicable)

- Not applicable (no session state machine; single-stack lifecycle only).

---

## Security and Privacy

- IAM Identity Center credentials for human and CI access; no long-lived access keys required (Section 90).
- Protected deployment workflow; no auto-deploy from arbitrary branches (Section 91).
- Mandatory preview for high-risk changes; explicit decommission workflows for accounts and deployments (Sections 93, 95; Section 77).
- Secret references preferred; Pulumi secret semantics preserved where secrets flow as parameters (Section 71).

---

## Acceptance Criteria

1. Typecheck passes, tests execute, provider version is pinned, and minimal config previews (Section 105).
2. Requesting an AWS-supported but provider-unsupported feature fails explicitly with upgrade guidance (Sections 5, 85).
3. Validation errors name the exact offending reference (e.g. account set plus OU path) rather than generic messages (Section 82).
4. CI runs install, typecheck, unit tests, validation, and preview; deployment requires the approved protected workflow (Section 91).
5. The safe deploy command constrains parallelism for account creation and is used by CI (Sections 62, 92).
6. Routine automation cannot silently remove protected accounts or organization-wide deployments (Section 115).
7. README documents StackSet drift limitations and the refresh-plus-preview workflow (Sections 78, 96).

---

## Rollout Plan

1. Dev/Staging: scaffold project, pin provider, implement validation framework and safe deploy script; preview minimal config against a genuinely separate test organization only.
2. Pilot: enable CI gates and protected workflow; verify preview, protections, and drift documentation with sibling workstreams.
3. Full rollout: adopt as the mandatory foundation for all organization changes; provider upgrades reviewed as infrastructure changes (Section 5).

---

## Metrics

- TBD (no source-defined metrics; success is observed through Section 105 and Section 115 acceptance).

---

## Open Questions

1. Which exact `@pulumi/aws` version is pinned at implementation start, and what is its supported surface (policy types, template limits, dependency count, OU-target limit)? (Sections 5, 25, 57, 61, 67)
2. What SDK v3 gaps exist for the pinned provider (discovery metadata, trusted access)? (Sections 4, 34, 52)
3. What `operationPreferences` subsets does the pinned provider support per layer? (Section 58)
4. What is the approved parallelism value and deploy script form? (Sections 62, 92)
5. Are the Phase 12/13 spikes v1 design deliverables or fully deferred? (Sections 73, 80-81, 116-117)
