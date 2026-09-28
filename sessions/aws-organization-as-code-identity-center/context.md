# AWS Organization as Code Identity Center Context

## Objective
- Manage workforce access as organization IaC without hard-coded AWS account IDs: bootstrap-aware Identity Center discovery, AWS-managed and external principals, permission sets with policy attachments, and OU/account-set assignment expansion with centralized dependency ordering.

## Scope
- In: Identity Center IaC scope (Section 31); manual instance bootstrap sequencing (Section 32); bootstrap mode with discovery-failure semantics and `false` default (Section 33); safe instance discovery proving the intended organization instance (Section 34); identity source modes `aws` and `external` (Section 35); AWS-managed users/groups/memberships (Section 36); external principal friendly lookup with unambiguous results and `principalId` escape hatch (Section 37); permission sets with managed/inline/customer-managed/boundary attachments (Section 38); per-account assignment expansion (Section 39); named-set or inline assignment targets with OU/tag/exclusion/management rules and dedupe (Section 40); logical-ID assignment resource identity (Section 41); centralized dependency ordering (Section 42); Identity Center validation (Section 86); dedupe and discovery behavioral tests (Section 99); V1 Identity Center definition of done (Section 118); applicable Section 119 rules (15-19).
- Out: OU/account provisioning (owned by `aws-organization-as-code-org-structure`); account-set evaluation internals (owned by `aws-organization-as-code-account-targeting`, consumed here); policy documents (owned by `aws-organization-as-code-policies-integrations`); StackSet deployments (owned by `aws-organization-as-code-deployments`); project scaffolding and CI (owned by `aws-organization-as-code-foundation-operations`).

## Source PRD
- Parent snapshot: `sessions/aws-organization-as-code-source-prd.md`
- Decomposition index: `sessions/aws-organization-as-code-prd-decomposition.md`
- Child mapping: `aws-organization-as-code-identity-center`
- Evidence scope: Parent content is evidence only for index rows mapped to
  this child.

## Current Architecture
- Bootstrap sequence: Pulumi owns Organization, OUs, accounts, and policies first; a human enables the organization Identity Center instance manually; Pulumi then discovers the instance, manages groups/users, permission sets, and assignments (Section 32).
- `bootstrapMode=true` deploys organization core without Identity Center; normal `false` mode fails when Identity Center is configured but no valid organization instance is discoverable (Section 33).
- Discovery proves intent: zero active organization instances fails with bootstrap guidance; exactly one is used; more than one ambiguous candidate fails; SDK `ListInstances` fills metadata gaps; owner account, status, and region verified where possible; never index-zero selection (Section 34).
- Assignment flow: principal plus permission set plus named account set (or inline selectors) -> recursive OU resolution, tag evaluation, exclusions, management-account rules, dedupe -> one `aws.ssoadmin.AccountAssignment` per resolved account with logical-ID resource identity and centralized dependency edges (Sections 39-42).

## Constraints
- Organization-level Identity Center instance creation stays a manual bootstrap operation outside the normal organization-management API path used here (Sections 2.3, 32).
- AWS mode may manage `User`, `Group`, `GroupMembership`; externally-synced identities must never be created by Pulumi (Sections 36-37).
- External lookup prefers friendly unique attributes (display name, username) with unambiguous-result enforcement; multiple matches and missing principals fail; explicit `principalId` remains available (Section 37).
- Assignment Pulumi identity derives from principal, permission-set, and account logical IDs, not AWS-generated IDs (Section 41).
- Explicit dependencies where provider behavior requires; centralized in the Identity Center component, never incidental registration order (Section 42).
- Region is explicit (Section 86); management-account assignment rules enforced (Sections 40, 86).

## Locked Decisions
- 2026-09-28 Recorded from source; original decision date unknown: Identity Center in IaC scope with the Section 31 object list (Section 31).
- 2026-09-28 Recorded from source; original decision date unknown: Manual instance bootstrap with Pulumi-before, manual-enable, Pulumi-after sequencing (Section 32).
- 2026-09-28 Recorded from source; original decision date unknown: Bootstrap mode semantics with `false` default and discovery-failure behavior (Section 33).
- 2026-09-28 Recorded from source; original decision date unknown: Intent-proving discovery (0/1/many rules, SDK fallback, owner/status/region verification, no index-zero) (Section 34).
- 2026-09-28 Recorded from source; original decision date unknown: `aws` and `external` identity source modes (Section 35).
- 2026-09-28 Recorded from source; original decision date unknown: AWS-managed identities on identitystore resources (Section 36).
- 2026-09-28 Recorded from source; original decision date unknown: Friendly external lookup preferred with unambiguous enforcement and `principalId` escape hatch; no creation of externally-synced identities (Section 37).
- 2026-09-28 Recorded from source; original decision date unknown: Permission-set attachments across managed, inline, customer-managed, and boundary types (Section 38).
- 2026-09-28 Recorded from source; original decision date unknown: One assignment per resolved account with full expansion semantics and logical-ID identity (Sections 39-41).
- 2026-09-28 Recorded from source; original decision date unknown: Centralized explicit dependency ordering (Section 42).

## Implementation Status
- Done: nothing (workstream initialization only).
- In progress: nothing.
- Not started: discovery, bootstrap mode, identities, permission sets, assignment expansion, dependency ordering, validation, tests.

## Risks / Gaps
- Discovery metadata sufficiency for the pinned provider is unverified until implementation (Index Open Question 2).
- Depends on `org-structure` (OU paths, accounts) and `account-targeting` (set expansion semantics); changes there ripple here.
- Illustrative Section 100 assignment shapes (`targets` vs `accountSet`, `managedExecution` shorthand nearby) need normalization (Index Open Question 7).
- External IdP lookup support for usernames is "where supported" and needs verification.

## Related Docs
- `sessions/aws-organization-as-code-source-prd.md`
- `sessions/aws-organization-as-code-prd-decomposition.md`
- `sessions/aws-organization-as-code-identity-center/aws-organization-as-code-identity-center-prd.md`
- `sessions/aws-organization-as-code-identity-center/decision-log.md`
- `sessions/aws-organization-as-code-identity-center/latest.md`

## Resume Checklist
1. Read this file
2. Read latest session handoff
3. Read next-steps plan
4. Confirm next task before implementation
