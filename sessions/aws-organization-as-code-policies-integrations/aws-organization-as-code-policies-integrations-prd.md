# PRD: AWS Organization as Code Policies and Integrations

## Context

Organization governance needs declarative policies with native targeting plus unambiguous AWS service enablement: policy types from the pinned provider, file-or-document policies with attachments (Sections 25-27), single-owner service principals with a tested prerequisite resolver (Sections 28-29), delegated administrators on logical account references (Section 30), and the StackSets Organizations trusted-access resource deployments consume (Section 52). Validation (Section 85) and the V1 policies checklist (Section 118) gate this workstream.

---

## Problem

- Claiming AWS policy types the pinned provider cannot create produces late deployment failures (Sections 5, 25, 85).
- Dual ownership of a service principal (Organization resource plus standalone access) causes conflicting updates (Section 28).
- Enabling policy types without their required service access leaves half-configured governance (Section 29).
- Expanding OU policy targets into per-account attachments duplicates state that native inheritance already provides (Section 27).
- Account IDs in delegated-admin configuration destroy readability (Section 30).

---

## Goals

- Define the policy-type union from the pinned `@pulumi/aws` and fail explicitly on unsupported types (Section 25).
- Support exactly one policy source (file XOR document) with existence checks, JSON parsing, deterministic serialization, creation, target resolution, and attachments (Section 26).
- Target root, OU, and account with native inheritance and no account expansion (Section 27).
- Keep exactly one Pulumi owner per service principal, split between organization-owned prerequisites and standalone integration (Section 28).
- Resolve policy-required service principals purely with tests (Section 29).
- Configure delegated administrators on logical account references (Section 30).
- Provide the protected StackSets Organizations access resource via the service-specific SDK API (Section 52).

---

## Decisions Locked

- 2026-09-28 Recorded from source; original decision date unknown: `aws.organizations.Policy` plus `aws.organizations.PolicyAttachment`; pinned-provider type union; explicit unsupported-type failure (Section 25).
- 2026-09-28 Recorded from source; original decision date unknown: File XOR document handling with validate, parse, serialize, create, resolve, attach (Section 26).
- 2026-09-28 Recorded from source; original decision date unknown: Native-inheritance targeting without account expansion (Section 27).
- 2026-09-28 Recorded from source; original decision date unknown: Single-owner service principals; org-owned prerequisites vs standalone `AwsServiceAccess`/service-specific resources (Section 28).
- 2026-09-28 Recorded from source; original decision date unknown: Pure tested prerequisite resolver preventing prerequisite-less policy enablement (Section 29).
- 2026-09-28 Recorded from source; original decision date unknown: Delegated admins on logical account references via `DelegatedAdministrator` (Section 30).
- 2026-09-28 Recorded from source; original decision date unknown: Protected `StackSetsOrganizationsAccess` custom resource on SDK Activate/Describe/Deactivate (Section 52).
- 2026-09-28 Recorded from source; original decision date unknown: Policy validation including exactly-one-source, JSON, provider-supported type, target existence, duplicate attachments, service principals, and tags (Section 85).
- Shared constraints inherited: pinned-provider behavior, logical-key identity, pure-model layering, protection defaults, and technology exclusions apply in full (decomposition index Shared Constraints).

## Decisions Proposed (Pending Approval)

- TBD (no proposed decisions scoped to this child).

---

## Non-Goals (V1)

- Policy types beyond the pinned provider's union (Sections 25, 85).
- Standalone `AwsServiceAccess` for principals already owned by the Organization resource (Section 28).
- OU-to-account attachment expansion (Section 27).
- StackSet deployment modes and templates (sibling `deployments`).
- Identity Center objects (sibling `identity-center`).

---

## User Stories

- As a platform engineer, I can declare a `RestrictRegions` SCP from a JSON file targeted at `workloads` so that inheritance applies without per-account attachments (Sections 26-27).
- As a reviewer, I get an explicit "not supported by the pinned provider" error so that I can upgrade the provider or choose a supported type (Section 85).
- As an operator, I can trust each service principal has exactly one owner so that access changes never conflict (Section 28).
- As a security engineer, I can enable an Inspector-style policy knowing its required service access is derived and validated (Section 29).
- As a platform engineer, I can delegate Security Hub to the security account by logical reference (Section 30).

---

## Requirements

### Functional

1. Create policies on `aws.organizations.Policy` with provider-derived type union; fail explicitly on unsupported types (Section 25).
2. Accept exactly one of `file`/`document`; validate existence, parse JSON, serialize deterministically, create, resolve logical targets, attach (Section 26).
3. Target `{ root: true }`, `{ ou }`, `{ account }` with native inheritance; never expand OU targets into account attachments (Section 27).
4. Derive org-owned policy prerequisites into `Organization.awsServiceAccessPrincipals`; manage all other access via `AwsServiceAccess` or service-specific resources with no dual ownership (Section 28).
5. Implement tested `resolvePolicyRequiredServicePrincipals(enabledPolicyTypes)` for the pinned provider (Section 29).
6. Configure delegated administrators with logical account plus service principal on `DelegatedAdministrator` (Section 30).
7. Provide protected `StackSetsOrganizationsAccess` via SDK Activate/Describe/Deactivate using the service-specific API (Section 52).
8. Validate one source, JSON, provider-supported type, target existence, duplicate effective attachments, required principals, and tags (Section 85).

### Non-Functional

- Security: single-owner principals; explicit failure on ambiguous ownership.
- Privacy/Compliance: policy tags supported; no new sensitive data.
- Observability: unsupported-type and missing-prerequisite errors name the type and required principal.
- Scalability: prerequisite resolution is pure and tested.

---

## Proposed Architecture (V1)

Policy pipeline (config -> source validation -> `Policy` -> logical target resolution -> `PolicyAttachment`) runs beside the ownership plane (enabled policy types -> prerequisite resolver -> `Organization.awsServiceAccessPrincipals` vs `AwsServiceAccess`/service-specific resources) and the delegation plane (logical account plus principal -> `DelegatedAdministrator`), with the trusted-access custom resource feeding the deployments workstream's StackSets (Sections 25-30, 52). Targeting consumes OU paths and logical keys from `org-structure` without owning them. Shared constraints (provider pinning, logical identity, protections) apply in full.

---

## Data Model (Proposed)

Entities: policy definition (name, type from pinned union, file XOR document, targets, tags); `PolicyAttachment` (policy plus resolved root/OU/account target); service-principal ownership map (principal -> exactly one owner); delegated administrator (logical account, servicePrincipal); `StackSetsOrganizationsAccess` state. Invariants: one source per policy; one owner per principal; native inheritance only.

---

## API Contracts (High-Level)

1. Policy declaration (TypeScript configuration contract)
   - Input: name, provider-supported type, file XOR document, targets, tags.
   - Output: `Policy` plus native `PolicyAttachment` resources.
   - Behavior: unsupported types and missing prerequisites fail validation (Sections 25-26, 85).
2. `resolvePolicyRequiredServicePrincipals(enabledPolicyTypes)`
   - Input: enabled policy types for the pinned provider.
   - Output: required service principal list.
   - Behavior: pure, tested, prerequisite-complete (Section 29).

---

## Session State Machine (If Applicable)

- Not applicable.

---

## Security and Privacy

- Single-owner service principals prevent conflicting access mutations (Section 28).
- Prerequisite derivation prevents half-enabled governance (Section 29).
- Protected trusted-access resource follows shared safety rails (Sections 52, 94).

---

## Acceptance Criteria

1. Policy types derived from the pinned provider; unsupported types fail cleanly with upgrade guidance (Section 118; Section 85 error text).
2. File and object policies, tags, and root/OU/account targeting supported (Section 118).
3. Policy-required service principals resolved with no duplicate ownership (Section 118).
4. Delegated administrators configured by logical account reference (Section 30).
5. StackSets Organizations access protected and service-specific (Section 52).

---

## Rollout Plan

1. Dev/Staging: implement policy pipeline and resolver with unit tests; preview against a separate test organization.
2. Pilot: attach policies to test OUs; verify inheritance and ownership validation.
3. Full rollout: governance changes flow through CI preview and protected deployment.

---

## Metrics

- TBD (no source-defined metrics).

---

## Open Questions

1. Exact pinned-provider policy union and prerequisite principal list? (Sections 5, 25, 29)
2. Normalization of illustrative Section 100 policy shapes during `/refine-prd`?
