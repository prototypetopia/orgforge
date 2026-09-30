# AWS Organization as Code Foundation and Operations: Project Scaffold and Provider Pin

**Owner:** TBD
**Status:** Implemented
**Last updated:** 2026-09-30
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** 2026-09-30

---

## Why This Slice Exists

- Every other workstream assumes a strict TypeScript + Pulumi project with a
  pinned provider. The scaffold now exists (`package.json`, `Pulumi.yaml`,
  `src/index.ts`); preserve it. Attempt 11 reports prior implementation checks,
  not checks rerun by this refinement (see Verification).
- The provider version must be fixed before any sibling can derive a type union
  or a limit from it, so pinning comes first.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 1 (scaffold, pinned `@pulumi/aws`, typecheck passes)
  - Requirement 2 (pinned-provider policy and version record)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#acceptance-criteria`
  - Acceptance 1 (typecheck passes, provider version pinned and recorded)
- Source Sections 4, 5, 7, 105
- Governing engineering evidence: `AGENTS.md` (Provider Version Policy,
  Directory Structure, Environment, Build/Lint/Test Commands), `TESTS.md`
  (Test Tiers), and `docs/decision-authority.md` (Agent-Owned fallback rule).
- Scope correction: `decision-log.md#DEC-008` (ID DEC-008) leaves capability
  verification with siblings; no real AWS Organization is needed to approve
  this empty scaffold's pin.

## Objective

- A `pnpm` TypeScript project in strict mode with a Pulumi program entrypoint
  and approved `@pulumi/aws` 7.48.0 resolved in `pnpm-lock.yaml`, where
  `pnpm typecheck` checks provider consistency and passes.

## Scope

- In:
  - Root manifest, lockfile, strict TypeScript configuration and path alias
  - Node 24 and the registry-verified exact pnpm release
  - `@pulumi/pulumi`, `@pulumi/aws`, and TypeScript runtime dependencies
  - Empty `src/index.ts`, `Pulumi.yaml`, and `config/.gitkeep`
  - Root manifest as the provider version record, a small readable adapter,
    and a lockfile-consistency guard integrated into `pnpm typecheck`
- Out:
  - AWS resource construction, provider invokes, and sibling capability checks
  - AWS SDK clients until an owning capability demonstrates a provider gap
    (`AGENTS.md` Escape hatch and KISS/YAGNI; `decision-log.md` DEC-001/008)
  - Layer subdirectories and validation framework (slice 03)
  - Vitest, test scripts and exemplars (slice 02); lint/format setup and deploy
    scripts are not invented as no-op placeholders
  - Backend and authentication selection (slice 05), naming (slice 06),
    safe deploy/CI (slice 07), and operations documentation (slice 08)

## System Components (Slice View)

- `package.json`: manifest and canonical exact provider-version record
- `pnpm-lock.yaml`: installation resolution and consistency evidence
- `tsconfig.json`: strictness, JSON imports, and the `@/*` path alias
- `Pulumi.yaml`: Node.js runtime; root manifest points to `src/index.ts`
- `src/index.ts`: empty program; no resource construction or AWS discovery
- `src/provider-version.ts`: reads manifest version without a copied literal
- `scripts/check-provider-version.mjs`: manifest/lockfile guard, no AWS calls

## System Flow (Slice Flow)

1. Use Node 24 and the selected pnpm; initialize fnm before running pnpm.
2. `pnpm install` resolves the exact provider and writes `pnpm-lock.yaml`.
3. `pnpm typecheck` runs the consistency guard, then `tsc --noEmit`; errors
   return nonzero and identify the offending manifest or lockfile entry.
4. Deferred to slice 05 by explicit approval: with an operator-selected backend
   and stack, `pulumi preview` must load the empty TypeScript entrypoint and
   propose no AWS resources. This check remains unrun, not satisfied.

## Inputs / Outputs (Known So Far)

- Inputs: approved AWS provider 7.48.0, Node 24, pnpm 12.8.1.
- Outputs: runnable scaffold, exact manifest/lockfile pin, and exported
  `PINNED_AWS_VERSION: string` derived from the root manifest.
- No organization schema, AWS IDs, credentials, or secrets are introduced.

## Dependencies

- Requires: None.
- Enables: slices 02-08 in this checklist and the sibling workstreams.
- Preview needs an installed Pulumi CLI plus an operator-selected backend and
  stack; this slice does not select a backend or create an AWS Organization.
  Its approved deferral to slice 05 is not a new prerequisite for slice 01.

## Open Questions

- None blocking this slice after the explicit preview-deferral approval below.
  Capability surfaces remain sibling-owned under DEC-008; backend and
  authentication choices remain with slice 05 and are not approved here.

## Risks / Unknowns

- Approval of 7.48.0 is not proof that every sibling capability is supported.
- Future provider upgrades must update manifest and lockfile together.
- pnpm 12 lockfile layout must be inspected after installation; do not reuse
  a guessed pnpm 10 parser or rely on raw substring/version-count matching.
- Registry metadata proves availability and engine ranges, not a successful
  local install or Pulumi preview; installation remains an implementation
  check, and the required empty preview remains unrun until slice 05.

## Implementation Plan

1. Create the manifest, `.node-version`, and strict `tsconfig.json`.
2. Install Pulumi dependencies and development tools; commit the lockfile.
3. Implement the manifest reader and structural lockfile guard; wire the
   guard before `tsc --noEmit` in the `typecheck` script.
4. Add `Pulumi.yaml`, the empty entrypoint, and `config/.gitkeep`.
5. Run installation/typecheck and exercise consistency failures in isolated
   copies. Preserve the existing scaffold; record empty preview as unrun and
   deferred to slice 05 under the explicit approval below.

## Contracts / Decisions Locked For This Slice

- User-Approved: exact initial `@pulumi/aws` pin is `7.48.0`, not whatever is
  latest at implementation. Source: explicit message in parent session
  `ses_f106b8386ffeSoqXdekCtvAh41`, durably captured in
  `aws-organization-as-code-foundation-operations-01-workflow.json`,
  `approval_answers[0]` (answer: `@pulumi/aws 7.48.0 approved`). Registry
  evidence read: `https://registry.npmjs.org/@pulumi%2faws/7.48.0`.
- User-Approved: root `package.json` exact dependency version is the readable
  record, with a lockfile-consistency check, not a separately generated
  constant. Same parent session and workflow file, `approval_answers[1]`
  (`yes` to the exact version-record approval question).
- User-Approved: Node 24 and latest published pnpm. Same parent session and
  workflow file, `approval_answers[2]`. Node 24 satisfies `AGENTS.md` Node
  22+; this explicit selection overrides its pnpm 10.x baseline for this
  scaffold. Registry `https://registry.npmjs.org/pnpm/latest`, read on
  2026-09-29, returned version `12.8.1` and Node engine `>=18.*`; select
  `pnpm@12.8.1`, not a floating `latest`. No AGENTS.md edit is part of this patch.
- User-Approved: defer the required empty Pulumi preview to slice 05, keeping
  it recorded as unrun until then. Source: explicit user message in session
  `ses_f102e0a33ffeQyjNOuu6HEfvIG`, received after the prior owner returned;
  question: 'Explicitly approve deferring the required empty Pulumi preview to
  slice 05, keeping it recorded as unrun until then?'; answer verbatim:
  'Defer preview to slice 05'. Approval handoff recorded at
  `2026-09-30T01:58:18.172465+00:00` (`recorded_in: null` at handoff);
  corroboration: `workflow-reports/aws-organization-as-code-foundation-operations-01-workflow-attempt-12-ab3d58e3d76c458fa0bac60f9dccbacc.md`,
  Pending questions. This changes timing only: no backend, stack, new version,
  or preview waiver is approved, and mandatory preview before applying
  organization changes remains intact (`AGENTS.md` Preview Is Mandatory).
- Agent-Owned: strict TypeScript and `@/*` -> `./src/*`, pnpm-only commands,
  lockfile-governed provider behavior (`AGENTS.md`; DEC-002/006).
- Agent-Owned: use the direct TypeScript Node.js runtime via `ts-node`, not a
  generated build directory. Root `main` points to `src/index.ts`; CommonJS
  TypeScript output for runtime loading and `noEmit` for typecheck. Local,
  reversible scaffold choice under `docs/decision-authority.md`; Pulumi
  registry metadata read at `https://registry.npmjs.org/@pulumi%2fpulumi/latest`
  identifies 3.265.0, Node `>=22`, and optional peer ranges `ts-node >=7.0.1 <12`
  and `typescript >=3.8.3 <7`. Resolve tools within those ranges on Node 24.
- Agent-Owned: start with `@pulumi/pulumi` 3.265.0, compatible with the AWS
  package's declared `@pulumi/pulumi ^3.142.0`; lock resolved dependencies.
  Availability/ranges from the two registry responses above; successful
  operation remains an implementation check, not an asserted result.
- Agent-Owned: defer unused SDK clients and unimplemented command placeholders
  under `AGENTS.md` KISS/YAGNI and SDK containment. This does not remove SDK v3
  from the approved stack or authorize any sibling's alternative SDK.

## Architecture Decisions For This Slice

- Foundation owns project metadata, reader and guard; no capability layer.
- New adapter/guard paths below are Agent-Owned local, reversible scaffolding
  under `docs/decision-authority.md`, not a new runtime-model abstraction.
- Use a direct YAML parser dependency for the guard, not parsing via regex or
  an undeclared transitive package. `js-yaml` is already evidenced by Pulumi
  3.265.0 registry dependencies; declare it directly when used.
- TypeScript path aliases are compile-time scaffolding here; empty runtime
  code does not assume ts-node rewrites aliases. No OU alias registry.

## Contract Inventory / Schema Ownership

- Root manifest owns the version record. `src/provider-version.ts` imports
  the root JSON and exports `PINNED_AWS_VERSION` from
  `dependencies['@pulumi/aws']`; it contains no independently maintained pin.
- `scripts/check-provider-version.mjs` owns consistency enforcement, invoked
  by `pnpm typecheck`. It reads root-relative files independent of caller cwd.
- pnpm owns generated lockfile structure; inspect its actual 12.8.1 output
  before implementing traversal. No handwritten lockfile or framework schema.

## Locked Field Definitions

- Root `package.json`: `private: true`, `main: 'src/index.ts'`,
  `engines.node: '>=24 <25'`, `packageManager: 'pnpm@12.8.1'`,
  `dependencies['@pulumi/aws']: '7.48.0'`,
  `dependencies['@pulumi/pulumi']: '3.265.0'`; required strings, no ranges for
  these two direct Pulumi dependencies. Node range locally encodes user choice.
- `scripts.typecheck`: guard followed by `tsc --noEmit`, stop on guard failure.
- `.node-version`: `24`; fnm initialization remains required before pnpm.
- `tsconfig.json`: `strict: true`, `noEmit: true`, `resolveJsonModule: true`,
  CommonJS module output, `baseUrl: '.'`, `paths: { '@/*': ['./src/*'] }`;
  include source/config TypeScript. Use Node 24 type definitions.
- `Pulumi.yaml`: project name `orgforge` (local scaffold label), runtime
  `nodejs` with TypeScript enabled; do not set a backend or stack secrets.
- Other dependency versions are resolved within compatible published ranges
  and recorded in the lockfile during implementation; no sibling unions here.

## Mapping Boundaries / Invariants

- JSON manifest -> exported string; lockfile -> structurally parsed versions.
  Neither mapping imports Pulumi or contacts AWS.
- Manifest pin must be a nonempty exact version string; reject missing fields,
  ranges, tags, aliases or workspace/file references.
- Root importer specifier and resolution must match that exact pin. All AWS
  package entries must resolve to that single version, including peer-suffixed
  entries. Missing, malformed or unsupported lockfile layouts fail explicitly.
- Error output names paths, package and mismatch, but never prints credential
  environment variables or secret configuration. No silent fallback version.

## Compatibility / Migration Notes

- Greenfield: no state migration or resource import/replacement.
- Provider upgrades remain reviewed infrastructure changes (DEC-002); the
  guard must compare sources, not hardcode 7.48.0 as an eternal allowlist.
- Later slices add scripts and layer directories without duplicating this pin.

## Likely File Touchpoints

- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `.node-version`, `.gitignore`
- `Pulumi.yaml`, `src/index.ts`, `config/.gitkeep`
- `src/provider-version.ts`, `scripts/check-provider-version.mjs`
- No decision-log, workflow-state, AGENTS.md or TESTS.md implementation edits.

## Implementation Notes

- Agent-Owned scaffold hygiene: preserve root `.gitignore` with `node_modules/`
  ignored and `pnpm-lock.yaml` trackable; the ignore file now exists. This is a
  local, reversible, testable fallback under `docs/decision-authority.md`
  (Agent-Owned fallback rule), consistent with `AGENTS.md` KISS/YAGNI and
  lockfile-governed provider policy; it does not choose Pulumi state or
  stack-config ignore rules for slice 05.
- Empty entrypoint may export an empty module; do not add sample AWS resources
  or discovery just to exercise the provider.
- Reader stays dependency-metadata-only; no copied generated constant.
- Use minimal direct dependencies for TypeScript/ts-node/Node typings and the
  guard parser. Do not configure Vitest before slice 02.

## Verification

Commands below come from `AGENTS.md` Build/Lint/Test Commands and Environment;
`TESTS.md` Test Tiers governs later colocated tests. This slice uses CLI checks
and isolated fixture copies until slice 02 establishes Vitest.

Executed evidence: `workflow-reports/aws-organization-as-code-foundation-operations-01-workflow-attempt-22-9cb6ca5278bc474589540f21684c3cdc.md`
(step 7, `implement-slice-tests`) reports `pnpm install --frozen-lockfile` twice,
`pnpm typecheck` passing, the reader evaluating `7.48.0` from root JSON, and 25
isolated CLI scenarios covering manifest, lockfile-layout, root-importer, and
provider-resolution failures plus a peer-suffix positive case. Attempt 11
(`...-attempt-11-7a6b5e266ba64ec6b2b746d53a007055.md`) reports the earlier
installation and fixture run. Both record preview as unrun because Pulumi CLI
and operator backend/stack prerequisites were absent. Attempt 23
(`...-attempt-23-b54c04a720bc43a2bf0e9e919c581350.md`) audited coverage as
`CLEAN`; its per-category fixture counts in attempt 22 do not sum to the claimed
total, so coverage rests on the explicitly listed scenarios.
`pnpm typecheck` was rerun independently on 2026-09-30 (Node 24.13.0,
pnpm 12.8.1) and exited 0 with the guard reporting pin `7.48.0` resolved to
`7.48.0`. No Vitest tier exists here (slice 02 owns it).

- Before pnpm: `eval "$(fnm env --use-on-cd --shell bash)"`.
- `pnpm install`: on Node 24/pnpm 12.8.1 succeeds, produces the committed
  lockfile, and repeat installation does not change the provider pin. Inspect
  manifest/lockfile structurally to confirm exact direct and resolved versions.
  Inspect `.gitignore` and working-tree status after installation: installed
  `node_modules/` contents stay ignored while `pnpm-lock.yaml` stays trackable.
- `pnpm typecheck`: valid scaffold passes guard and strict compilation,
  including manifest reader, with no AWS credentials required.
- In isolated copies, run the same `pnpm typecheck` after each mutation:
  missing/ranged manifest pin, missing lockfile, malformed YAML, root importer
  mismatch, and an additional different AWS version. Each fails nonzero before
  compilation with actionable path/package diagnostics; restore only fixtures.
- Check reader imports root JSON and yields the matching string, with no copied
  literal or Pulumi imports; strict compilation covers its exported type.
- Deferred to slice 05 (User-Approved above), currently unrun: `pulumi preview`
  with an operator-provided backend/stack must load empty config successfully
  and propose zero AWS/provider resources. Pulumi's own stack bookkeeping is
  not an AWS resource. No `pulumi up` or live org test required by this check.
- This approved timing change removes empty preview as a slice 01 completion
  gate, not as a verification obligation. Keep it explicitly unrun until
  executed in slice 05; do not mark preview acceptance satisfied or invent a
  backend/credential strategy. Preview remains mandatory before any
  organization changes are applied (`AGENTS.md` Preview Is Mandatory).

## Edge Cases

- Stale record/resolution, multiple versions or unsupported lockfile layout:
  fail the guard rather than select the first matching package.
- Peer-suffixed entries sharing one version are not multiple provider versions.
- Wrong toolchain: diagnose manifest engine/package-manager mismatch; do not
  regenerate the lockfile using another pnpm major to make checks pass.
- Backend login/stack absence is a preview prerequisite failure, not evidence
  of provider incompatibility or permission to create AWS infrastructure.

## Acceptance Criteria

1. Node 24/pnpm 12.8.1 scaffold installs with exact AWS 7.48.0 in manifest,
   matching root lockfile resolution and one distinct resolved AWS version
   (`pnpm install` plus structural inspection).
2. Strict TypeScript, path alias and root-JSON reader compile, and valid
   provider consistency passes without AWS calls (`pnpm typecheck`).
3. Missing/invalid/mismatched records and multiple resolved versions fail
   nonzero with actionable diagnostics (isolated `pnpm typecheck` scenarios).
4. Deferred to slice 05 by explicit user approval; unrun, not satisfied and
   not a slice 01 completion gate: empty TypeScript Pulumi program previews
   without AWS resource construction (`pulumi preview` with operator-provided
   prerequisites). Preserve this obligation for slice 05.
5. Shared version export derives solely from manifest; provider upgrade
   consistency is checked without a duplicate pin or sibling capability claims
   (reader/guard inspection and criteria 1-3).
