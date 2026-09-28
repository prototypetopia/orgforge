# PRD: AWS Organization as Code Deployments

## Context

Organization-wide CloudFormation becomes generic `deployments`: baselines, logging, IAM, monitoring, budgets, networking, roles, and service setup (Section 43) delivered through service-managed StackSets in automatic mode following Organization/OU membership (Section 45) or resolved mode for selectors automatic deployment cannot preserve (Section 47). This workstream owns modes (Section 44), restrictions (Section 46), resolved targeting (Section 48), the one-owner invariant (Section 49), management-account coverage (Sections 50-51), capabilities (Section 53), managed execution (Section 54), dependencies (Sections 55-57), operation preferences (Section 58), regions (Sections 59-60), OU target limits (Section 61), templates and artifacts (Sections 63-69), NoEcho and secrets (Sections 70-71), static parameters (Section 72), removal safety and decommissioning (Sections 74-77), drift disclosure (Section 78), validation (Section 87), behavioral tests (Section 99), and the V1 deployments checklist (Section 118).

---

## Problem

- OrgFormation organization-wide CloudFormation updates need a maintained-primitive successor, not a custom compiler (Sections 2.2, 103).
- Emulating tag selectors, exclusions, or per-account parameters inside automatic mode breaks future-account behavior (Section 46).
- Falling back to self-managed account targeting abandons the service-managed permission model (Section 48).
- Service-managed StackSets skip the management account, leaving organization-wide coverage incomplete (Section 50).
- Future-account provisioning without native StackSet dependencies loses ordering when Pulumi is not running (Section 55).
- Disappearing deployment configuration is destructive across many accounts (Sections 74-77).
- Size-only artifact decisions mishandle dynamic references and provider limits (Sections 65-67).

---

## Goals

- Model every deployment as `automatic` or `resolved` in a discriminated union (Section 44).
- Deploy automatic mode on native Organization/OU targets with `SERVICE_MANAGED` (Section 45).
- Reject invalid automatic combinations in validation (Section 46).
- Deploy resolved mode for tag, exclusion, arbitrary-set, and individual-account cases with next-up convergence (Section 47).
- Target resolved sets through service-managed Organizations targets with account filtering (Section 48).
- Enforce one plural `StackInstances` owner per StackSet (Section 49).
- Cover the management account from the same declaration with normalized parameters (Sections 50-51).
- Acknowledge capabilities without macro expansion; default managed execution active (Sections 53-54).
- Order through Pulumi dependencies plus native StackSet dependencies with validated acyclic graphs (Sections 55-56).
- Parse templates, stage artifacts content-awarily, handle NoEcho centrally, and prefer secret references (Sections 63-72).
- Protect deployments by default with staged retention and deliberate decommissioning (Sections 74-77).

---

## Decisions Locked

- 2026-09-28 Recorded from source; original decision date unknown: Generic deployments concept (Section 43).
- 2026-09-28 Recorded from source; original decision date unknown: Discriminated-union modes (Section 44).
- 2026-09-28 Recorded from source; original decision date unknown: Automatic native OU/root targeting with `SERVICE_MANAGED` (Section 45).
- 2026-09-28 Recorded from source; original decision date unknown: Automatic restrictions with validation failure (Section 46).
- 2026-09-28 Recorded from source; original decision date unknown: Resolved mode with next-`pulumi up` convergence (Section 47).
- 2026-09-28 Recorded from source; original decision date unknown: Resolved INTERSECTION service-managed targeting; no self-managed accounts (Section 48).
- 2026-09-28 Recorded from source; original decision date unknown: One StackInstances owner per StackSet (Section 49).
- 2026-09-28 Recorded from source; original decision date unknown: Management-account direct stack from the same declaration (Section 50).
- 2026-09-28 Recorded from source; original decision date unknown: Normalized static parameters for both paths (Sections 51, 72).
- 2026-09-28 Recorded from source; original decision date unknown: Capabilities without macro expansion, passed to StackSet and Stack (Section 53).
- 2026-09-28 Recorded from source; original decision date unknown: Managed execution default active (Section 54).
- 2026-09-28 Recorded from source; original decision date unknown: Dual-layer dependencies with native ARNs for future accounts (Section 55).
- 2026-09-28 Recorded from source; original decision date unknown: Dependency validation with cycle paths; dependency count validation (Sections 56-57).
- 2026-09-28 Recorded from source; original decision date unknown: Layered operation preferences with pinned-provider subsets (Section 58).
- 2026-09-28 Recorded from source; original decision date unknown: Explicit regions with separate administration region (Sections 59-60).
- 2026-09-28 Recorded from source; original decision date unknown: OU target limit enforcement (Section 61).
- 2026-09-28 Recorded from source; original decision date unknown: Template restrictions, parsing, content-aware artifact selection, dynamic-reference S3 forcing, provider-limit validation (Sections 63-67).
- 2026-09-28 Recorded from source; original decision date unknown: Protected content-addressed artifact bucket (Section 68).
- 2026-09-28 Recorded from source; original decision date unknown: Template-first parameter handling with required/default/NoEcho distinction (Section 69).
- 2026-09-28 Recorded from source; original decision date unknown: Centralized NoEcho handling with automatic `ignoreChanges` and no preview/log leakage (Section 70).
- 2026-09-28 Recorded from source; original decision date unknown: Protection defaults, retention layering, staged retain workflow, ten-step decommission (Sections 74-77).
- 2026-09-28 Recorded from source; original decision date unknown: Drift limitation disclosure (Section 78).
- 2026-09-28 Recorded from source; original decision date unknown: Deployment validation checklist (Section 87).
- Shared constraints inherited: pinned-provider behavior, logical-key identity, pure-model layering, protection defaults, single-principal ownership, service-managed StackSets, and technology exclusions apply in full (decomposition index Shared Constraints).

## Decisions Proposed (Pending Approval)

- 2026-09-28 Agent-Recommended: Prefer secret references (Secrets Manager, SSM, dynamic references) over plaintext secret parameters, preserving Pulumi secret semantics where unavoidable - rationale: Section 71 states this as a preference ("Prefer"), so it stays proposed pending `/refine-prd` hardening.

---

## Non-Goals (V1)

- Per-account parameter overrides before the dedicated spike completes (Section 73; Section 119 rule 44).
- Cross-deployment output references and cross-account output implementation before security design approval (Sections 80-81; Section 119 rule 45).
- Future audit command except as needed for a critical drift gap (Section 79).
- Self-managed top-level `accounts` targeting (Section 48).
- Macro expansion capability while transforms/macros remain prohibited (Section 53).
- OrgFormation annotated CloudFormation compiler recreation (Section 103).
- Generic shell/Terraform/CDK/Serverless task running (Section 104).

---

## User Stories

- As a platform engineer, I can declare a `securityBaseline` automatic deployment on `workloads` so that future accounts receive it without Pulumi running (Section 45).
- As a developer, I get a validation error combining automatic mode with tag selectors so that I choose resolved mode explicitly (Section 46).
- As a platform engineer, I can deploy `budgets` to the `budgetManaged` set in resolved mode so that tag-selected accounts converge on the next up (Section 47).
- As an operator, I can include the management account without a second declaration (Section 50).
- As a reviewer, I can see dependency cycles with full paths and OU-limit violations before creation (Sections 56, 61).
- As an organization owner, I can decommission a deployment deliberately so that target stacks survive or retire exactly as decided (Sections 76-77).

---

## Requirements

### Functional

1. Accept generic deployment definitions across all Section 43 use cases (Section 43).
2. Type modes as a discriminated union; reject invalid combinations outside runtime (Section 44).
3. Build automatic deployments on `StackSet` plus `StackInstances` with `SERVICE_MANAGED` and native Organization/OU targets (Section 45).
4. Allow automatic root/OU/multiple-OU/static-params; fail validation on tags, exclusions, account filtering, per-account params, and arbitrary resolved sets (Section 46).
5. Build resolved deployments for tag, exclusion, arbitrary-set, individual-account, and per-account-config cases with next-up convergence (Section 47).
6. Target resolved sets via root IDs plus INTERSECTION account filtering under `SERVICE_MANAGED`; never self-managed `accounts` (Section 48).
7. Enforce one plural `StackInstances` owner per StackSet at the logical model level (Section 49).
8. Emit a direct management-account `Stack` alongside the StackSet when included, from one declaration (Section 50).
9. Normalize static parameters once for both paths (Sections 51, 72).
10. Support `CAPABILITY_IAM`/`CAPABILITY_NAMED_IAM`; forbid `CAPABILITY_AUTO_EXPAND`; pass to StackSet and Stack (Section 53).
11. Default automatic StackSets to `managedExecution: { active: true }` (Section 54).
12. Wire Pulumi `dependsOn` plus native StackSet auto-deployment dependencies via ARNs (Section 55).
13. Validate references, direct/indirect cycles with paths, and direct dependency counts (Sections 56-57).
14. Split `operationPreferences` into `stackSetUpdates` and `instanceOperations` with pinned-provider subsets (Section 58).
15. Require explicit target regions; configure a separate administration region (Sections 59-60).
16. Enforce the OU-ID target limit per StackInstances operation unless verified safe batching (Section 61).
17. Reject detectable unsupported transforms and nested stacks; parse YAML/JSON templates extracting params, defaults, NoEcho, Transform, types, and dynamic references (Sections 63-64).
18. Select inline body vs S3 URL on size plus content; force S3 for dynamic references where URL is preferred (Sections 65-66).
19. Validate sizes against pinned provider limits with Pulumi-vs-AWS attribution (Section 67).
20. Stage artifacts in one protected, private, versioned, encrypted, content-addressed bucket treated as immutable (Section 68).
21. Parse `Parameters` first with required/default/NoEcho distinction without assuming CloudFormation defaults cover provider behavior (Section 69).
22. Centralize NoEcho handling with automatic `ignoreChanges` and no secret leakage (Section 70).
23. Protect StackSet, StackInstances, and management Stack by default; separate account-leaves-OU from deployment-deleted retention; stage retain changes; follow the ten-step decommission workflow (Sections 74-77).
24. Disclose refresh-based drift limitations in the README (Section 78).
25. Validate the full deployment checklist (Section 87).

### Non-Functional

- Security: service-managed permission model retained; secret references preferred; NoEcho values never leak.
- Privacy/Compliance: Not applicable beyond secret handling.
- Observability: cycle paths, OU-limit errors, and size-limit attribution are actionable.
- Scalability: multi-region deployments with managed execution and layered operation preferences.

---

## Proposed Architecture (V1)

Definition -> template pipeline (parse, restrict, parameter-extract, NoEcho/dyanmic detection, inline-vs-S3 decision, protected bucket staging) -> StackSet plane (automatic native targets; resolved INTERSECTION targets from the shared targeting model; `SERVICE_MANAGED` throughout) -> StackInstances plane (single plural owner) plus management-account Stack -> dependency plane (Pulumi edges plus native ARNs) -> protected lifecycle (defaults, staged retain, decommission) (Sections 43-78). Consumed inputs: OU paths and accounts from `org-structure`, set resolution from `account-targeting`, trusted access from `policies-integrations`, rails (provider pinning, validation, safe deploy, preview) from `foundation-operations`. Shared constraints apply in full.

---

## Data Model (Proposed)

Entities: deployment definition (name, mode union, template pointer, capabilities, regions, administrationRegion, targets or accountSet, includeManagementAccount, automaticDeployment retain flag, retainStacks, dependencies, operation preferences, parameters); parsed template (parameters, defaults, NoEcho markers, Transform, resource types, dynamic references); artifact (content hash, S3 key, body-vs-URL decision); StackSet/StackInstances/management-Stack linkage; dependency graph with ARNs. Invariants: mode union exclusive; one StackInstances owner; service-managed always; regions explicit; retention axes separate.

---

## API Contracts (High-Level)

1. Deployment declaration (TypeScript configuration contract)
   - Input: mode, template, capabilities, regions, targets/accountSet, dependencies, preferences, retain settings.
   - Output: StackSet, StackInstances, optional management Stack, staged artifacts.
   - Behavior: invalid mode combinations, cycles, limits, and template violations fail validation (Sections 44, 46, 56-57, 61, 63, 67, 87).
2. Decommission workflow (documented procedure)
   - Input: deployment targeted for removal with a stay-or-retire decision.
   - Output: staged retain configuration, verified previews, explicit unprotection, removal, AWS confirmation.
   - Behavior: retain and destroy never combine in one unreviewed operation (Sections 76-77).

---

## Session State Machine (If Applicable)

- `retainStacks` staged false/true -> `pulumi up` -> verify -> explicit unprotect -> remove declaration -> preview -> apply -> confirm (Sections 76-77).

---

## Security and Privacy

- Service-managed StackSets throughout; no self-managed account targeting (Sections 45, 48).
- Capabilities explicit; macro expansion withheld (Section 53).
- NoEcho centralized with secret-safe previews and logs (Section 70).
- Secret references preferred over plaintext parameters (Section 71, proposed).
- Protected deployments with staged decommissioning (Sections 74-77).

---

## Acceptance Criteria

1. Automatic mode with native OU targeting and future-account coverage without Pulumi running (Sections 45, 99, 118).
2. Unsafe automatic combinations fail validation (Sections 46, 99).
3. Resolved mode on service-managed INTERSECTION targeting without self-managed accounts (Sections 48, 99, 118).
4. One StackInstances owner per StackSet enforced (Sections 49, 99).
5. Management-account direct stack from the same declaration (Sections 50, 118).
6. Capabilities, multi-region, managed execution, and layered operation preferences (Section 118).
7. Pulumi plus native StackSet dependencies with cycle paths (Sections 55-56, 99).
8. S3 staging with dynamic-reference detection, parameter parsing, NoEcho handling, restrictions, and provider size validation (Sections 63-70, 99, 118).
9. OU target-limit validation and explicit retain-on-account-removal (Sections 61, 75, 118).
10. Protected deployment lifecycle with decommission workflow and drift disclosure (Sections 74-78, 99).

---

## Rollout Plan

1. Dev/Staging: implement template pipeline and automatic mode against a separate test organization; verify native targeting and protections in preview.
2. Pilot: add resolved deployments, dependencies, and management-account coverage; exercise decommissioning on test deployments.
3. Full rollout: organization-wide deployments flow through CI preview and the safe deploy command.

---

## Metrics

- TBD (no source-defined metrics).

---

## Open Questions

1. Exact pinned-provider operation-preference fields, template limits, dependency counts, OU-target limits? (Sections 57-58, 61, 67)
2. Is the Phase 12 per-account spike a v1 design deliverable or fully deferred? (Sections 73, 116)
3. Is the Phase 13 cross-output design a v1 deliverable or fully deferred? (Sections 80-81, 117)
4. Normalization of illustrative Section 100 deployment shapes during `/refine-prd`?
