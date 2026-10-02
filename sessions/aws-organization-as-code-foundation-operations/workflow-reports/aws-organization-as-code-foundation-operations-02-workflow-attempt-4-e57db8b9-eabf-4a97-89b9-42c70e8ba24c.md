# Workflow Attempt Report — aws-organization-as-code-foundation-operations 02

- Slice: aws-organization-as-code-foundation-operations 02
- Source step: 0 (refine-plan, read-only)
- Owner skill: refine-plan
- Role agent: slice-design-readonly
- Child session ID: ses_f024f17b4ffeyJulr2eBKOi8Vn
- Attempt count (step 0 window): 2 of 10
- Total iteration: 4
- Timestamp (ISO): 2026-10-02T17:45:31Z
- Validated result: PATCH_READY (supported step-0 result; parent must inspect headers/hunks, verify freshness, apply once, remain at step 0, select CONTINUE)
- Pending user questions: none — owner reports no Agent-Recommended or Needs User Approval decisions remain for slice 02 (the AGENTS.md Environment correction remains a pre-existing, out-of-slice item per DEC-012)
- Decision references: DEC-006, DEC-008, DEC-011, DEC-012, DEC-013 (prior-attempt report also referenced)
- Intended disposition (before application): patch targets verified = resolved plan 02 + tracked master checklist only; freshness = target sha256 must equal preflight (plan 3e4eee8c7d11d6f007eaecd24171af2cadb282c4973406dd80deb331c93400ad, checklist ca5f7786e1f07e80053ceea7950a40fe4f4dcc6a7be84a9896e0b7d6b77dc6a4); git apply --check; git apply exactly once; index unchanged; classify deltas; clean scratch patch file; remain at step 0
- Checks performed before saving: pre-work increment persisted (iteration 4, total 4, step-0 window 2/10); prior attempt report carried as context; one mapped role agent invoked with the exact slice_arg; patch extracted from the returned response fence; per-hunk old/new counts verified consistent with headers (HUNK-COUNTS-OK, 428 lines); freshness verified (both targets byte-identical to preflight); git apply --check PASSED; git baseline unchanged before application
- Patch application: PENDING at save time (this report is immutable and saved before application)

## Exact complete returned response


```````
### Findings

- **Retry reconciliation.** The prior attempt's shell denial was environmental; this run had working shell access and the bundled helper executed. All of that run's findings were re-verified against current files and hold, with one citation corrected: the mechanical no-Pulumi-import guard's ownership is evidenced by the decomposition mapping recorded in `context.md` Risks / Gaps (and the plan's own Notes), not by DEC-008 (which covers provider-capability verification). Freshness was re-proven: target hashes match the prior baseline (`3e4eee8c…` plan, `ca5f7786…` checklist), and `git status` shows only this workflow's own untracked state files.
- **Stale cross-references fixed.** `Dependencies` listed "03, 04, 05, 07, 08, 10" and "08 (CI runs both tiers)". Sibling plans read this run: 03, 04, and 06 each require the test harness; 07 requires the test tiers (CI); 05 requires only 01; 08 requires 04 + 07. Slice 10 does not exist in this workstream's execution order. `Out: The validation CLI (slice 05)` corrected to slice 03 (`pnpm validate` is slice 03 scope per the checklist and plan 07's requirements).
- **Open question (a) — shared Vitest process: resolved Agent-Owned.** `TESTS.md` "The setMocks Caveat" states `setMocks` is module-global state and that Vitest isolates module registries per test file, so one shared run with default per-file isolation suffices; no projects/workspace split (KISS). 
- **Open question (b) — mechanical no-Pulumi guard: stays out.** The unit-tier rule remains a `TESTS.md` review rule (Pre-Write Checklist; Avoid These Common Mistakes); the mechanical guard for `src/model/` and `src/validation/` belongs to the account-targeting workstream — this slice must not expand into it.
- **Exemplars grounded.** The only pure production module is `src/provider-version.ts` (read this run; `src/index.ts` is an empty entrypoint), so the unit exemplar is `src/provider-version.unit.test.ts`, permanently enforcing slice 01's no-copied-literal contract. No resource constructor exists yet, so the mock exemplar is a harness fixture at `src/runtime/set-mocks.mock.test.ts` (runtime layer per `AGENTS.md` placement), explicitly relocatable/replaceable in slice 03.
- **Mechanism grounded by research this run.** Registry `vitest@5.0.3` (engines allow Node 24) matches the manifest's all-exact pin pattern; Vitest CLI file filters are documented substring matches on test-file paths and `vitest run` is the single-run mode, so `test:unit` = `vitest run unit.test`, `test:mock` = `vitest run mock.test`, `test` = `vitest run`. `test.include` is a config option resolved relative to root. `tsconfig.json` includes `src/**/*.ts` (exemplars get strict typechecking); vitest's required `vite` peer and pnpm's `verifyDepsBeforeRun: false` are recorded as verify-at-install conditions, not assumed.
- **Checklist stage move authorized.** `docs/development-flow.md` `/refine-plan` "should align the checklist item toward `Stage: Refined` when the slice is ready to implement"; plan-header `Status: Planned` is untouched (`/session-save` owns `Planned|In Progress|Implemented`). The "Initial Acceptance Shape" and "Notes for Refinement" sections are folded into Acceptance Criteria and Contracts with substance preserved.
- No `Agent-Recommended` or `Needs User Approval` decisions remain for slice 02. (Pre-existing, out of slice scope: the `AGENTS.md` § Environment correction still needs user approval per DEC-012.)

### Patch Validation

- Semantic review of both targets and the applicable readiness inventory passed (acceptance criteria map to the `AGENTS.md`/`TESTS.md` commands; no code check was claimed executed).
- Helper command run: `python3 /home/juanto/development/personal/ai-coding-agent-configs/config/opencode-v2/skills/refine-plan/scripts/generate-patch.py` with one JSON object on stdin (built by a python heredoc that read both current targets byte-exact and supplied the replacement texts from scratch copies; stdin delivered by file redirect instead of an inline heredoc to avoid hand-escaping a ~42 KB payload). Exit 0; stdout decoded as `patch` + `validation: "git apply --check passed against isolated snapshot copies"`.
- The helper's `git apply --check` ran against isolated snapshot copies, not repository targets. Post-command freshness check: target SHA-256s unchanged from baseline, tracked files and index clean, scratch directory removed. The parent's freshness/application check against current repository targets remains required and is not claimed here.

Patch authority: Authorized only; authorities: Agent-Owned; targets: sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-02-test-harness-two-tiers.md, sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md

### Proposed Patch (NOT APPLIED)

``````diff
diff --git a/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-02-test-harness-two-tiers.md b/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-02-test-harness-two-tiers.md
--- a/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-02-test-harness-two-tiers.md
+++ b/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-02-test-harness-two-tiers.md
@@ -2,7 +2,7 @@
 
 **Owner:** TBD
 **Status:** Planned
-**Last updated:** 2026-09-29
+**Last updated:** 2026-10-02
 **Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
 **Implemented on:** N/A
 
@@ -23,6 +23,9 @@
 - `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
   - Requirement 11 (two tiers, no live tier, no automatic org create/destroy)
 - Source Section 98
+- Governing engineering evidence: `AGENTS.md` (Build/Lint/Test Commands, Test
+  Placement), `TESTS.md` (Test Tiers, Repo Conventions, The setMocks Caveat),
+  `docs/decision-authority.md` (Agent-Owned fallback rule).
 
 ## Objective
 
@@ -33,29 +36,35 @@
 ## Scope
 
 - In:
-  - Vitest configuration selecting `*.unit.test.ts` and `*.mock.test.ts` by
-    tier, plus the combined `pnpm test`
-  - One exemplar pure unit test and one exemplar Pulumi `setMocks` test,
-    colocated next to the code they exercise
-  - Script wiring for both tiers
+  - Root `vitest.config.ts` admitting exactly the two tier suffixes
+    (`src/**/*.unit.test.ts`, `src/**/*.mock.test.ts`) and resolving the
+    `@/*` path alias
+  - One exemplar pure unit test and one exemplar Pulumi `setMocks` harness
+    test, colocated under `src/`
+  - Script wiring for `test:unit`, `test:mock`, and the combined `pnpm test`
 - Out:
   - The behavior-specific test suites of later slices
   - Any live-AWS tier (explicitly out of scope; `TESTS.md` forbids proposing one)
-  - The validation CLI (slice 05)
+  - The validation CLI (slice 03)
+  - The mechanical no-Pulumi-import guard for `src/model/` and
+    `src/validation/` (owned by the account-targeting workstream)
 
 ## System Components (Slice View)
 
-- Vitest configuration: tier-to-pattern mapping
+- Root `vitest.config.ts`: the tier include patterns plus the `@/*` alias
 - `package.json` scripts: `test:unit`, `test:mock`, `test`
-- Exemplar unit test: proves a pure function can be tested without Pulumi
-- Exemplar mock test: proves `setMocks` intercepts before any AWS call
+- Exemplar unit test: proves a pure module can be tested without Pulumi
+- Exemplar mock test: proves `setMocks` intercepts resource construction
+  without credentials
 
 ## System Flow (Slice Flow)
 
-1. Vitest config maps each tier to its file suffix.
-2. The unit script runs only pure tests; the mock script runs only mock tests.
-3. The mock tier installs `setMocks` and constructs a resource without
-   credentials.
+1. `vitest.config.ts` admits exactly the two tier suffixes and resolves
+   `@/*`.
+2. The unit script selects unit files by file-path substring; the mock script
+   does the same for mock files; `test` runs the whole include set.
+3. The mock exemplar installs `setMocks` and constructs a real `@pulumi/aws`
+   resource inline without credentials.
 4. Both tiers pass locally with no AWS environment.
 
 ## Inputs / Outputs (Known So Far)
@@ -68,117 +77,277 @@
 ## Dependencies
 
 - Requires:
-  - 01 (project skeleton, `typecheck` script)
+  - 01 (project skeleton, `typecheck` script, exact `@pulumi/aws` 7.48.0 pin)
 - Blocks / Enables:
-  - 03, 04, 05, 07, 08, 10 (all add tests)
-  - 08 (CI runs both tiers)
+  - 03 (requires the test harness for the unit tier)
+  - 04 (requires the test harness)
+  - 06 (requires the test harness)
+  - 07 (CI runs both tiers)
+- 05 and 08 do not depend on this slice directly: 05 requires only 01, and 08
+  requires 04 and 07.
 
 ## Open Questions
 
-- Is the mock tier run in the same Vitest process as unit tests, or a separate
-  project/workspace so `setMocks` module-global state cannot interact with unit
-  tests?
-- Should the unit tier enforce "no Pulumi import" mechanically, or leave it to
-  review?
+- None blocking this slice. Both former questions are resolved as Agent-Owned
+  decisions in Contracts: (1) one shared Vitest run with per-file module
+  isolation, no projects/workspace split; (2) the unit-tier no-Pulumi rule
+  stays a `TESTS.md` review rule; the mechanical guard belongs to the
+  account-targeting workstream.
 
 ## Risks / Unknowns
 
-- `setMocks` installs module-global runtime state; sharing a process with unit
-  tests could mask a purity violation.
-- An exemplar test written before any real module exists may not survive slice
-  03; plan to relocate or replace it.
+- `setMocks` installs module-global runtime state; a mock test file holds one
+  runtime configuration and must keep a single consistent assertion mode per
+  file (`TESTS.md` The setMocks Caveat).
+- An exemplar test written before any real module exists may not survive
+  slice 03; plan to relocate or replace it.
+- Vitest 5 declares `vite` as a required peer; the resolution path (pnpm
+  auto-installed peers) must be confirmed by `pnpm install` and a passing
+  tier run, not assumed.
 
 ## Implementation Plan
 
-1. Add Vitest and configure tier-to-suffix selection.
-2. Wire the three scripts.
-3. Add one exemplar unit test and one exemplar mock test.
-4. Verify both tiers run with no AWS environment.
-
-## Initial Acceptance Shape
-
-1. `pnpm test:unit` runs only `*.unit.test.ts` and passes.
-2. `pnpm test:mock` runs only `*.mock.test.ts` and passes.
-3. Both tiers pass with no AWS credentials configured.
-
-## Notes for Refinement
-
-- The "unit tests must not import Pulumi" rule is a `TESTS.md` requirement; a
-  mechanical check belongs in refine-plan if cheap, otherwise note it as a
-  review rule.
-- Purity-rule enforcement for `src/model/` and `src/validation/` is mapped to
-  `aws-organization-as-code-account-targeting` in the decomposition index, not
-  here. Do not expand this slice into that contract.
+1. Add the exact-pinned `vitest` devDependency, run `pnpm install`, and rerun
+   `pnpm typecheck` so the provider guard revalidates the regenerated
+   lockfile.
+2. Add the root `vitest.config.ts` (tier include patterns, `@/*` alias) and
+   wire the three package scripts.
+3. Add the two exemplar tests per Locked Field Definitions.
+4. Verify both tiers pass with no AWS environment and that each tier script
+   runs only its suffix.
 
 ## Contracts / Decisions Locked For This Slice
 
-- User-approved: Vitest with `pnpm test:unit` and `pnpm test:mock`; no live tier
-  in ordinary CI (PRD DEC-006, `TESTS.md`).
+- User-approved: Vitest with `pnpm test:unit` and `pnpm test:mock`; no live
+  tier in ordinary CI (`decision-log.md` DEC-006, 2026-09-29; `TESTS.md`).
 - Agent-Owned: colocated test files, no global `test/` directory
-  (`TESTS.md`).
+  (`AGENTS.md` Test Placement; `TESTS.md` Repo Conventions).
+- Agent-Owned: one shared Vitest run for both tiers — no Vitest projects or
+  workspace split. `TESTS.md` (The setMocks Caveat) records that `setMocks`
+  is module-global per test file and that Vitest isolates module registries
+  per test file, so the default per-file isolation is sufficient
+  (`AGENTS.md` KISS/YAGNI).
+- Agent-Owned: the unit-tier "no Pulumi import" rule stays a `TESTS.md`
+  review rule (Pre-Write Checklist; Avoid These Common Mistakes). The
+  mechanical no-Pulumi-import guard for `src/model/` and `src/validation/`
+  is owned by the account-targeting workstream (`context.md` Risks / Gaps
+  decomposition mapping), not by this slice.
+- Agent-Owned: `vitest` is added as an exact-pinned devDependency, matching
+  the manifest's all-exact version pattern. Registry read 2026-10-02
+  (`https://registry.npmjs.org/vitest/latest`) returned `5.0.3` with
+  `engines.node` `^22.12.0 || ^24.0.0 || >=26.0.0`; select that exact
+  version, not a floating range (slice 01 precedent for pnpm). Its required
+  `vite` peer is resolved by pnpm's auto-installed peers; verify at install.
+- Agent-Owned: root `vitest.config.ts` with `test.include` limited to the two
+  tier suffixes and `resolve.alias` mapping `@` to `./src`, matching
+  `tsconfig.json` paths (`tsconfig.json` read this run; `TESTS.md` mock
+  example imports via `@/`). `tsconfig.json` is unchanged; Vitest loads the
+  config itself, so it is not part of `pnpm typecheck`.
+- Agent-Owned: scripts `test:unit` = `vitest run unit.test`, `test:mock` =
+  `vitest run mock.test`, `test` = `vitest run`. CLI file filters are
+  substring matches on test-file paths (Vitest CLI and filtering guides,
+  read 2026-10-02) and `vitest run` is the single-run mode; this matches
+  `AGENTS.md`'s positional-filter single-test convention.
+- Agent-Owned: exemplar placement and shape (Locked Field Definitions).
+- Agent-Owned: the checklist item moves `Stub` -> `Refined` with Validation
+  filled in the same patch (`docs/development-flow.md` /refine-plan).
 
 ## Architecture Decisions For This Slice
 
-- Reuse pattern: `TESTS.md` test tiers, naming, and mock pattern.
-- Layer ownership: test infrastructure only.
-- Code placement: Vitest config at repo root; tests colocated in `src/`.
-- Integration boundary: package scripts.
+- Reuse pattern: `TESTS.md` test tiers, naming, describe style, and mock
+  pattern; `AGENTS.md` Build/Lint/Test command names.
+- Layer ownership: test infrastructure only; no production logic is added or
+  modified.
+- Code placement: Vitest config at repo root; tests colocated in `src/`. The
+  mock exemplar sits in `src/runtime/`, the Pulumi runtime-model layer,
+  because it exercises the mock runtime path; it is a relocatable harness
+  fixture, not a capability module.
+- Integration boundary: package scripts; no CI wiring (slice 07).
 - Non-goals: no new production logic, no live tier, no snapshot of a
-  nonexistent module.
+  nonexistent module, no Vitest projects/workspace split, no `tsconfig.json`
+  change, no lint/format setup (slice 01 explicitly deferred it).
 
 ## Contract Inventory
 
-- Tier scripts and their file-selection rules.
+- Tier scripts and their file-selection rules (substring tier filter over
+  the two-suffix include universe).
+- Root `vitest.config.ts`: `test.include` patterns and the `@/*` alias.
+- Exemplar test files and the behavior each proves.
 
 ## Schema Ownership
 
-- TBD during refine-plan.
+- Not applicable: this slice introduces no persistent, wire, or configuration
+  schema. The only contract surface is the package scripts and Vitest
+  configuration above.
 
 ## Locked Field Definitions
 
 ### Test tier selection
 
-- `test:unit`: `*.unit.test.ts` only.
-- `test:mock`: `*.mock.test.ts` only.
+- `test:unit`: `*.unit.test.ts` only — `vitest run unit.test`.
+- `test:mock`: `*.mock.test.ts` only — `vitest run mock.test`.
+- `test`: both tiers in one run — `vitest run`.
+
+### Vitest configuration (root `vitest.config.ts`)
+
+- `test.include`: `['src/**/*.unit.test.ts', 'src/**/*.mock.test.ts']`
+  (resolved relative to the repo root; nothing else is a test file for this
+  harness).
+- `resolve.alias`: `@` -> `./src`, matching `tsconfig.json` `paths`.
+- Everything else stays at Vitest defaults (node environment, default pool,
+  per-file isolation).
+
+### Package manifest
+
+- `devDependencies.vitest`: exact `5.0.3` (registry read 2026-10-02); no
+  ranges, matching the manifest's all-exact pattern.
+- `scripts`: the three commands above, added alongside the existing
+  `typecheck` script; the `@pulumi/aws` pin is untouched.
+
+### Exemplar tests
+
+- `src/provider-version.unit.test.ts`: colocated with the only pure
+  production module. Imports `PINNED_AWS_VERSION` via `@/provider-version`
+  (proving the harness resolves the path alias) and the root `package.json`
+  via `resolveJsonModule`; asserts the export is a nonempty string equal to
+  `dependencies['@pulumi/aws']` — slice 01's no-copied-literal contract,
+  now permanently enforced. Imports no Pulumi module and makes no AWS call.
+- `src/runtime/set-mocks.mock.test.ts`: harness exemplar with no production
+  module yet. `beforeEach` installs `pulumi.runtime.setMocks` per the
+  `TESTS.md` Mock Test Pattern (recorder array, project `organization`,
+  stack `test`, preview `false`). One test constructs a minimal real
+  `@pulumi/aws` Organizations resource inline (default
+  `aws.organizations.Organization` with `featureSet: 'ALL'`, the
+  `AGENTS.md` example value), flushes outputs, and asserts the captured
+  resource's type token (`aws:organizations/organization:Organization`,
+  following the `TESTS.md` token convention), logical name, and that input.
+  The file asserts only that resources were created; no credentials, no AWS
+  calls. Slice 03 may relocate or replace this file when real resource
+  constructors exist; the harness configuration stays.
 
 ## Type / Schema Touchpoints
 
-- TBD during refine-plan.
+- `package.json`: `devDependencies` gains `vitest`; `scripts` gains
+  `test:unit`, `test:mock`, `test`. No dependency type changes.
+- `vitest.config.ts` (new): the `test` and `resolve` blocks above.
+- No `src/types/` changes; no Pulumi runtime types are introduced.
 
 ## Mapping Boundaries
 
-- TBD during refine-plan.
+- Tier mapping: file suffix -> tier script (`*.unit.test.ts` ->
+  `test:unit`, `*.mock.test.ts` -> `test:mock`); the suffix is the only
+  tier signal.
+- Alias mapping: `@/*` resolves to `./src/*` in both `tsconfig.json`
+  (typecheck) and `vitest.config.ts` (test runtime); keep them consistent.
+- Mock state boundary: `setMocks` state is scoped to one test file; a file
+  holds exactly one runtime configuration (`TESTS.md` The setMocks Caveat).
 
 ## Invariants
 
 - Neither tier requires AWS credentials.
 - A test file's suffix determines its tier.
+- The harness recognizes only the two `TESTS.md` suffixes; no other test
+  naming is admitted.
+- No live-AWS tier is introduced, and no script creates or destroys AWS
+  resources.
 
 ## Compatibility / Migration Notes
 
-- TBD during refine-plan.
+- Adding the devDependency regenerates `pnpm-lock.yaml`; rerun
+  `pnpm install` and then `pnpm typecheck` so the provider guard revalidates
+  the `@pulumi/aws` 7.48.0 pin and single resolution (`decision-log.md`
+  DEC-011).
+- `AGENTS.md` Build/Lint/Test lists `pnpm test:unit`, `pnpm test:mock`, and
+  `pnpm test`; this slice makes those three entries real. `AGENTS.md` itself
+  is not edited (approval-gated documentation; `decision-log.md` DEC-012).
+- The empty `pulumi preview` stays deferred and unrun (slice 05,
+  `decision-log.md` DEC-013); `src/index.ts` remains empty.
+- The mock exemplar is a fixture: slice 03 replaces or relocates it when real
+  resource constructors exist. The unit exemplar guards a slice 01 contract
+  and is expected to persist.
 
 ## Likely File Touchpoints
 
-- Filled by refine-plan.
+- `package.json` (devDependency plus the three scripts)
+- `pnpm-lock.yaml` (regenerated by `pnpm install`)
+- `vitest.config.ts` (new, repo root)
+- `src/provider-version.unit.test.ts` (new)
+- `src/runtime/set-mocks.mock.test.ts` (new harness exemplar; relocatable in
+  slice 03)
+- Only if `pnpm install` proves a required lifecycle script is blocked:
+  `pnpm-workspace.yaml` `allowBuilds` (minimal entry with a recorded reason;
+  otherwise unchanged)
+- Unchanged: `src/provider-version.ts`, `scripts/check-provider-version.mjs`,
+  `tsconfig.json`, `Pulumi.yaml`, `src/index.ts`
 
 ## Implementation Notes
 
-- Filled by refine-plan.
+- `pnpm-workspace.yaml` sets `verifyDepsBeforeRun: false`, so `pnpm run`
+  never installs first: run `pnpm install` explicitly before the tier
+  scripts (repo convention; keeps the provider guard meaningful).
+- `pnpm typecheck` compiles `src/**/*.ts`, so both exemplars are strict-mode
+  typechecked even though `vitest.config.ts` is outside that include.
+- Single-test invocations keep working after this slice:
+  `pnpm vitest run src/provider-version.unit.test.ts` (positional filter)
+  and `pnpm vitest run -t "<name>"` (`AGENTS.md` Running a Single Test).
+- Do not add coverage tooling, custom reporters, or watch-mode scripts; the
+  PRD and `TESTS.md` require none (YAGNI).
 
 ## Verification
 
-- Automated:
-  - Filled by refine-plan.
-- Manual:
-  - Filled by refine-plan.
+Automated (commands from `AGENTS.md` Build/Lint/Test Commands and
+Environment; toolchain per `decision-log.md` DEC-012):
+
+- Before pnpm: `eval "$(fnm env --use-on-cd --shell bash)"`.
+- `pnpm install`: adds the exact vitest pin and regenerates the lockfile.
+- `pnpm typecheck`: the guard still reports `@pulumi/aws` pinned to `7.48.0`
+  with a single resolution; strict compilation covers both exemplars.
+- `pnpm test:unit`: runs only `*.unit.test.ts` — the runner reports exactly
+  the unit exemplar file and passes.
+- `pnpm test:mock`: runs only `*.mock.test.ts` — the runner reports exactly
+  the mock exemplar file and passes, proving `setMocks` intercepted the
+  resource construction.
+- `pnpm test`: both tiers in one run, passing.
+- Credential-free check: run the two tier scripts in a shell with no AWS
+  credentials configured (no `AWS_PROFILE`, no `AWS_*` environment); both
+  must pass (`TESTS.md` Credentials; acceptance criteria 1-3).
+
+Manual:
+
+- Inspect the runner output to confirm each tier script's file selection is
+  exclusive to its suffix.
+- Inspect `package.json` and `vitest.config.ts` against Locked Field
+  Definitions.
 
 ## Edge Cases
 
-- Filled by refine-plan.
+- A file whose path matched both tier filters would run in both tiers;
+  `TESTS.md` naming (`<module>.unit.test.ts` | `<module>.mock.test.ts`)
+  forbids double suffixes, and the acceptance checks make any violation
+  visible in the runner output.
+- A stray `*.test.ts` or `*.spec.ts` file is not picked up by the harness
+  (explicit `test.include`); that is intended convention enforcement, not
+  silent loss.
+- If `pnpm install` cannot resolve vitest's required `vite` peer
+  (auto-install disabled), declare `vite` explicitly as a devDependency
+  within the peer range instead of weakening the pin.
+- If install reports a blocked lifecycle script needed by vitest or vite,
+  evaluate it and, only if genuinely required, add the minimal
+  `allowBuilds` entry with a recorded reason.
+- A future Vitest major upgrade is a dependency change: exact pin, lockfile
+  regeneration, and `pnpm typecheck` rerun; never a floating range.
 
 ## Acceptance Criteria
 
-1. Filled by refine-plan.
-2. Filled by refine-plan.
-3. Filled by refine-plan.
+1. `pnpm test:unit` runs only `*.unit.test.ts` files and passes with no AWS
+   credentials configured.
+2. `pnpm test:mock` runs only `*.mock.test.ts` files and passes with no AWS
+   credentials configured, proving `setMocks` intercepts resource
+   construction before any AWS call.
+3. `pnpm test` runs both tiers in one invocation and passes.
+4. `pnpm typecheck` passes after the dependency and lockfile change, with
+   `@pulumi/aws` still exactly `7.48.0` and a single resolution (guard
+   output).
+5. The unit exemplar imports no Pulumi module and asserts the
+   manifest-derived version export; the mock exemplar installs `setMocks`
+   and asserts the captured resource without credentials.
diff --git a/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md b/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md
--- a/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md
+++ b/sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md
@@ -11,7 +11,7 @@
 
 ## Now
 - [ ] Test harness with the two tiers
-  - Stage: `Stub`
+  - Stage: `Refined`
   - Scope: Vitest, `test:unit` / `test:mock` / `test`, one exemplar per tier
   - Depends on: `01-project-scaffold-and-provider-pin` (Done)
   - Acceptance:
@@ -19,7 +19,9 @@
           only `*.mock.test.ts`
     - [ ] Both tiers pass with no AWS credentials
     - [ ] No live-AWS tier is introduced
-  - Validation: TBD during refine-plan
+  - Validation: `pnpm test:unit`, `pnpm test:mock`, and `pnpm test` pass with
+    no AWS credentials; `pnpm typecheck` rerun after the devDependency and
+    lockfile change (`decision-log.md` DEC-011)
   - Links: `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-02-test-harness-two-tiers.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#api-contracts-high-level`
 
 ## Next
``````

WORKFLOW_RESULT: PATCH_READY
```````
