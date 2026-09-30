# AWS Organization as Code Foundation and Operations Next Steps

**Owner:** TBD
**Status:** Active
**Last updated:** 2026-09-30
**Related plan:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md`
**Stage legend:** `Stub` = breakdown draft, `Refined` = implementation-ready,
`In Progress` = active build, `Done` = completed

---

## Now
- [ ] Test harness with the two tiers
  - Stage: `Stub`
  - Scope: Vitest, `test:unit` / `test:mock` / `test`, one exemplar per tier
  - Depends on: `01-project-scaffold-and-provider-pin` (Done)
  - Acceptance:
    - [ ] `pnpm test:unit` runs only `*.unit.test.ts`; `pnpm test:mock` runs
          only `*.mock.test.ts`
    - [ ] Both tiers pass with no AWS credentials
    - [ ] No live-AWS tier is introduced
  - Validation: TBD during refine-plan
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-02-test-harness-two-tiers.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#api-contracts-high-level`

## Next
- [ ] Layered architecture skeleton and validation framework
  - Stage: `Stub`
  - Scope: layer directories, `ValidationError`, validator aggregation,
    `pnpm validate`
  - Depends on: `01-project-scaffold-and-provider-pin`,
    `02-test-harness-two-tiers`
  - Acceptance:
    - [ ] `pnpm validate` reports every error with `code` and `reference`, no
          AWS calls
    - [ ] Multiple errors surface in one run
    - [ ] Validation tests import no Pulumi module
  - Validation: TBD during refine-plan
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-03-layered-architecture-and-validation-framework.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#api-contracts-high-level`
- [ ] Pulumi ownership and safety defaults
  - Stage: `Stub`
  - Scope: ownership boundary declaration, protection policy, preview
    high-risk list
  - Depends on: `01-project-scaffold-and-provider-pin`,
    `02-test-harness-two-tiers`
  - Acceptance:
    - [ ] Every Section 94 minimum entry is protected by default in the policy
    - [ ] The Identity Center instance is recorded as the only manual bootstrap
          exception
    - [ ] The preview high-risk list contains every Section 93 item
    - [ ] The policy is consumable by siblings without importing Pulumi
  - Validation: TBD during refine-plan
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-04-pulumi-ownership-and-safety-defaults.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#data-model-proposed`
- [ ] Naming conventions from stable logical keys
  - Stage: `Stub`
  - Scope: `src/naming/resource-names.ts` plus unit tests
  - Depends on: `01-project-scaffold-and-provider-pin`,
    `02-test-harness-two-tiers`
  - Acceptance:
    - [ ] Pulumi names derive from stable logical keys, never display names or
          AWS IDs
    - [ ] The naming module imports no Pulumi module
    - [ ] Two distinct logical keys cannot collide within one resource class
    - [ ] No alias resolution is implemented here (org-structure owns aliases)
  - Validation: TBD during refine-plan
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-06-naming-conventions.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#data-model-proposed`
- [ ] State strategy and Identity Center authentication
  - Stage: `Stub`
  - Scope: one stack per organization, Cloud and DIY backend support, SSO
    credential path
  - Depends on: `01-project-scaffold-and-provider-pin`
  - Acceptance:
    - [ ] Preview succeeds with Identity Center credentials and no static
          access keys
    - [ ] One stack holds the organization state
    - [ ] No framework source depends on Pulumi Cloud-specific APIs
    - [ ] The one-stack-per-organization rule and both backends are documented
  - Validation: TBD during refine-plan
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-05-state-and-authentication.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`

## Later
- [ ] Safe deploy command and CI gates
  - Stage: `Stub`
  - Scope: `pnpm run deploy`, CI gate order, protected deployment workflow
  - Depends on: `01-project-scaffold-and-provider-pin`,
    `02-test-harness-two-tiers`,
    `03-layered-architecture-and-validation-framework`,
    `05-state-and-authentication`
  - Acceptance:
    - [ ] `pnpm run deploy` invokes `pulumi up --parallel 5`
    - [ ] CI runs install, typecheck, `test:unit`, `test:mock`, validation, and
          preview in that order
    - [ ] Deployment is possible only from the approved protected workflow
    - [ ] CI platform and CI credential mechanism are decided (both TBD at
          breakdown)
  - Validation: TBD during refine-plan
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-07-safe-deploy-and-ci-gates.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#api-contracts-high-level`
- [ ] Operations documentation: drift, consistency, decommission
  - Stage: `Stub`
  - Scope: README drift and consistency rules, account and deployment
    decommission procedures
  - Depends on: `04-pulumi-ownership-and-safety-defaults`,
    `07-safe-deploy-and-ci-gates`
  - Acceptance:
    - [ ] README states `pulumi refresh` is useful but insufficient for
          StackSet target auditing
    - [ ] Account decommission (Section 95) and deployment decommission
          (Section 77) are documented in order
    - [ ] The two retention lifecycles are documented separately
    - [ ] No full-drift-detection claim appears
  - Validation: TBD during refine-plan
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-08-operations-documentation.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#acceptance-criteria`

## Done
- [x] Project scaffold and provider pin
  - Stage: `Done`
  - Scope delivered: Node 24 / pnpm 12.8.1 scaffold (`package.json`, `.node-version`,
    `tsconfig.json`, `.gitignore`, `Pulumi.yaml`, `config/.gitkeep`,
    `src/index.ts`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`), approved
    `@pulumi/aws` 7.48.0 pin, `src/provider-version.ts` manifest reader,
    `scripts/check-provider-version.mjs` lockfile-consistency guard wired ahead
    of `tsc --noEmit` in `pnpm typecheck`
  - Acceptance:
    - [x] `@pulumi/aws` 7.48.0 in root manifest matches the lockfile root
          resolution and a single distinct resolved version
    - [x] `pnpm install` and `pnpm typecheck` succeed on Node 24 / pnpm 12.8.1
    - [x] Shared version export reads root `package.json`, not a copied pin
    - [x] Missing/invalid/mismatched records and multiple versions fail
          `pnpm typecheck` nonzero with actionable diagnostics in isolated copies
    - [ ] Deferred to slice 05, unrun and not a slice 01 gate: empty
          `pulumi preview` with an operator-selected backend/stack
  - Validation: `pnpm typecheck` rerun 2026-09-30 exits 0 (guard reports pin and
    resolution `7.48.0`); recorded install, reader, structural, and 25 isolated
    consistency-failure scenarios in workflow attempt reports 11 and 22; test
    coverage audit `CLEAN` in attempt 23; slice workflow reached
    `status: complete`, step 10, terminal step 9 outcome `advisory`
    (attempt 24). No Vitest tier exists yet (slice 02 owns it).
  - Follow-up: `AGENTS.md` § Environment still says "Node.js 22+, pnpm 10.x" and
    its command list still includes script names slice 01 does not own; both need
    explicit user approval to correct.
  - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-01-project-scaffold-and-provider-pin.md`

## Notes
- Cross-file reconciliation still owed: the decomposition index and the
  deployments PRD still classify the per-account-parameter spike and the
  cross-deployment output design as `Deferred` with primary owner `N/A`, while
  this workstream's PRD and DEC-006 (user-approved 2026-09-29) place them in
  the deployments workstream as design-only v1 deliverables. Those index rows
  are not mapped to this workstream, so they are not slice input here.
- Capability-specific provider verification (policy-type unions, template
  limits, dependency counts, OU-target limits, SDK gaps, operation preferences)
  belongs to the owning sibling workstreams per DEC-008.

## Execution Order
1. `01-project-scaffold-and-provider-pin`
2. `02-test-harness-two-tiers`
3. `03-layered-architecture-and-validation-framework`
4. `06-naming-conventions`
5. `04-pulumi-ownership-and-safety-defaults`
6. `05-state-and-authentication`
7. `07-safe-deploy-and-ci-gates`
8. `08-operations-documentation`
