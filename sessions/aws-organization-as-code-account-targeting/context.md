# AWS Organization as Code Account Targeting Context

## Objective
- Own the deterministic, Pulumi-independent account selection model: `AccountModel`, account selectors, account sets with include/exclude semantics, tag-based selection, pure helper APIs, and account-set validation, reproducing supported OrgFormation-style binding behavior in TypeScript.

## Scope
- In: pure-model layering for resolution logic (Sections 6, 13-14); enumeration APIs replacing OrgFormation syntax (Section 20); `AccountSelector` union with root semantics (Section 21); account-set definitions replacing Organization Bindings (Section 22); evaluation semantics (Section 23); tag-based selection on config-defined metadata (Section 24); account-set validation with v1 nested-reference preference (Section 84); behavioral tests for nested OU expansion, exclusion, and tag selection (Section 99); V1 account-sets definition of done (Section 118); applicable Section 119 rules (11-14).
- Out: OU resource provisioning and OU depth validation (owned by `aws-organization-as-code-org-structure`); policy documents and service integrations (owned by `aws-organization-as-code-policies-integrations`); Identity Center assignment resources (owned by `aws-organization-as-code-identity-center`, consuming this model); StackSet construction and deployment modes (owned by `aws-organization-as-code-deployments`, consuming this model); nested account-set references beyond v1 (deferred).

## Source PRD
- Parent snapshot: `sessions/aws-organization-as-code-source-prd.md`
- Decomposition index: `sessions/aws-organization-as-code-prd-decomposition.md`
- Child mapping: `aws-organization-as-code-account-targeting`
- Evidence scope: Parent content is evidence only for index rows mapped to
  this child.

## Current Architecture
- Pure organization model layer: OU graph plus `AccountModel` list -> selector evaluation (`root`/`ou`/`account`/`tag`) -> account-set resolution (union includes minus union excludes, dedupe, deterministic order, management-account rules) -> consumers: Identity Center assignment expansion, resolved deployment targeting, policy-adjacent OU/account references (Sections 6, 13, 20-24).
- `root: true` selects configured member accounts only; the management account requires explicit `includeManagementAccount` and never joins silently (Sections 21-23).
- Tag selection matches key existence or key/value against configuration-defined account metadata; v1 never queries unmanaged AWS tags to build the desired model (Section 24).
- TypeScript mapping over resolved accounts replaces OrgFormation enumeration syntax (Section 20).

## Constraints
- All resolution logic (target resolution, account-set evaluation, OU traversal, dependency analysis, most validation) must not depend on Pulumi; `AccountModel` forbids Outputs and resource objects; only the runtime `AccountContext` carries Outputs (Sections 6, 13-14).
- Pinned-provider behavior governs; no hard-coded company topology in framework code (Sections 5, 9).
- Stable logical keys and config-key OU paths are the resolution inputs (Sections 8, 12).
- Prefer forbidding nested account-set references in v1; if introduced, they need cycle checks (Section 84).
- Per-account parameter generation is deferred pending its spike; resolution here must not promise per-account parameterization (Section 73).

## Locked Decisions
- 2026-09-28 Recorded from source; original decision date unknown: Account Sets replace OrgFormation Organization Bindings with include/exclude selectors (Sections 2.2, 22).
- 2026-09-28 Recorded from source; original decision date unknown: `AccountSelector` union of root, OU, account, and tag with member-only root default (Section 21).
- 2026-09-28 Recorded from source; original decision date unknown: Evaluation semantics — additive includes, recursive OU descendants, key or key/value tag matching, exclusions after inclusion, dedupe, deterministic order, management account excluded by default (Section 23).
- 2026-09-28 Recorded from source; original decision date unknown: Tag selection operates on configuration-defined metadata only (Section 24).
- 2026-09-28 Recorded from source; original decision date unknown: Pure helper APIs (`getAccount`, `getOu`, `resolveAccounts`, `getAccountsInOu`, `getDescendantOus`) plus normal TypeScript mapping (Section 20).
- 2026-09-28 Recorded from source; original decision date unknown: Resolution stays Pulumi-independent via `AccountModel` (Sections 6, 13-14).

## Implementation Status
- Done: nothing (workstream initialization only).
- In progress: nothing.
- Not started: selector types, account-set evaluator, tag matching, helper APIs, validation, unit and behavioral tests.

## Risks / Gaps
- Depends on `aws-organization-as-code-org-structure` for OU paths and `AccountModel` shape stability.
- Consumed by `identity-center` (assignment expansion) and `deployments` (resolved targeting); semantic changes here ripple to both.
- Nested account-set references need a final v1 ruling (forbid vs cycle-checked) during `/refine-prd`.
- Illustrative Section 100 account-set shapes need normalization (Index Open Question 7).

## Related Docs
- `sessions/aws-organization-as-code-source-prd.md`
- `sessions/aws-organization-as-code-prd-decomposition.md`
- `sessions/aws-organization-as-code-account-targeting/aws-organization-as-code-account-targeting-prd.md`
- `sessions/aws-organization-as-code-account-targeting/decision-log.md`
- `sessions/aws-organization-as-code-account-targeting/latest.md`

## Resume Checklist
1. Read this file
2. Read latest session handoff
3. Read next-steps plan
4. Confirm next task before implementation
