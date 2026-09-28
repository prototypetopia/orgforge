# PRD: AWS Organization as Code Account Targeting

## Context

OrgFormation account enumeration and Organization Bindings become ordinary TypeScript: pure helper APIs and a first-class Account Set model over a Pulumi-independent `AccountModel` (Sections 2.2, 6, 13, 20-24). This workstream owns the shared selection contract consumed by Identity Center assignment expansion (Sections 39-40) and resolved deployment targeting (Sections 47-48), with validation (Section 84), behavioral tests (Section 99), and the V1 account-sets checklist (Section 118).

---

## Problem

- OrgFormation binding syntax does not exist in TypeScript; scattering OU paths and account IDs across policies, assignments, and deployments is error-prone (Sections 2.2, 22).
- Without recursive OU resolution, targeting a parent OU silently misses new child-OU accounts (Sections 23, 99).
- Without exclusion-after-inclusion semantics, "all workloads except sandbox" cannot be expressed safely (Sections 22-23).
- Without deterministic ordering and dedupe, overlapping selectors produce unstable plans (Section 23).
- Without a member-only root default, whole-org selectors risk touching the management account (Sections 21, 23).

---

## Goals

- Expose pure helper APIs (`getAccount`, `getOu`, `resolveAccounts`, `getAccountsInOu`, `getDescendantOus`) plus normal TypeScript mapping (Section 20).
- Support the `AccountSelector` union with safe root semantics (Section 21).
- Implement Account Sets with include, optional exclude, and explicit management-account inclusion (Section 22).
- Evaluate as union(includes) minus union(excludes) with recursive OU descendants, tag key or key/value matching, dedupe, and deterministic order (Section 23).
- Match tags against configuration-defined metadata only (Section 24).
- Reproduce supported OrgFormation-style binding behavior with full pure-model tests (Sections 98, 107-phase acceptance as context).

---

## Decisions Locked

- 2026-09-28 Recorded from source; original decision date unknown: Account Sets replace Organization Bindings (Sections 2.2, 22).
- 2026-09-28 Recorded from source; original decision date unknown: Selector union with member-only root default (Section 21).
- 2026-09-28 Recorded from source; original decision date unknown: Additive includes, recursive OU inclusion, individual account inclusion, key or key/value tag matching, exclusions after inclusion, dedupe, deterministic order, management account excluded by default with explicit inclusion (Section 23).
- 2026-09-28 Recorded from source; original decision date unknown: Tag selection on configuration-defined metadata; no dynamic unmanaged-tag queries (Section 24).
- 2026-09-28 Recorded from source; original decision date unknown: Pure helper APIs plus TypeScript mapping replace OrgFormation enumeration (Section 20).
- 2026-09-28 Recorded from source; original decision date unknown: Resolution stays Pulumi-independent on `AccountModel` (Sections 6, 13-14).
- 2026-09-28 Recorded from source; original decision date unknown: Account-set validation covering includes, OU/account/tag references, management-account rules, dedupe, and nested references (Section 84).
- Shared constraints inherited: pinned-provider behavior, logical-key identity, pure-model layering, and technology exclusions apply in full (decomposition index Shared Constraints).

## Decisions Proposed (Pending Approval)

- 2026-09-28 Agent-Recommended: Forbid nested account-set references in v1 rather than supporting cycle-checked nesting - rationale: the source states "Prefer forbidding nested account-set references in v1" (Section 84), so the stricter reading is the safer default pending `/refine-prd` approval.

---

## Non-Goals (V1)

- Nested account-set references beyond the v1 preference (Section 84; deferred).
- Per-account parameter generation (Section 73; deferred).
- Dynamic unmanaged-tag queries for desired-model construction (Section 24).
- Policy documents, Identity Center resources, and StackSet construction (sibling workstreams consuming this model).
- Silently including the management account in default selection (Sections 21, 23).

---

## User Stories

- As a developer, I can define a `workloads` set including an OU so that policies, assignments, and deployments share one target definition (Section 22).
- As a developer, I can exclude `workloads/sandbox` from an inclusion so that exceptions are explicit and ordered (Sections 22-23).
- As a developer, I can select accounts by tag key existence (e.g. `BudgetThreshold`) or key/value (e.g. `Environment: production`) so that metadata drives targeting (Section 24).
- As a developer, I can map over resolved accounts with normal TypeScript so that no custom enumeration DSL is needed (Section 20).
- As a reviewer, I can trust that `root: true` never silently includes the management account (Section 21).

---

## Requirements

### Functional

1. Provide `org.getAccount`, `org.getOu`, `org.resolveAccounts`, `org.getAccountsInOu`, `org.getDescendantOus` over the pure model plus TypeScript mapping support (Section 20).
2. Accept selectors: `{ root: true }`, `{ ou }`, `{ account }`, `{ tag: { key, value? } }` (Section 21).
3. Accept account-set definitions with required `include`, optional `exclude`, and `includeManagementAccount` (Section 22).
4. Evaluate includes additively with recursive OU descendants and key or key/value tag matching (Section 23).
5. Apply exclusions after inclusion; remove duplicates; order deterministically; exclude the management account by default (Section 23).
6. Resolve tags against configuration-defined account metadata only (Section 24).
7. Validate at least one include selector, OU/account/tag references, management-account rules, deterministic dedupe, and nested references (Section 84).

### Non-Functional

- Security: management account never included silently; explicit inclusion only.
- Privacy/Compliance: Not applicable (no new sensitive data; account metadata is configuration).
- Observability: validation errors name the set and missing reference (shared Section 82 quality bar).
- Scalability: evaluation is pure and deterministic; no cloud calls per resolution.

---

## Proposed Architecture (V1)

Pure-model evaluator: `AccountModel[]` plus OU graph -> selector matching (root expands to member accounts; OU expands recursively; account matches singly; tag matches config metadata) -> set union/difference with dedupe and deterministic ordering -> typed account arrays for consumers (Sections 20-24). No Pulumi imports in this layer (Sections 6, 13). Downstream: Identity Center expands assignments per resolved account (Section 40); resolved deployments intersect resolved sets with organization targets (Section 48). Shared constraints (logical identity, OU paths, pure layering) apply in full.

---

## Data Model (Proposed)

Entities: `AccountSelector` union; `AccountSetDefinition` (include, exclude?, includeManagementAccount?); `AccountModel` (logicalId, name, email, organizationalUnit, tags, isManagementAccount). Invariants: includes non-empty; exclusions post-inclusion; dedupe; deterministic order; management account excluded unless explicitly included.

---

## API Contracts (High-Level)

1. `org.resolveAccounts({ include, exclude?, includeManagementAccount? })`
   - Input: selector lists over the pure model.
   - Output: deterministically ordered, deduplicated `AccountModel[]`.
   - Behavior: union(includes) minus union(excludes) per Section 23.
2. `org.getAccountsInOu(ouPath)` / `org.getDescendantOus(ouPath)`
   - Input: logical OU path.
   - Output: member accounts / descendant OU paths recursively.
   - Behavior: recursive descent per Sections 20, 23.

---

## Session State Machine (If Applicable)

- Not applicable.

---

## Security and Privacy

- Management-account exclusion by default with explicit inclusion only (Sections 21-23).
- No dynamic queries of unmanaged AWS tags (Section 24).

---

## Acceptance Criteria

1. Named Account Sets with recursive OU inclusion, account inclusion, OU/account exclusion, tag-key and tag key/value matching, dedupe, default management exclusion, and explicit management inclusion (Section 118 checklist).
2. Nested OU expansion test: selecting `workloads` returns descendant accounts only (Section 99).
3. Account exclusion test: include `workloads`, exclude `prod-b` yields the remainder (Section 99).
4. Tag selection test: `Environment: production` matches only configured production-tagged accounts (Section 99).
5. Unsafe inputs (missing includes, unknown OU/account references, ambiguous management rules) fail validation with actionable errors (Section 84).

---

## Rollout Plan

1. Dev/Staging: implement pure evaluator with unit tests; no AWS access required.
2. Pilot: consume from Identity Center and deployment workstreams in preview.
3. Full rollout: account sets become the single targeting language for all consumers.

---

## Metrics

- TBD (no source-defined metrics).

---

## Open Questions

1. Forbid or cycle-check nested account-set references in v1? (Section 84)
2. Normalization of illustrative Section 100 set shapes during `/refine-prd`?
