# AWS Organization as Code Org Structure Context

## Objective
- Provide declarative OU hierarchy, AWS accounts, and the Organization resource from TypeScript: stable logical identity, OU paths, depth validation, account defaults, creation-vs-mutable settings, and account/organization safety with explicit decommissioning.

## Scope
- In: top-level `OrganizationDefinition` contract without prescribed company topology (Section 9); nested OUs with name/tags/children/aliases via `aws.organizations.OrganizationalUnit` (Section 10); pure-model OU depth validation against five levels beneath root (Section 11); deterministic logical OU paths from config keys (Section 12); `AccountModel`/`AccountContext` layering (Sections 13-14); account provisioning via `aws.organizations.Account` (Section 15); account defaults with per-account override (Section 16); creation-vs-mutable settings distinction (Section 17); account safety (`closeOnDeletion: false`, `protect: true`, protected-removal failure, explicit decommission) (Section 18); Organization safety (`featureSet: ALL`, `protect: true`) (Section 19); organization validation checklist (Section 83); account decommissioning workflow (Section 95); new-account and account-move convergence workflows (Sections 101-102); behavioral tests for OU depth and account deletion safety (Section 99); V1 organization definition of done (Section 118); applicable Section 119 rules (6-11, 13-14).
- Out: account-set evaluation semantics (owned by `aws-organization-as-code-account-targeting`); policy content and service integrations (owned by `aws-organization-as-code-policies-integrations`); Identity Center objects (owned by `aws-organization-as-code-identity-center`); StackSet deployments and artifacts (owned by `aws-organization-as-code-deployments`); project scaffolding, provider pinning, CI, and state backend (owned by `aws-organization-as-code-foundation-operations`).

## Source PRD
- Parent snapshot: `sessions/aws-organization-as-code-source-prd.md`
- Decomposition index: `sessions/aws-organization-as-code-prd-decomposition.md`
- Child mapping: `aws-organization-as-code-org-structure`
- Evidence scope: Parent content is evidence only for index rows mapped to
  this child.

## Current Architecture
- User configuration (`organization.ts`, `OrganizationDefinition`) -> pure organization model (OU graph, OU paths, `AccountModel`, depth and reference validation) -> Pulumi runtime (`AccountContext`, Outputs, ComponentResources) -> `aws.organizations.Organization`, `OrganizationalUnit`, `Account` resources (Sections 6, 9-16).
- OU paths (`workloads`, `workloads/production`) computed from configuration keys, not AWS display names, and consumed by placement, policies, sets, assignments, and deployments (Section 12).
- Creation settings (email, roleName, iamUserAccessToBilling) documented and never presented as safe ordinary mutations; mutable settings (OU parent, tags) flow through supported updates; replacement previews treated as high risk (Section 17).
- New-account convergence: create account, place in OU, inherit policies, follow automatic StackSets, recalculate sets, assignments, and resolved deployments; account moves recalculate OU placement, inheritance, targets, and StackSet membership with visible preview (Sections 101-102).

## Constraints
- Stable logical keys own framework identity; AWS display names are separate; Pulumi names derive from logical identifiers; no raw AWS IDs when a logical reference resolves (Section 8; Section 119 rule 6).
- Pinned-provider behavior governs; framework must not be hard-coded to one company OU topology (Sections 5, 9; Section 119 rule 11).
- Every member account: `closeOnDeletion: false` plus `protect: true` by default; `closeOnDeletion: false` still removes the account from the organization on resource deletion, so `protect` is the primary guard; removing a declaration must fail protected; decommissioning is explicit (Section 18; Section 119 rules 7-9).
- Organization: `featureSet: "ALL"` plus `protect: true`; `pulumi destroy` must fail before destroying organization-critical resources (Section 19).
- Safe parallelism for account creation via the shared safe deploy command (Sections 62, 92; owned by foundation-operations).
- `AccountModel` stays Pulumi-free; only the runtime layer uses Outputs (Sections 13-14; Section 119 rules 13-14).

## Locked Decisions
- 2026-09-28 Recorded from source; original decision date unknown: Logical-key identity with AWS display names separate; Pulumi names derive from logical keys (Section 8).
- 2026-09-28 Recorded from source; original decision date unknown: Arbitrary nested OUs with tags, children, and aliases (Section 10).
- 2026-09-28 Recorded from source; original decision date unknown: Pure-model OU depth validation failing before resource creation (Section 11).
- 2026-09-28 Recorded from source; original decision date unknown: Deterministic config-key OU paths shared by all targeting consumers (Section 12).
- 2026-09-28 Recorded from source; original decision date unknown: `AccountModel`/`AccountContext` layering with Pulumi-free pure logic (Sections 13-14).
- 2026-09-28 Recorded from source; original decision date unknown: Account defaults with per-account override (Section 16).
- 2026-09-28 Recorded from source; original decision date unknown: Creation-vs-mutable settings distinction with high-risk replacement previews (Section 17).
- 2026-09-28 Recorded from source; original decision date unknown: Account and Organization protection defaults (Sections 18-19).
- 2026-09-28 Recorded from source; original decision date unknown: Nine-step account decommissioning workflow; normal `pulumi up` never closes accounts (Section 95).

## Implementation Status
- Done: nothing (workstream initialization only).
- In progress: nothing.
- Not started: OU graph and paths, `AccountModel`, defaults, validation, Organization/OU/Account resources, safety defaults, decommission docs, convergence workflows.

## Risks / Gaps
- OU depth limit and creation-setting replace behavior depend on the pinned provider and current AWS behavior (Index Open Questions 1, 5 in spirit; Section 119 rule 50 conflict procedure applies).
- Depends on `aws-organization-as-code-foundation-operations` for validation framework, provider pinning, state, CI, safe deploy, and protection rails.
- Downstream consumers (`account-targeting`, `policies-integrations`, `identity-center`, `deployments`) depend on OU paths and `AccountModel` stability.
- Illustrative Section 100 shapes need normalization in `/refine-prd` (Index Open Question 7).

## Related Docs
- `sessions/aws-organization-as-code-source-prd.md`
- `sessions/aws-organization-as-code-prd-decomposition.md`
- `sessions/aws-organization-as-code-org-structure/aws-organization-as-code-org-structure-prd.md`
- `sessions/aws-organization-as-code-org-structure/decision-log.md`
- `sessions/aws-organization-as-code-org-structure/latest.md`

## Resume Checklist
1. Read this file
2. Read latest session handoff
3. Read next-steps plan
4. Confirm next task before implementation
