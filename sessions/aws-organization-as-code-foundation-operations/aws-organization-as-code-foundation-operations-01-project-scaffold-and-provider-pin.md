# AWS Organization as Code Foundation and Operations: Project Scaffold and Provider Pin

**Owner:** TBD
**Status:** Planned
**Last updated:** 2026-09-29
**Tracked by:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`
**Implemented on:** N/A

---

## Why This Slice Exists

- Every other workstream assumes a strict TypeScript + Pulumi project with a
  pinned provider. Nothing exists in this repo yet: there is no `package.json`,
  no `Pulumi.yaml`, no `src/`.
- The provider version must be fixed before any sibling can derive a type union
  or a limit from it, so pinning comes first.

## PRD Traceability

- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#requirements`
  - Requirement 1 (scaffold, pinned `@pulumi/aws`, typecheck passes)
  - Requirement 2 (pinned-provider policy and version record)
- `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md#acceptance-criteria`
  - Acceptance 1 (typecheck passes, provider version pinned and recorded)
- Source Sections 4, 5, 7, 105

## Objective

- A `pnpm` TypeScript project in strict mode with a Pulumi program entrypoint
  and an exact `@pulumi/aws` version resolved in `pnpm-lock.yaml`, where
  `pnpm typecheck` passes.

## Scope

- In:
  - `package.json` with `pnpm` as the package manager and the scripts the other
    slices will fill in
  - `tsconfig.json` in strict mode with the `@/*` -> `./src/*` path alias
  - `Pulumi.yaml` declaring the project and its runtime entrypoint
  - Installation and lockfile resolution of `@pulumi/pulumi`, `@pulumi/aws`, and
    AWS SDK v3 as a declared dependency for later gap-filling use
  - A minimal `src/index.ts` and `config/` placeholder sufficient for
    `pulumi preview` to run against an empty configuration
  - Recording the resolved `@pulumi/aws` version where the framework can read
    it at runtime
- Out:
  - Any AWS resource construction (owned by sibling workstreams)
  - The `src/` layer subdirectories beyond the entrypoint (slice 03)
  - Test harness configuration (slice 02)
  - Pulumi backend and stack-state decisions (slice 06)

## System Components (Slice View)

- `package.json`: scripts and dependency manifest
- `pnpm-lock.yaml`: the pinned provider version, the enforcement point for the
  provider policy
- `tsconfig.json`: strictness and the `@/*` path alias
- `Pulumi.yaml`: Pulumi project metadata and runtime entrypoint
- `src/index.ts`: minimal program entrypoint
- Pinned-provider version record: single readable location for the resolved
  `@pulumi/aws` version

## System Flow (Slice Flow)

1. `pnpm install` resolves `@pulumi/aws` to one exact version and writes
   `pnpm-lock.yaml`.
2. The resolved version is recorded in one module the framework can read.
3. `Pulumi.yaml` and `src/index.ts` make the checkout runnable by Pulumi.
4. `pnpm typecheck` passes with no errors.

## Inputs / Outputs (Known So Far)

- Inputs:
  - The exact `@pulumi/aws` version to pin (TBD: selected by this slice)
  - Node 22+ and pnpm 10.x (AGENTS.md)
- Outputs:
  - Runnable Pulumi program skeleton
  - Lockfile with exactly one resolved `@pulumi/aws` version
  - Recorded version string for downstream error messages

## Dependencies

- Requires:
  - None
- Blocks / Enables:
  - 02, 03, 04, 05, 06, 07, 08, 09, 10 (all consume the project skeleton)
  - All sibling workstreams, which derive unions and limits from the pin

## Open Questions

- Which exact `@pulumi/aws` version is selected, and what are its supported
  Organizations policy types, template size limits, StackSet dependency count,
  and OU-target limit? (PRD Open Question 1)
- Does recording the version mean a generated constant, a build-time injected
  constant, or a runtime lookup of `package.json`?
- Is the Pulumi language runtime TypeScript via `ts-node`, or a compiled output
  directory referenced from `Pulumi.yaml`?
- Is AWS SDK v3 added as a dependency in this slice, or added by the
  workstream that first needs it?

## Risks / Unknowns

- Pinning too old a version may make a capability a sibling needs unsupported;
  pinning is an infrastructure change and is reviewed as such.
- The recorded version can drift from the lockfile if two sources of truth
  diverge.
- The `packageManager` field and pnpm major version must match the local
  toolchain, or installs fail.

## Implementation Plan

1. Create `package.json` (package manager, Node engine, `typecheck` script) and
   `tsconfig.json` (strict, path alias).
2. Add dependencies and resolve them, producing `pnpm-lock.yaml`.
3. Add the pinned-provider version record and a guard that it matches the
   lockfile.
4. Add `Pulumi.yaml`, `src/index.ts`, and a `config/` placeholder.
5. Verify typecheck and a minimal `pulumi preview` path.

## Initial Acceptance Shape

1. `pnpm install` succeeds and `pnpm-lock.yaml` contains exactly one resolved
   `@pulumi/aws` version.
2. `pnpm typecheck` passes.
3. The pinned version is readable in one place and matches the lockfile.
4. `pulumi preview` runs against an empty configuration without resource
   construction errors.

## Notes for Refinement

- Decide the version-record mechanism before writing code; it is a
  cross-cutting read used by sibling error messages.
- Verify the selected version against a real AWS Organization preview before
  locking.
- Add explicit `Node` engine and `packageManager` values.

## Contracts / Decisions Locked For This Slice

- Agent-Owned: `pnpm` is the package manager (PRD DEC-006, AGENTS.md).
- Agent-Owned: the provider is pinned through the lockfile and behavior follows
  the pinned version (Source Section 5).
- Agent-Owned: TypeScript strict mode, `@/*` -> `./src/*` (AGENTS.md).
- TBD during refine-plan: the exact version and the version-record mechanism.

## Architecture Decisions For This Slice

- Reuse pattern: `AGENTS.md` directory structure and package manager
  convention.
- Layer ownership: project foundation; no capability layer.
- Code placement: root project files plus `src/index.ts`.
- Integration boundary: package installation and Pulumi program entrypoint.
- Non-goals: no AWS resources, no aliases, no audit command.

## Contract Inventory

- Pinned-provider version record (shape TBD).
- `package.json` script names (shape TBD beyond `typecheck`).

## Schema Ownership

- TBD during refine-plan.

## Locked Field Definitions

### TBD

- Pin and record mechanism is unresolved.

## Type / Schema Touchpoints

- TBD during refine-plan.

## Mapping Boundaries

- TBD during refine-plan.

## Invariants

- Exactly one resolved `@pulumi/aws` version exists in the lockfile.
- The recorded version matches the lockfile.

## Compatibility / Migration Notes

- TBD during refine-plan (provider upgrade is a reviewed infrastructure change).

## Likely File Touchpoints

- Filled by refine-plan.

## Implementation Notes

- Filled by refine-plan.

## Verification

- Automated:
  - Filled by refine-plan.
- Manual:
  - Filled by refine-plan.

## Edge Cases

- Filled by refine-plan.

## Acceptance Criteria

1. Filled by refine-plan.
2. Filled by refine-plan.
3. Filled by refine-plan.
