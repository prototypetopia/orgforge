# AWS Organization as Code Policies and Integrations Context

## Objective
- Govern the organization with declarative policies (provider-supported types, file/object documents, native targeting, attachments) and unambiguous service integrations (single-owner service principals, delegated administrators, StackSets Organizations access).

## Scope
- In: policy implementation boundary on `Policy` plus `PolicyAttachment` with pinned-provider type union (Section 25); policy definition handling with exactly one of file/document (Section 26); native-inheritance policy targeting without OU-to-account expansion (Section 27); single-owner service access ownership with org-owned prerequisites vs standalone integration (Section 28); pure prerequisite resolver with tests (Section 29); delegated administrators via logical account references (Section 30); StackSets Organizations access custom resource via SDK Activate/Describe/Deactivate with protection (Section 52); policy validation including explicit unsupported-type error (Section 85); V1 policies definition of done (Section 118); applicable Section 119 rules (20-22).
- Out: OU/account provisioning (owned by `aws-organization-as-code-org-structure`); account-set evaluation semantics (owned by `aws-organization-as-code-account-targeting`); Identity Center objects (owned by `aws-organization-as-code-identity-center`); StackSet deployment modes and templates (owned by `aws-organization-as-code-deployments`, consuming trusted access); project scaffolding and CI (owned by `aws-organization-as-code-foundation-operations`).

## Source PRD
- Parent snapshot: `sessions/aws-organization-as-code-source-prd.md`
- Decomposition index: `sessions/aws-organization-as-code-prd-decomposition.md`
- Child mapping: `aws-organization-as-code-policies-integrations`
- Evidence scope: Parent content is evidence only for index rows mapped to
  this child.

## Current Architecture
- Policy pipeline: configuration (name, provider-supported type, file XOR document, targets, tags) -> source validation (existence, JSON parse, deterministic serialization) -> `aws.organizations.Policy` -> logical target resolution (root/OU/account) -> `aws.organizations.PolicyAttachment` per native inheritance (Sections 25-27).
- Service-access ownership: enabled policy types derive required principals into `Organization.awsServiceAccessPrincipals` (organization-owned); everything else uses `AwsServiceAccess` or service-specific resources; no principal has two owners (Section 28).
- Delegated administration: logical account reference plus service principal -> `aws.organizations.DelegatedAdministrator` (Section 30).
- StackSets trusted access: Pulumi-managed `StackSetsOrganizationsAccess` custom resource (SDK v3) with `protect: true`, consumed by the deployments workstream (Section 52).

## Constraints
- Policy-type union derives from the pinned `@pulumi/aws`; AWS-supported but provider-unsupported types fail explicitly with upgrade guidance (Sections 5, 25, 85).
- Exactly one source per policy (file XOR document) (Section 26).
- Native Organizations inheritance; never expand OU policy targets into per-account attachments (Section 27).
- Exactly one Pulumi owner per service principal; organization-owned prerequisites must not also use standalone `AwsServiceAccess` (Section 28; Section 119 rules 20-21).
- Prerequisite principals derived from enabled policy configuration, covered by tests (Section 29; Section 119 rule 22).
- Service-specific trusted-access API, not generic trusted access (Section 52).

## Locked Decisions
- 2026-09-28 Recorded from source; original decision date unknown: `Policy` plus `PolicyAttachment` with pinned-provider type union and explicit unsupported-type failure (Section 25).
- 2026-09-28 Recorded from source; original decision date unknown: File XOR document sources with existence check, JSON parse, deterministic serialization, target resolution, and attachment creation (Section 26).
- 2026-09-28 Recorded from source; original decision date unknown: Root/OU/account targeting with native inheritance and no account expansion (Section 27).
- 2026-09-28 Recorded from source; original decision date unknown: Single-owner service principals; org-owned policy prerequisites vs standalone integration (Section 28).
- 2026-09-28 Recorded from source; original decision date unknown: Pure tested `resolvePolicyRequiredServicePrincipals` for the pinned provider (Section 29).
- 2026-09-28 Recorded from source; original decision date unknown: Delegated admins via logical account references (Section 30).
- 2026-09-28 Recorded from source; original decision date unknown: Protected `StackSetsOrganizationsAccess` custom resource via SDK Activate/Describe/Deactivate (Section 52).

## Implementation Status
- Done: nothing (workstream initialization only).
- In progress: nothing.
- Not started: policy parsing/attachments, prerequisite resolver, delegated admins, trusted-access resource, validation, tests.

## Risks / Gaps
- Supported policy types and prerequisite principal list depend on the pinned provider version (Index Open Question 1).
- Depends on `org-structure` for OU/account existence and on `foundation-operations` for provider pinning and validation rails.
- `deployments` depends on the trusted-access resource owned here; ownership boundary must hold in implementation.
- Illustrative Section 100 policy shapes need normalization (Index Open Question 7).

## Related Docs
- `sessions/aws-organization-as-code-source-prd.md`
- `sessions/aws-organization-as-code-prd-decomposition.md`
- `sessions/aws-organization-as-code-policies-integrations/aws-organization-as-code-policies-integrations-prd.md`
- `sessions/aws-organization-as-code-policies-integrations/decision-log.md`
- `sessions/aws-organization-as-code-policies-integrations/latest.md`

## Resume Checklist
1. Read this file
2. Read latest session handoff
3. Read next-steps plan
4. Confirm next task before implementation
