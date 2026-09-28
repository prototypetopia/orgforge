# PRD: AWS Organization as Code Org Structure

## Context

A repository checkout must describe the intended AWS Organization without console inspection: OU hierarchy, accounts, placement, creation settings, metadata, policies, targets, services, delegated admins, Identity Center, account sets, deployments, modes, dependencies, and regions (Section 2.1). This workstream owns the structural core: the top-level `OrganizationDefinition` contract (Section 9), nested OUs (Section 10), OU depth validation (Section 11), logical OU paths (Section 12), the `AccountModel`/`AccountContext` layering (Sections 13-14), accounts (Section 15), defaults (Section 16), creation-vs-mutable settings (Section 17), account and organization safety (Sections 18-19), organization validation (Section 83), account decommissioning (Section 95), and the new-account and account-move convergence workflows (Sections 101-102).

---

## Problem

- Company OU topologies vary, but the framework must not hard-code any of them (Section 9).
- OU depth violations discovered after partial deployment strand organization state (Section 11).
- Display-name-based identity forks resources on rename; raw AWS IDs in config destroy readability (Section 8).
- Creation settings (`roleName`, `iamUserAccessToBilling`) look mutable but can replace or hide state (Section 17).
- Account deletion semantics are misunderstood: `closeOnDeletion: false` still removes the account from the organization (Section 18).

---

## Goals

- Declare arbitrary nested OUs with tags, children, and aliases from stable logical keys (Sections 8-10).
- Validate OU depth in the pure model before resource creation (Section 11).
- Compute deterministic logical OU paths from config keys for all targeting consumers (Section 12).
- Keep account selection logic on a Pulumi-independent `AccountModel`, using `AccountContext` only at runtime (Sections 13-14).
- Support shared account defaults with per-account override (Section 16).
- Distinguish creation settings from mutable settings with high-risk replacement previews (Section 17).
- Protect accounts and the organization by default with explicit decommissioning (Sections 18-19, 95).
- Converge policies, StackSets, sets, assignments, and resolved deployments on account arrival and moves with visible previews (Sections 101-102).

---

## Decisions Locked

- 2026-09-28 Recorded from source; original decision date unknown: No prescribed company OU structure (Section 9).
- 2026-09-28 Recorded from source; original decision date unknown: Nested OUs via `aws.organizations.OrganizationalUnit` with name, tags, children, aliases (Section 10).
- 2026-09-28 Recorded from source; original decision date unknown: Pure-model OU depth validation against five levels beneath root (Section 11).
- 2026-09-28 Recorded from source; original decision date unknown: Config-key logical OU paths consumed by placement, policies, sets, assignments, deployments (Section 12).
- 2026-09-28 Recorded from source; original decision date unknown: Pulumi-free `AccountModel`; runtime-only `AccountContext` with `id: Output<string>` (Sections 13-14).
- 2026-09-28 Recorded from source; original decision date unknown: Accounts via `aws.organizations.Account` (Section 15).
- 2026-09-28 Recorded from source; original decision date unknown: Account defaults with per-account override (Section 16).
- 2026-09-28 Recorded from source; original decision date unknown: Creation-vs-mutable settings distinction (Section 17).
- 2026-09-28 Recorded from source; original decision date unknown: `closeOnDeletion: false` plus `protect: true` on every member account; protected-removal failure; explicit decommission (Section 18).
- 2026-09-28 Recorded from source; original decision date unknown: Organization `featureSet: "ALL"` plus `protect: true` (Section 19).
- 2026-09-28 Recorded from source; original decision date unknown: Organization validation checklist including duplicates, placement, aliases, creation-setting changes, management-account references (Section 83).
- 2026-09-28 Recorded from source; original decision date unknown: Nine-step account decommissioning; normal `pulumi up` never closes accounts (Section 95).
- Shared constraints inherited: pinned-provider behavior, logical-key identity, pure-model layering, protection defaults, and technology exclusions apply in full (decomposition index Shared Constraints).

## Decisions Proposed (Pending Approval)

- TBD (no proposed decisions scoped to this child; illustrative Section 100 shapes are context only pending `/refine-prd` normalization).

---

## Non-Goals (V1)

- Prescribing a company OU structure (Section 9).
- Account-set evaluation semantics (sibling `account-targeting`).
- Policy content, service-access ownership, delegated admins (sibling `policies-integrations`).
- Identity Center objects and discovery (sibling `identity-center`).
- StackSet deployment modes, templates, artifacts (sibling `deployments`).
- Automatically closing AWS accounts via normal operations (Section 95).
- dev/staging/prod copies of one organization (Section 88).

---

## User Stories

- As a platform engineer, I can declare nested OUs and accounts in TypeScript so that the whole organization is reviewable without the console (Sections 2.1, 9-10, 15).
- As a developer, I can rely on shared account defaults with per-account override so that billing role and tags stay consistent (Section 16).
- As a reviewer, I can see OU depth and creation-setting risks in validation and preview so that dangerous changes never land silently (Sections 11, 17).
- As an organization owner, I can decommission an account through an explicit workflow so that removal is deliberate and auditable (Section 95).
- As an operator, I can move an account between OUs and preview the resulting policy, assignment, and deployment changes (Section 102).

---

## Requirements

### Functional

1. Accept `OrganizationDefinition` with accountDefaults, organizationalUnits, accounts, accountSets, policies, identityCenter, integrations, deployments without prescribing topology (Section 9).
2. Support arbitrary nested OUs (name, tags, children, aliases) on `aws.organizations.OrganizationalUnit` (Section 10).
3. Compute OU depth in the pure model and fail validation over five levels beneath root with an actionable path message (Section 11).
4. Compute deterministic config-key OU paths used by placement, policies, sets, assignments, deployments (Section 12).
5. Model accounts as Pulumi-free `AccountModel` for selection logic and `AccountContext` (plus `id` Output) only at runtime (Sections 13-14).
6. Provision accounts via `aws.organizations.Account` with shared defaults and per-account override (Sections 15-16).
7. Distinguish creation settings from mutable settings; document creation settings; flag replacement previews as high risk (Section 17).
8. Default accounts to `closeOnDeletion: false` plus `protect: true`; fail protected on declaration removal (Section 18).
9. Create the Organization with `featureSet: "ALL"` plus `protect: true` (Section 19).
10. Validate organization checklists (duplicate paths/keys/emails, placement, fields, aliases, creation-setting changes, management-account references) (Section 83).
11. Document and enforce the nine-step account decommissioning workflow (Section 95).
12. Converge inherited policies, automatic StackSets, set membership, assignments, and resolved deployments on account arrival; recalculate all of them on account moves with visible preview (Sections 101-102).

### Non-Functional

- Security: protection defaults enforced at resource options; decommissioning explicit and auditable.
- Privacy/Compliance: account emails and metadata validated, never used as resource identity.
- Observability: depth, placement, and creation-setting errors are actionable with paths and keys.
- Scalability: account creation flows through the shared safe parallelism command (Sections 62, 92).

---

## Proposed Architecture (V1)

Configuration (`organization.ts`) -> pure organization model (OU graph, OU paths, `AccountModel`, depth/reference validation, all Pulumi-independent) -> Pulumi runtime (`AccountContext`, Outputs, ComponentResources) -> `Organization`, `OrganizationalUnit`, `Account` resources (Sections 6, 9-16). OU paths fan out to sibling targeting consumers (policies, sets, assignments, deployments) without this workstream owning their semantics (Section 12). Safety rails (protections, preview, decommissioning) come from the shared foundation and are enforced here at the resource layer (Sections 18-19, 95).

---

## Data Model (Proposed)

Entities: `OrganizationDefinition`; `OrganizationalUnitDefinition` (name, tags, children, aliases); account definition (name, email, organizationalUnit, tags, roleName, iamUserAccessToBilling); `AccountModel` (logicalId, name, email, organizationalUnit, tags, isManagementAccount; no Outputs); `AccountContext` (model plus `id: Output<string>`). Invariants: logical keys stable; paths derived from keys; depth at most five beneath root; creation settings never treated as ordinary mutations; accounts and organization protected.

---

## API Contracts (High-Level)

1. `OrganizationDefinition` (TypeScript configuration contract)
   - Input: accountDefaults, organizationalUnits, accounts, plus sibling sections.
   - Output: validated pure organization model.
   - Behavior: unknown OU structures accepted; depth and reference violations fail pre-creation (Sections 9-12).
2. Account decommission workflow (documented procedure)
   - Input: account targeted for removal.
   - Output: staged access removal, retention review, quarantine move, preview, explicit unprotection, deliberate removal.
   - Behavior: normal `pulumi up` never closes accounts (Section 95).

---

## Session State Machine (If Applicable)

- Not applicable.

---

## Security and Privacy

- `protect: true` on Organization and accounts; `closeOnDeletion: false` documented as removal-from-organization, not no-op (Sections 18-19).
- Mandatory preview for OU deletion/move, account replacement/removal (Section 93).
- Explicit nine-step decommissioning preserving required data (Section 95).

---

## Acceptance Criteria

1. Nested OUs supported with tags; OU depth over the limit fails before resource creation (Sections 10-11; Section 99 OU-depth test).
2. OU tags, accounts, defaults, and account tags supported (Section 118 org checklist).
3. Creation settings distinguished from mutable settings (Section 17).
4. Every member account uses `protect: true` with `closeOnDeletion: false`; tests document removal-from-organization semantics (Section 99 deletion-safety test).
5. Organization created with required features and protection (Section 118).
6. Account removal semantics documented; new-account and account-move workflows converge all downstream targets with visible preview (Sections 95, 101-102).

---

## Rollout Plan

1. Dev/Staging: build pure model and validation against a genuinely separate test organization; verify depth, defaults, and safety defaults in preview.
2. Pilot: provision greenfield organization structure; exercise arrival and move workflows.
3. Full rollout: structural changes flow through CI preview and the safe deploy command.

---

## Metrics

- TBD (no source-defined metrics).

---

## Open Questions

1. Exact pinned-provider account replace behavior for `iamUserAccessToBilling` changes?
2. Should aliases participate in path resolution or display only?
3. Normalization of illustrative Section 100 account shapes during `/refine-prd`?
