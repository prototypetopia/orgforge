# AWS Organization as Code Foundation and Operations Context

## Objective
- Establish the safe, pinned, TypeScript + Pulumi project foundation (stack, provider policy, layering, repo layout, validation quality bar) and the organization lifecycle operations (state, auth, CI, safe deploy, preview, protections, drift, consistency, testing) that all capability workstreams build on.

## Scope
- In: technology stack and SDK containment (Source Sections 4-5); five-layer architecture and purity rule (Section 6); recommended repository structure (Section 7); validation quality bar (Section 82); state strategy and backend (Sections 88-89); authentication (Section 90); CI/CD (Section 91); safe deployment command and account-creation parallelism (Sections 62, 92); preview safety (Section 93); protected-resources minimum set as primary owner (Section 94); drift handling (Section 96); eventual consistency rules (Section 97); testing strategy (Section 98); V1 definition of done as shared acceptance inventory (Section 118); critical agent guardrails owned here (Section 119 rules 1-5, 48-50).
- Out: OU/account/org resource implementation (owned by `aws-organization-as-code-org-structure`); account-set resolution semantics (owned by `aws-organization-as-code-account-targeting`); policy content and service-principal ownership resolution (owned by `aws-organization-as-code-policies-integrations`); Identity Center objects and discovery (owned by `aws-organization-as-code-identity-center`); StackSet deployment modes, templates, and artifacts (owned by `aws-organization-as-code-deployments`); per-account parameters, cross-deployment outputs, and the future audit command (deferred).

## Source PRD
- Parent snapshot: `sessions/aws-organization-as-code-source-prd.md`
- Decomposition index: `sessions/aws-organization-as-code-prd-decomposition.md`
- Child mapping: `aws-organization-as-code-foundation-operations`
- Evidence scope: Parent content is evidence only for index rows mapped to
  this child.

## Current Architecture
- One long-lived Pulumi stack per AWS Organization; Pulumi Cloud or DIY (S3) backend with no framework dependence on Pulumi Cloud APIs (Sections 88-89).
- Five layers: user configuration -> schema + semantic validation -> pure organization model -> Pulumi runtime model -> AWS resources; target resolution, account-set evaluation, OU traversal, dependency analysis, and most validation stay Pulumi-independent (Section 6).
- Recommended repo layout with `config/`, `src/{types,model,runtime,organization,policies,identity-center,integrations,deployments,validation,naming}/`, `policies/`, `deployments/`, `test/` (Section 7, recommended/illustrative).
- PRs run install, typecheck, unit tests, configuration validation, and Pulumi preview; organization modifications never auto-deploy from arbitrary branches; `npm run deploy` enforces org-safe defaults including constrained parallelism when account creation may occur (Sections 91-92, 62).
- `pulumi preview` is mandatory; high-risk previews (account replacement/removal, OU deletion/move, SCP and service-access changes, access removal, StackSet/StackInstances/management-stack/trusted-access deletion) get explicit review; drift guidance uses refresh plus preview with documented StackSet limitations; no automatic adoption of unmanaged resources (Sections 93, 96, 78).

## Constraints
- Pinned `@pulumi/aws` version via lockfile governs supported behavior; type unions reflect the pinned provider; AWS-supported but provider-unsupported features fail explicitly; no silent `@pulumi/aws-native` gap-filling; provider upgrades are reviewed as infrastructure changes (Section 5).
- AWS SDK v3 only where `@pulumi/aws` lacks the operation or exposes insufficient discovery metadata (Section 4).
- No OrgFormation, Terraform CLI, CDKTF, Control Tower, AFT, LZA, or SST inside this project without a separate architecture decision; SST applications remain separate state boundaries (Section 4).
- Protection minimums: Organization, member accounts, StackSets Organizations access, artifact bucket, organization-wide StackSets, StackInstances, critical management-account stacks (critical policies optionally); `pulumi destroy` must fail before destroying organization-critical resources (Sections 19, 94).
- Console changes to IaC-owned resources are drift; imports are deliberate (Section 96).
- Eventual consistency: Pulumi dependency edges first, provider/SDK waiters, no arbitrary sleeps, documented unavoidable cases, useful errors (Section 97).
- Live AWS Organizations must not be created/destroyed automatically in ordinary CI (Section 98).

## Locked Decisions
- 2026-09-28 Recorded from source; original decision date unknown: TypeScript with `@pulumi/pulumi`, `@pulumi/aws`, and AWS SDK v3 (contained) is the stack (Section 4).
- 2026-09-28 Recorded from source; original decision date unknown: Pinned provider behavior governs; unsupported features fail explicitly (Section 5).
- 2026-09-28 Recorded from source; original decision date unknown: Five-layer architecture with Pulumi-independent pure model (Section 6).
- 2026-09-28 Recorded from source; original decision date unknown: One long-lived Pulumi stack per AWS Organization; no dev/staging/prod copies of one org (Section 88).
- 2026-09-28 Recorded from source; original decision date unknown: Pulumi Cloud and DIY backends supported; no Cloud-specific framework APIs (Section 89).
- 2026-09-28 Recorded from source; original decision date unknown: Identity Center credentials for development; no long-lived access keys required (Section 90).
- 2026-09-28 Recorded from source; original decision date unknown: Mandatory preview; protected workflow for deployment; no auto-deploy from arbitrary branches (Sections 91, 93).
- 2026-09-28 Recorded from source; original decision date unknown: Protected-resources minimum set (Section 94).
- 2026-09-28 Recorded from source; original decision date unknown: Conservative account-creation parallelism (`pulumi up --parallel 5` or lower) via the safe deployment script and CI (Sections 62, 92).
- 2026-09-28 Recorded from source; original decision date unknown: Validation precedes dependent resources with actionable errors (Section 82).
- 2026-09-28 Recorded from source; original decision date unknown: Platform-behavior conflicts are resolved by verifying current docs/API, documenting the conflict, and following verified behavior (Section 119 rule 50).

## Implementation Status
- Done: nothing (workstream initialization only).
- In progress: nothing.
- Not started: project scaffolding, provider pinning, naming helpers, validation framework, state/auth/CI wiring, safe deploy script, protection defaults, drift and consistency documentation, testing harness.

## Risks / Gaps
- Pinned `@pulumi/aws` version is TBD at decomposition time; supported policy types, template limits, dependency counts, and OU-target limits all depend on it (Index Open Questions 1-3).
- Exact safe parallelism value and deploy script form are TBD pending implementation (Index Open Question 4).
- Illustrative Section 100 field shapes may need normalization during `/refine-prd` (Index Open Question 7).
- Sibling workstreams depend on the validation framework and protection defaults defined here; sequencing puts this workstream first.
- Per-account parameter spike, cross-output design, and audit command scoping (v1 vs deferred) remain open (Index Open Questions 5-6).

## Related Docs
- `sessions/aws-organization-as-code-source-prd.md`
- `sessions/aws-organization-as-code-prd-decomposition.md`
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md`
- `sessions/aws-organization-as-code-foundation-operations/decision-log.md`
- `sessions/aws-organization-as-code-foundation-operations/latest.md`

## Resume Checklist
1. Read this file
2. Read latest session handoff
3. Read next-steps plan
4. Confirm next task before implementation
