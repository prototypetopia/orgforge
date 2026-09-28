# PRD: AWS Organization as Code Identity Center

## Context

IAM Identity Center is part of the organization IaC model: AWS-managed groups, users, memberships, external principals, permission sets with managed, customer-managed, inline, and boundary policies, and per-account assignments (Section 31). The instance itself is a manual bootstrap (Sections 2.3, 32) with a bootstrap mode for core-only deployment (Section 33) and intent-proving discovery (Section 34). Assignments expand named account sets or inline selectors into one `AccountAssignment` per resolved account (Sections 39-40) with logical-ID identity (Section 41) and centralized dependency ordering (Section 42). Validation (Section 86) and the V1 Identity Center checklist (Section 118) gate this workstream.

---

## Problem

- Hard-coded AWS account IDs in access configuration are unreadable and rot on organizational change (Section 114-phase acceptance as context; Section 119 rule 15).
- Blind instance selection (`instances.arns[0]`) risks managing the wrong Identity Center instance (Sections 34, 99; Section 119 rule 16).
- Externally-synced identities created in Pulumi would fight the external IdP (Section 37).
- Overlapping OU and account targets duplicate assignments without full set semantics (Sections 40, 99).
- Incidental registration order is not a dependency strategy (Section 42).

---

## Goals

- Manage groups, users, memberships, external principals, permission sets, policy attachments, boundaries, and assignments declaratively (Section 31).
- Sequence manual instance bootstrap around Pulumi-owned organization core (Section 32).
- Support bootstrap mode defaulting to `false` with discovery-failure semantics (Section 33).
- Discover the organization instance provably, never by index (Section 34).
- Support `aws` and `external` identity sources (Section 35).
- Prefer friendly external lookup with unambiguous enforcement and a `principalId` escape hatch (Sections 37, 119 rules 18-19).
- Expand assignments per resolved account with logical-ID identity and centralized dependencies (Sections 39-42).
- Manage OU/account-set access without hard-coded AWS account IDs (Section 114-phase acceptance as context).

---

## Decisions Locked

- 2026-09-28 Recorded from source; original decision date unknown: Identity Center object scope per Section 31 list (Section 31).
- 2026-09-28 Recorded from source; original decision date unknown: Manual instance bootstrap sequencing (Section 32).
- 2026-09-28 Recorded from source; original decision date unknown: Bootstrap mode with `false` default (Section 33).
- 2026-09-28 Recorded from source; original decision date unknown: Intent-proving discovery with 0/1/many semantics, SDK fallback, and owner/status/region verification (Section 34).
- 2026-09-28 Recorded from source; original decision date unknown: `aws` and `external` identity sources (Section 35).
- 2026-09-28 Recorded from source; original decision date unknown: AWS-managed `User`, `Group`, `GroupMembership` in AWS mode (Section 36).
- 2026-09-28 Recorded from source; original decision date unknown: Friendly external lookup preferred with unambiguous enforcement and escape hatch; no Pulumi creation of externally-synced identities (Section 37).
- 2026-09-28 Recorded from source; original decision date unknown: Permission sets with managed, inline, customer-managed, and boundary attachments (Section 38).
- 2026-09-28 Recorded from source; original decision date unknown: One `AccountAssignment` per resolved account (Section 39).
- 2026-09-28 Recorded from source; original decision date unknown: Named-set or inline targets with full expansion semantics (Section 40).
- 2026-09-28 Recorded from source; original decision date unknown: Logical-ID assignment identity (Section 41).
- 2026-09-28 Recorded from source; original decision date unknown: Centralized explicit dependency ordering (Section 42).
- 2026-09-28 Recorded from source; original decision date unknown: Identity Center validation checklist (Section 86).
- Shared constraints inherited: pinned-provider behavior, logical-key identity, pure-model layering, protection defaults, and technology exclusions apply in full (decomposition index Shared Constraints).

## Decisions Proposed (Pending Approval)

- TBD (no proposed decisions scoped to this child).

---

## Non-Goals (V1)

- Organization-level Identity Center instance creation via this framework (Sections 2.3, 32).
- Creating externally-synchronized identities in Pulumi (Section 37).
- Blind index-zero instance selection (Section 34).
- Hard-coded AWS account IDs for OU assignments (Section 119 rule 15).
- External user lookup beyond what the provider supports ("where supported," Section 118).

---

## User Stories

- As a platform engineer, I can deploy organization core with `bootstrapMode=true` before the Identity Center instance exists (Section 33).
- As an operator, I get bootstrap guidance instead of a wrong-instance guess when discovery is ambiguous (Section 34).
- As a developer, I can reference the `developers` group by display name so that configuration stays readable (Section 37).
- As a developer, I can assign the `developer` permission set to the `development` account set so that access follows OU membership without account IDs (Sections 39-40).
- As a reviewer, I can trust overlapping targets dedupe to one assignment with stable logical identity (Sections 40-41).

---

## Requirements

### Functional

1. Manage AWS-managed groups, users, memberships, external principals, permission sets, managed/inline/customer-managed/boundary attachments, and assignments (Section 31).
2. Sequence manual instance bootstrap around Pulumi-owned core (Section 32).
3. Support `bootstrapMode` with `false` default; fail when Identity Center is configured but undiscoverable (Section 33).
4. Discover the instance with 0/1/many semantics, SDK `ListInstances` fallback, and owner/status/region verification (Section 34).
5. Support `aws` and `external` identity sources (Section 35).
6. Manage `identitystore` users, groups, and memberships in AWS mode (Section 36).
7. Resolve external principals by friendly unique attributes with unambiguous enforcement; support explicit `principalId`; never create externally-synced identities (Section 37).
8. Support permission-set attachments across all four policy forms (Section 38).
9. Expand assignments to one `AccountAssignment` per resolved account (Section 39).
10. Accept named account sets or inline selectors with recursive OU, tag, exclusion, management-account, and dedupe semantics (Section 40).
11. Derive assignment Pulumi identity from principal, permission-set, and account logical IDs (Section 41).
12. Centralize explicit dependency ordering for attachments and assignments (Section 42).
13. Validate region, source, discovery, principals, unique lookup, permission sets, targets, management rules, and duplicate assignments (Section 86).

### Non-Functional

- Security: ambiguous discovery fails; principal collisions fail; no unmanaged credentials.
- Privacy/Compliance: identity attributes validated; externally-synced identities never fabricated.
- Observability: discovery failures include bootstrap guidance; lookup failures name the ambiguous attribute.
- Scalability: assignment fan-out is per resolved account with dedupe.

---

## Proposed Architecture (V1)

Bootstrap gate (`bootstrapMode` plus discovery proving exactly one active organization instance) -> principal plane (AWS-managed identitystore objects; external friendly lookup with escape hatch) -> permission-set plane (sets plus four attachment forms) -> assignment plane (named sets or inline selectors resolved through the shared account-targeting model into per-account `AccountAssignment` resources with logical-ID identity) -> centralized dependency edges for attachments and assignments (Sections 31-42). OU paths, accounts, and set semantics are consumed from `org-structure` and `account-targeting` without reimplementation. Shared constraints (provider pinning, logical identity, protections) apply in full.

---

## Data Model (Proposed)

Entities: identity source (`aws`/`external`); group/user (AWS-managed attributes or external displayName/username/`principalId`); membership; permission set (name, sessionDuration, managed/inline/customer-managed/boundary); assignment (principal, permissionSet, accountSet or inline targets). Invariants: discovery resolves to exactly one instance outside bootstrap mode; external lookup unambiguous; assignments dedupe to one per account; resource identity from logical IDs.

---

## API Contracts (High-Level)

1. Identity Center declaration (TypeScript configuration contract)
   - Input: region, identitySource, groups, users, permissionSets, assignments.
   - Output: identitystore objects, permission sets with attachments, per-account assignments.
   - Behavior: bootstrap mode gates identity resources; discovery failures fail with guidance (Sections 33-34).
2. External principal lookup (resolution behavior)
   - Input: displayName/username or explicit `principalId`.
   - Output: unique Identity Store principal ID.
   - Behavior: multiple or missing matches fail (Section 37).

---

## Session State Machine (If Applicable)

- `bootstrapMode=true` (core only) -> manual instance enablement -> `bootstrapMode=false` (full identity management); discovery failure in normal mode is terminal with guidance (Sections 32-33).

---

## Security and Privacy

- Manual instance bootstrap stays outside the framework (Sections 2.3, 32).
- No Pulumi creation of externally-synced identities (Section 37).
- Explicit `principalId` escape hatch preserved (Sections 37, 119 rule 19).
- Mandatory preview for Identity Center access removal (Section 93).

---

## Acceptance Criteria

1. Organization instance discovered safely; ambiguous discovery fails (Section 118; Section 99 discovery test).
2. Region explicit; AWS-managed groups and users supported (Section 118).
3. External group lookup, external user lookup where supported, and principal-ID escape hatch (Section 118).
4. Permission sets with managed and inline policies (Section 118).
5. Assignments with account-set expansion and deduplication (Section 118; Section 99 dedupe test).
6. OU/account-set access managed without hard-coded AWS account IDs (Section 114-phase acceptance as context).

---

## Rollout Plan

1. Dev/Staging: implement bootstrap mode and discovery against a separate test organization; verify failure semantics.
2. Pilot: manage groups, permission sets, and assignments for test OUs.
3. Full rollout: workforce access changes flow through CI preview and protected deployment.

---

## Metrics

- TBD (no source-defined metrics).

---

## Open Questions

1. Does `getInstances` expose enough metadata, or is SDK `ListInstances` always required? (Section 34)
2. Which external user lookup attributes are supported by the pinned provider? (Sections 37, 118)
3. Normalization of illustrative Section 100 assignment shapes during `/refine-prd`?
