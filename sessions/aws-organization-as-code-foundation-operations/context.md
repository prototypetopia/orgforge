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
- Recommended repo layout with `config/`, `src/{types,model,runtime,organization,policies,identity-center,integrations,deployments,validation,naming}/`, `policies/`, and `deployments/`; colocated tests per `AGENTS.md` and `TESTS.md` (Section 7 is illustrative).
- PRs run install, typecheck, `pnpm test:unit` and `pnpm test:mock`, configuration validation, and Pulumi preview; organization modifications never auto-deploy from arbitrary branches; `pnpm run deploy` maps to `pulumi up --parallel 5` (Sections 91-92, 62).
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
- 2026-09-30 `@pulumi/aws` pinned to exact `7.48.0` with `@pulumi/pulumi` 3.265.0;
  root `package.json` is the single version record and the lockfile guard enforces
  agreement, failing explicitly on mismatch or multiple resolved versions
  (DEC-011). This is the pin that governs behavior for all siblings.
- 2026-10-02 Slice 02 locked decisions recorded as DEC-014: exact-pin
  `vitest` 5.0.3 devDependency; one shared Vitest run with default per-file
  isolation and substring tier filters (`vitest run unit.test` /
  `vitest run mock.test`) over the two-suffix include; unit-tier no-Pulumi
  rule stays a `TESTS.md` review rule (mechanical guard owned by
  account-targeting per DEC-008's ownership mapping); exemplars placed at
  `src/provider-version.unit.test.ts` and `src/runtime/set-mocks.mock.test.ts`
  (the mock fixture is relocatable in slice 03). Pinned-provider evidence:
  `@pulumi/aws` 7.48.0 exposes flat named exports plus per-service
  namespaces, not an `import { aws }` wrapper.
- 2026-09-30 Toolchain is Node 24 (`engines.node ">=24 <25"`, `.node-version` 24)
  with `pnpm@12.8.1` and `lockfileVersion` 9 only, overriding the `AGENTS.md`
  Node 22+ / pnpm 10.x baseline for this repo (DEC-012). `AGENTS.md` still
  carries the old wording.
- 2026-09-30 The empty `pulumi preview` for this scaffold is deferred to slice 05
  and recorded unrun: not a slice 01 gate, not waived, and preview stays
  mandatory before organization changes (DEC-013).

## Implementation Status
- Done: slice 01 project scaffold and provider pin (`Stage: Done`; workflow
  `status: complete`, step 10, terminal step 9 outcome `advisory`). Delivers
  `package.json`, `.node-version`, `tsconfig.json`, `.gitignore`, `Pulumi.yaml`,
  `config/.gitkeep`, `src/index.ts`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`,
  `src/provider-version.ts`, and `scripts/check-provider-version.mjs`, with
  `pnpm typecheck` running the guard before `tsc --noEmit`.
- Done: slice 02 test harness two tiers (`Stage: Done`; workflow
  `status: complete`, step 10, terminal step 9 outcome `advisory`, 15
  iterations, 2026-10-02). Delivers exact `vitest` 5.0.3, the
  `test:unit` / `test:mock` / `test` scripts, root `vitest.config.ts`
  (two-suffix include + `@/*` alias), `src/provider-version.unit.test.ts`, and
  `src/runtime/set-mocks.mock.test.ts`; both tiers pass with no AWS
  credentials and suffix-exclusive selection (DEC-014).
- In progress: nothing.
- Not started: the remaining six slices, in execution order (03 layered
  architecture and validation framework, 06 naming conventions,
  04 Pulumi ownership and safety defaults, 05 state and authentication,
  07 safe deploy and CI gates, 08 operations documentation).
- Canonical task state: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`.
## Risks / Gaps
- Foundation pinned and recorded `@pulumi/aws` 7.48.0 (DEC-011); the owning siblings must still verify policy types, template limits, dependency counts, OU-target limits, SDK gaps, and operation preferences against that version (Index Open Questions 1-3; DEC-008).
- `AGENTS.md` § Environment (Node 22+ / pnpm 10.x) and the `import { aws }`
  import style shown in `AGENTS.md`/`TESTS.md` (which does not compile against
  the pinned `@pulumi/aws` 7.48.0 — flat named exports per DEC-014 evidence) both
  need explicit user approval to correct (DEC-012). Of the `AGENTS.md` command
  list, `test:unit` / `test:mock` / `test` are now real (slice 02); `lint`,
  `format`, `validate`, `deploy` close as slices 03 and 07 land.
- The empty `pulumi preview` remains unrun and is slice 05's obligation (DEC-013), so no slice 01 evidence of a loadable Pulumi program exists yet.
- Safe deploy command decided: `pnpm run deploy` runs `pulumi up --parallel 5` (DEC-006).
- Illustrative Section 100 field shapes may need normalization during `/refine-prd` (Index Open Question 7).
- Sibling workstreams depend on the validation framework and protection defaults defined here; sequencing puts this workstream first.
- Per-account parameter and cross-output designs are design-only v1 deliverables in the deployments workstream; their implementations and the audit command remain deferred (DEC-006). The decomposition index and deployments PRD are stale on this point and are not slice input here (DEC-009).
- CI platform, CI credential mechanism, and the repository's backend selection are unchosen; the deploy/CI slice ships scripts and a provider-agnostic gate order only (DEC-010).
- The index maps the purity rule (Section 6 second clause, rules 13-14) to `aws-organization-as-code-account-targeting`, so foundation's slice 03 owns the layer skeleton and validator framework, not the mechanical no-Pulumi-import guard.

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
