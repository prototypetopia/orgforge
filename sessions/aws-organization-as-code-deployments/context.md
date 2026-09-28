# AWS Organization as Code Deployments Context

## Objective
- Deliver organization-wide CloudFormation safely through generic deployments: service-managed StackSets in automatic and resolved modes with management-account coverage, native future-account dependencies, explicit regions, template parsing and artifact staging, parameter handling, operation preferences, validation, protection, and deliberate decommissioning.

## Scope
- In: generic deployment concept beyond baselines (Section 43); automatic/resolved discriminated-union modes (Section 44); automatic mode with native OU/root targeting (Section 45); automatic restrictions failing on tags/exclusions/account filters/per-account params (Section 46); resolved mode for tag/exclusion/arbitrary-set/individual-account cases with next-up convergence (Section 47); resolved service-managed INTERSECTION targeting without self-managed accounts (Section 48); one plural `StackInstances` owner per StackSet validated logically (Section 49); management-account direct stack on `includeManagementAccount` (Section 50); normalized static parameters for both paths (Sections 51, 72); capability acknowledgement without macro expansion (Section 53); managed execution default (Section 54); Pulumi plus native StackSet dependencies (Section 55); dependency validation with cycle paths (Section 56); dependency count validation (Section 57); layered operation preferences (Section 58); explicit regions and separate administration region (Sections 59-60); OU target limit enforcement (Section 61); template restrictions, parsing, artifact selection, dynamic references, provider size limits (Sections 63-67); protected artifact bucket (Section 68); StackSet parameters, NoEcho handling, secret strategy (Sections 69-71); deployment removal safety, retention layering, staged retain workflow, decommission workflow (Sections 74-77); drift limitation disclosure (Section 78); deployment validation (Section 87); deployment behavioral tests (Section 99); V1 deployments definition of done (Section 118); applicable Section 119 rules (23-45).
- Out: OU/account provisioning (owned by `aws-organization-as-code-org-structure`); account-set evaluation internals (owned by `aws-organization-as-code-account-targeting`, consumed here); policy content and StackSets trusted-access resource (owned by `aws-organization-as-code-policies-integrations`, consumed here); Identity Center objects (owned by `aws-organization-as-code-identity-center`); project scaffolding, CI, and state (owned by `aws-organization-as-code-foundation-operations`); per-account parameter implementation, cross-deployment outputs, and audit command (deferred).

## Source PRD
- Parent snapshot: `sessions/aws-organization-as-code-source-prd.md`
- Decomposition index: `sessions/aws-organization-as-code-prd-decomposition.md`
- Child mapping: `aws-organization-as-code-deployments`
- Evidence scope: Parent content is evidence only for index rows mapped to
  this child.

## Current Architecture
- Deployment definition (name, discriminated-union mode, template, capabilities, regions, targets or account set, dependencies, operation preferences, retain settings) -> template pipeline (parse YAML/JSON, extract params/defaults/NoEcho/Transform/types/dynamic references, enforce restrictions, decide inline body vs S3 URL, stage protected content-addressed artifact) -> StackSet plane: automatic uses native Organization/OU targets; resolved uses root IDs plus INTERSECTION account filtering from the shared account-targeting model, always `SERVICE_MANAGED` -> StackInstances plane (exactly one plural owner per StackSet) plus direct management-account `Stack` when included -> dependency plane (Pulumi `dependsOn` plus native StackSet auto-deployment dependencies via ARNs) (Sections 43-55, 63-69).
- Static parameters normalized once and applied to both StackSet and management-account Stack (Sections 51, 72); NoEcho values get centralized secret/`ignoreChanges` handling without preview/log leakage (Section 70); dynamic-reference templates force S3 staging (Section 66).
- Lifecycle: deployments protected by default; account-leaves-OU retention (`retainOnAccountRemoval`) stays separate from deployment-deletion retention (`retainStacks`, protection, decommission workflow); retain changes stage across two reviewed operations; decommission follows the ten-step workflow (Sections 74-77).

## Constraints
- Discriminated-union modes; invalid combinations fail validation instead of deferring to runtime (Section 44).
- Automatic mode: root/OU/multiple-OU/static-params only; tag selection, exclusions, account filtering, per-account params, and arbitrary resolved sets forbidden and must fail validation without emulations that break future-account behavior (Section 46).
- Resolved mode: `SERVICE_MANAGED` retained; top-level self-managed `accounts` targeting forbidden; Organizations targets with account filtering required; later target-shape optimizations must remain service-managed (Section 48).
- One StackSet maps to exactly one plural `StackInstances` owner; enforced at the logical model level (Section 49).
- Capabilities limited to `CAPABILITY_IAM`/`CAPABILITY_NAMED_IAM` in v1; no `CAPABILITY_AUTO_EXPAND` while macros/transforms are unsupported; capabilities passed to StackSet and Stack where applicable (Section 53).
- Operation preferences split across `stackSetUpdates` and `instanceOperations` layers with pinned-provider subsets; no blind cross-schema reuse (Section 58).
- Regions explicit per deployment; administration region separate (Sections 59-60); OU target count enforced (initially 50) without silent API overruns (Section 61).
- Template sizes validated against pinned provider limits with Pulumi-vs-AWS error attribution (Section 67); unsupported transforms and incompatible nested stacks rejected where detectable with CloudFormation authoritative (Section 63).
- Per-account parameter overrides forbidden until the dedicated spike completes (Sections 73, 119 rule 44).

## Locked Decisions
- 2026-09-28 Recorded from source; original decision date unknown: Generic `deployments` concept spanning baselines, logging, IAM, monitoring, budgets, networking, roles, and service setup (Section 43).
- 2026-09-28 Recorded from source; original decision date unknown: Automatic vs resolved as discriminated union (Section 44).
- 2026-09-28 Recorded from source; original decision date unknown: Automatic on native Organization/OU targets with `SERVICE_MANAGED` (Section 45).
- 2026-09-28 Recorded from source; original decision date unknown: Automatic restrictions with validation failure (Section 46).
- 2026-09-28 Recorded from source; original decision date unknown: Resolved for tag/exclusion/arbitrary-set/individual cases with next-up convergence (Section 47).
- 2026-09-28 Recorded from source; original decision date unknown: Resolved INTERSECTION service-managed targeting; no self-managed accounts (Section 48).
- 2026-09-28 Recorded from source; original decision date unknown: One StackInstances owner per StackSet (Section 49).
- 2026-09-28 Recorded from source; original decision date unknown: Management-account direct stack without separate declaration (Section 50).
- 2026-09-28 Recorded from source; original decision date unknown: Capability set without macro expansion (Section 53).
- 2026-09-28 Recorded from source; original decision date unknown: Managed execution default active (Section 54).
- 2026-09-28 Recorded from source; original decision date unknown: Dual-layer dependencies (Pulumi plus native StackSet ARNs) (Section 55).
- 2026-09-28 Recorded from source; original decision date unknown: Layered operation preferences with pinned-provider subsets (Section 58).
- 2026-09-28 Recorded from source; original decision date unknown: Explicit regions and administration region (Sections 59-60).
- 2026-09-28 Recorded from source; original decision date unknown: Content-plus-size artifact selection with S3 staging for large or dynamic-reference templates (Sections 64-66).
- 2026-09-28 Recorded from source; original decision date unknown: Provider-limit template validation (Section 67).
- 2026-09-28 Recorded from source; original decision date unknown: Protected content-addressed artifact bucket (Section 68).
- 2026-09-28 Recorded from source; original decision date unknown: Centralized NoEcho handling with automatic `ignoreChanges` where required (Section 70).
- 2026-09-28 Recorded from source; original decision date unknown: Deployment protection defaults with staged retain and ten-step decommission (Sections 74-77).
- 2026-09-28 Recorded from source; original decision date unknown: Drift limitation disclosure for refresh-based StackSet auditing (Section 78).

## Implementation Status
- Done: nothing (workstream initialization only).
- In progress: nothing.
- Not started: mode modeling, StackSet/StackInstances/management-stack resources, dependencies, templates, artifacts, parameters, validation, protection lifecycle, tests.

## Risks / Gaps
- Depends on `org-structure` (OU paths, accounts), `account-targeting` (resolved sets), `policies-integrations` (trusted access), and `foundation-operations` (provider pinning, validation rails, safe deploy).
- Pinned-provider surface (operation preferences fields, template limits, dependency counts, OU-target limits) is TBD (Index Open Questions 1-3).
- Per-account spike scope and cross-output design scope open (Index Open Questions 5-6).
- Illustrative Section 100 deployment shapes need normalization (Index Open Question 7).

## Related Docs
- `sessions/aws-organization-as-code-source-prd.md`
- `sessions/aws-organization-as-code-prd-decomposition.md`
- `sessions/aws-organization-as-code-deployments/aws-organization-as-code-deployments-prd.md`
- `sessions/aws-organization-as-code-deployments/decision-log.md`
- `sessions/aws-organization-as-code-deployments/latest.md`

## Resume Checklist
1. Read this file
2. Read latest session handoff
3. Read next-steps plan
4. Confirm next task before implementation
