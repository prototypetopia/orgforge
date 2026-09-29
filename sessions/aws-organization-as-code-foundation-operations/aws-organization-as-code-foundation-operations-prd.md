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
- Gate changes through CI (install, typecheck, unit tests + Pulumi mock tests, validation, preview) and an approved protected deployment workflow with a safe `pnpm run deploy` command (Sections 91-92, 62).
- Make routine automation incapable of silently removing protected accounts or deployments (Section 115).

---

## Decisions Locked (from source, 2026-09-28)

- 2026-09-28 Recorded from source; original decision date unknown: Use TypeScript with `@pulumi/pulumi`, `@pulumi/aws`, and AWS SDK v3 contained to provider gaps (Section 4).
- 2026-09-28 Recorded from source; original decision date unknown: Keep OrgFormation, Terraform CLI, CDKTF, Control Tower, AFT, LZA, and SST out of this project without a separate architecture decision; SST apps stay separate state boundaries (Section 4).
- 2026-09-28 Recorded from source; original decision date unknown: Pin `@pulumi/aws` via lockfile; behavior follows the pinned provider; unsupported requests fail explicitly; no silent `@pulumi/aws-native`; upgrades are infrastructure changes (Section 5).
- 2026-09-28 Recorded from source; original decision date unknown: Five layers with Pulumi-independent target resolution, account-set evaluation, OU traversal, dependency analysis, and most validation (Section 6).
- 2026-09-28 Recorded from source; original decision date unknown: Stable TypeScript logical keys own framework identity; Pulumi names derive from them; no raw AWS IDs in human-authored config when a logical reference resolves (Section 8; Section 119 rule 6).
- 2026-09-28 Recorded from source; original decision date unknown: One long-lived Pulumi stack per AWS Organization; Pulumi Cloud and DIY backends; no Cloud-specific framework APIs (Sections 88-89).
- 2026-09-28 Recorded from source; original decision date unknown: Identity Center credentials for development; no long-lived access keys required (Section 90).
- 2026-09-28 Recorded from source; original decision date unknown: CI runs install, typecheck, unit tests, validation, and preview; no auto-deploy from arbitrary branches (Section 91). *(Test-tier granularity for "unit tests" refined 2026-09-29: `pnpm test:unit` + `pnpm test:mock` per `TESTS.md`.)*
- 2026-09-28 Recorded from source; original decision date unknown: `pnpm run deploy` with org-safe defaults and enforced parallelism (`--parallel 5`) used consistently by CI (Sections 62, 92; pnpm adopted as this repo's package manager via `refine-prd`, 2026-09-29).
- 2026-09-28 Recorded from source; original decision date unknown: Mandatory `pulumi preview` with explicit high-risk list (Section 93).
- 2026-09-28 Recorded from source; original decision date unknown: Protected-resources minimum set including Organization, accounts, StackSets access, artifact bucket, StackSets, StackInstances, and critical management stacks (Section 94).
- 2026-09-28 Recorded from source; original decision date unknown: Console changes are drift; refresh plus preview guidance with StackSet caveats; deliberate imports only (Section 96).
- 2026-09-28 Recorded from source; original decision date unknown: Dependency edges first, provider/SDK waiters, no arbitrary sleeps, documented unavoidable cases, useful errors (Section 97).
- 2026-09-28 Recorded from source; original decision date unknown: Pure unit tests plus Pulumi mock tests; no automatic org create/destroy in ordinary CI (Section 98).
- 2026-09-28 Recorded from source; original decision date unknown: Platform-behavior conflicts resolved by verifying current docs/API, documenting the conflict, and following verified behavior (Section 119 rule 50).

## Decisions Locked (2026-09-29 `/refine-prd`)

- 2026-09-29 User-approved: `pnpm` is this repo's package manager; the safe deploy command is `pnpm run deploy`, mapping to `pulumi up --parallel 5` (AGENTS.md; Section 92 example form preserved modulo package manager).
- 2026-09-29 User-approved: Test framework is Vitest with `pnpm test:unit` (pure unit tests, `*.unit.test.ts`) and `pnpm test:mock` (Pulumi `setMocks` tests, `*.mock.test.ts`); no live-test tier in ordinary CI (AGENTS.md, TESTS.md; Section 98).
- 2026-09-29 User-approved: Per-account parameter spike (Section 73 / Phase 12 in Section 116) and cross-deployment output design (Sections 80-81 / Phase 13 in Section 117) are **design-only v1 deliverables** owned by the `aws-organization-as-code-deployments` workstream, not implementations (Sections 73, 80-81, 116-117).
- 2026-09-29 User-approved: Enforced account-creation parallelism is `--parallel 5` (Section 62, source example form). Any stricter value is an operational change requiring re-approval.
- 2026-09-29 Agent-Owned: Fail on ambiguous or unsupported behavior rather than guessing (Section 119 rule 49). Evidence-backed and already implied by the provider-version-policy decision; made explicit here because it is also the acceptance shape for requirements 2 and 3, and it is the shared sibling contract for capability validators plugging into this workstream's framework.
- 2026-09-29 User-approved: Org-structure owns OU aliases and determines their precise semantics during its PRD refinement; foundation provides naming conventions, not an alias registry (decomposition rows for Sections 10 and 83). The source's `aliases?: string[]` does not establish alternate-reference behavior.
- 2026-09-29 Agent-Owned (provider policy follow-through): the implementing foundation slice pins and records the `@pulumi/aws` version. Each sibling verifies the provider surface needed by its own capability before locking supported unions or limits (Section 5; decomposition rows for Sections 25, 57-58, 61, 67). No unverified provider values are assumed in foundation.
- 2026-09-29 User-approved: Adopt the secret strategy from Section 71 as a preference: prefer secret references (Secrets Manager, SSM Parameter Store, CloudFormation dynamic references) over plaintext secret StackSet parameters; where Pulumi secret values must flow as parameters, preserve Pulumi secret semantics, apply `ignoreChanges` per Section 70 where the provider requires it, and document any unavoidable exposure. Rationale: wording already committed in `AGENTS.md` Secret Handling; the implementing deployments workstream resolves parameter-secret edge cases per the design-only v1 spike scope.
- 2026-09-29 Agent-Owned: Adopt the Section 7 directory layout as the starting skeleton. Rationale: the layout is already committed in the rewritten `AGENTS.md` (with `pnpm-lock.yaml` replacing the source's `package-lock.json`), so it is now repo convention rather than a proposal; retained as Agent-Owned because the source marks the layout "Recommended", not normative.
- 2026-09-29 Agent-Owned: Foundation naming helpers derive Pulumi resource names from stable logical keys, never AWS display names (Section 8). Org-structure owns OU alias behavior and validation (Sections 10, 83).

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
- As an operator, I can run `pnpm run deploy` with safe parallelism so that account creation never relies on undocumented provider serialization (Sections 62, 92).
- As a reviewer, I can require preview on every PR through a protected workflow so that organization modifications never auto-deploy from arbitrary branches (Section 91).
- As an organization owner, I can rely on protection defaults and explicit decommission workflows so that routine refactors never silently destroy the organization (Sections 94-95).
- As a developer, I can read validation errors naming the exact account set, OU path, or policy at fault so that misconfiguration is fixable without console inspection (Section 82).

---

## Requirements

### Functional

1. Scaffold strict TypeScript + Pulumi project with pnpm and a pinned `@pulumi/aws` in `pnpm-lock.yaml`, naming helpers deriving Pulumi names from stable logical keys, a validation framework, and Vitest tests such that typecheck passes, tests execute, and minimal config previews (Sections 5, 8, 105). Org-structure owns OU aliases (Sections 10, 83).
2. Establish the pinned-provider policy and version record. Capability owners derive their supported unions and limits from that version and reject unsupported requests with explicit upgrade guidance (Section 5; capability-specific validation belongs to sibling workstreams).
2a. Keep organization configuration under Pulumi ownership wherever AWS exposes an appropriate API; creation of the organization-level IAM Identity Center instance is the known manual bootstrap exception. Sibling workstreams implement their respective resources (Section 2.3).
3. Validate the complete logical model before constructing dependent resources wherever possible, with actionable errors naming the offending reference (Section 82; example in Section 82).
4. Operate one long-lived stack per organization on Pulumi Cloud or DIY backends without Cloud-specific framework APIs (Sections 88-89).
5. Authenticate via IAM Identity Center credentials (`aws sso login`, `AWS_PROFILE`) without requiring long-lived keys (Section 90).
6. Run CI with dependency install, typecheck, `pnpm test:unit` + `pnpm test:mock`, configuration validation, and Pulumi preview; deploy only via approved protected workflow (Section 91).
7. Provide `pnpm run deploy` (`pulumi up --parallel 5`) with org-safe defaults and enforced parallelism, used consistently by CI (Sections 62, 92).
8. Require `pulumi preview` before applying, with review attention on the Section 93 high-risk list.
9. Protect the Section 94 minimum set by default, including critical management-account stacks and optionally critical policies.
10. Document drift handling (refresh plus preview, StackSet limitations, no auto-adoption, deliberate imports) and consistency handling (dependency edges, waiters, no arbitrary sleeps) (Sections 96-97).
11. Implement the Section 98 testing strategy as two tiers named in `TESTS.md`: pure unit tests (`*.unit.test.ts`) and Pulumi `setMocks` mock tests (`*.mock.test.ts`); no automatic org create/destroy and no live tier in ordinary CI (Section 98).

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

Framework-level entities: pinned provider version record, naming convention for Pulumi resources, structured validation errors (`code`, `message`, optional `reference`), protection rules for resource classes, and safe deployment command configuration. `OrganizationDefinition` and OU aliases belong to org-structure (Sections 9-10, 83). Invariants: validate before dependent construction where possible; Pulumi names derive from stable logical keys; protection defaults cannot be weakened by ordinary refactoring; state identity is one stack per organization.

---

## API Contracts (High-Level)

1. `pnpm run deploy`
   - Input: organization configuration checkout with AWS Identity Center credentials.
   - Output: Pulumi up with org-safe defaults and constrained parallelism (`--parallel 5`).
   - Behavior: same safe command locally and in CI (Sections 62, 92).
2. Validation CLI (configuration validation in CI)
   - Input: full organization configuration.
   - Output: actionable errors naming exact references.
   - Behavior: runs before dependent resource construction where possible (Section 82).
3. `pnpm test:unit` / `pnpm test:mock`
   - Input: source under `src/`.
   - Output: Vitest result for the pure-unit and Pulumi-mock tiers respectively.
   - Behavior: no AWS calls and no credentials required for either tier (repo convention in AGENTS.md/TESTS.md); ordinary CI never creates or destroys an AWS Organization (Section 98).

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

1. Typecheck passes, tests execute, the provider version is pinned and recorded, and minimal config previews (Sections 5, 105).
2. Provider-dependent capabilities added by sibling workstreams verify their supported surface against the pinned version and reject unsupported requests with upgrade guidance (Section 5).
3. Validation errors name the exact offending reference (e.g. account set plus OU path) rather than generic messages (Section 82).
4. CI runs install, typecheck, `pnpm test:unit` and `pnpm test:mock`, validation, and preview; deployment requires the approved protected workflow (Section 91).
5. The safe deploy command (`pnpm run deploy`) constrains parallelism for account creation at `--parallel 5` and is used by CI (Sections 62, 92).
6. Foundation establishes the Section 94 protection rules; owning workstreams verify `protect` options on the organization, accounts, trusted access, artifact bucket, StackSets, StackInstances, and critical management-account stacks as those resources are implemented (Sections 94, 98, 118).
7. README documents StackSet drift limitations and the refresh-plus-preview workflow (Sections 78, 96).

---

## Rollout Plan

1. Foundation: scaffold the project, pin the provider, implement the validation framework and safe deploy script, and verify a minimal configuration preview with an appropriate backend and credentials. Any separate test stack must represent a genuinely separate AWS Organization (Sections 88, 105).
2. As capabilities are implemented: enable CI gates and the approved protected deployment workflow; verify resource protections with their owning workstreams and document drift limitations (Sections 91, 94, 96, 118).
3. For v1 completion: evaluate the Section 118 checklist across all owning workstreams, not as foundation-only acceptance; review provider upgrades as infrastructure changes (Sections 5, 118).

---

## Metrics

- TBD (no source-defined metrics; success is observed through Section 105 and Section 115 acceptance).

---

## Open Questions

1. The implementing foundation slice selects, pins, and records a supported `@pulumi/aws` version (Section 5). Policy-type unions, template and dependency limits, and OU-target limits are verified by their implementing sibling workstreams (Sections 25, 57, 61, 67).
2. SDK v3 gaps for Identity Center discovery and StackSets trusted access are verified by their owning workstreams against the pinned provider (Sections 4, 34, 52).
3. The deployments workstream verifies the provider's distinct `operationPreferences` subsets when implementing those contracts (Section 58).
4. ~~What is the approved parallelism value and deploy script form?~~ Resolved 2026-09-29: `pnpm run deploy` → `pulumi up --parallel 5`.
5. ~~Are the Phase 12/13 spikes v1 design deliverables or fully deferred?~~ Resolved 2026-09-29: design-only v1 deliverables owned by `aws-organization-as-code-deployments`.

OU alias semantics remain for org-structure refinement. Provider-dependent sibling details remain open until their capabilities are implemented.
