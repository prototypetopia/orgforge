# Decision Log: AWS Organization as Code Foundation and Operations

## Decision
- **ID:** DEC-001
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** The source PRD mandates a fixed stack and forbids reintroducing adjacent IaC ecosystems inside this project (Source Sections 3-4).
- **Decision:** Build on TypeScript with `@pulumi/pulumi`, `@pulumi/aws`, and AWS SDK v3 used only where the provider lacks the operation or sufficient discovery metadata; keep OrgFormation, Terraform CLI, CDKTF, Control Tower, AFT, LZA, and SST out of this project without a separate architecture decision, with SST apps as separate state boundaries.
- **Consequences:** Provider gaps must surface as explicit failures or SDK-scoped additions, never as new frameworks; sibling workstreams inherit this constraint.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 3-4

## Decision
- **ID:** DEC-002
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** AWS may ship Organizations/CloudFormation capabilities before `@pulumi/aws` exposes them (Source Section 5).
- **Decision:** Pin a supported `@pulumi/aws` version via the lockfile; base framework behavior, type unions, and limits on the pinned provider; fail explicitly on unsupported requests; never silently fill gaps with `@pulumi/aws-native`; review provider upgrades as infrastructure changes.
- **Consequences:** Feature requests can be blocked by the pinned provider until an explicit upgrade; error messages must distinguish Pulumi from AWS limitations.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 5

## Decision
- **ID:** DEC-003
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Organization resolution must stay deterministic and unit-testable (Source Section 6).
- **Decision:** Enforce the five-layer architecture (configuration, schema + semantic validation, pure organization model, Pulumi runtime model, AWS resources) with target resolution, account-set evaluation, OU traversal, dependency analysis, and most validation kept Pulumi-independent.
- **Consequences:** Model and targeting code must be importable and testable without Pulumi; runtime layer alone may depend on Outputs.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 6

## Decision
- **ID:** DEC-004
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Multiple environments must not fork a single AWS Organization's state (Source Sections 88-89).
- **Decision:** Use one long-lived Pulumi stack per AWS Organization with no dev/staging/prod copies unless they are genuinely separate organizations; support Pulumi Cloud and DIY backends without depending on Pulumi Cloud-specific APIs.
- **Consequences:** Environment separation happens across organizations, not stacks of one org; backend choice stays operational.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 88-89

## Decision
- **ID:** DEC-005
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Organization changes are high-blast-radius and need mandatory review gates (Source Sections 91-94).
- **Decision:** Require `pulumi preview` before applying; run install, typecheck, `pnpm test:unit`, `pnpm test:mock`, validation, and preview on PRs; deploy only through an approved protected workflow with an org-safe `pnpm run deploy` script mapping to `pulumi up --parallel 5` (including constrained parallelism for account creation); protect the minimum critical set (Organization, member accounts, StackSets Organizations access, artifact bucket, StackSets, StackInstances, critical management stacks).
- **Consequences:** Routine automation cannot silently remove protected resources; CI and local workflows share the same safe command. Package-manager naming updated from the source's `npm` to `pnpm` by user-approved `refine-prd` on 2026-09-29; command semantics preserved.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 62, 91-94

## Decision
- **ID:** DEC-006
- **Date:** 2026-09-29
- **Status:** accepted
- **Context:** `/refine-prd` run 2026-09-29; user confirmed package-manager choice and spike scoping.
- **Decision:** `pnpm` is the package manager (source said `npm`); Vitest with `pnpm test:unit` / `pnpm test:mock` per `TESTS.md`; the per-account-parameter spike and cross-deployment-output design are design-only v1 deliverables owned by the deployments workstream; enforced parallelism is `--parallel 5`.
- **Consequences:** Sibling PRDs referencing `npm run deploy` should be updated via their own `/refine-prd`; the deployments workstream now carries two design deliverables into v1; the implementing foundation slice must record the pinned `@pulumi/aws` version and capability surface.
- **Related files/plans:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md`, Source Sections 62, 73, 80-81, 92, 98, 116-117

## Decision
- **ID:** DEC-007
- **Date:** 2026-09-29
- **Status:** accepted
- **Context:** Second `/refine-prd` run found "aliases" in Phase 1 (Section 105) is not TypeScript path aliases: the source defines `aliases?: string[]` on organizational-unit definitions (Section 10) and validates "invalid aliases" (Section 83). Also confirmed Section 119 rule 49 ("fail on ambiguous or unsupported behavior rather than guessing") as a foundation-owned normative guardrail, and moved the pending secret-strategy and directory-layout proposals to accepted.
- **Decision:** The foundation's naming helpers own stable-logical-key alias resolution; aliases are alternate reference names, must resolve deterministically to exactly one managed object, fail validation on ambiguity naming the alias and its intended target, and never drive Pulumi resource names (which always derive from the logical key). TypeScript path aliases remain a separate, conventional scaffold concern. Secret strategy locked as a Section 71 preference; Section 7 layout skeleton accepted as repo convention via `AGENTS.md`.
- **Consequences:** `aws-organization-as-code-org-structure` consumes key/alias resolution and owns "invalid alias" validation cases against org definitions; alias determinism is testable in the pure unit tier; provider-policy follow-through stays with the implementing foundation slice.
- **Related files/plans:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md`, Source Sections 10, 71, 83, 105, 119 rules 49

## Decision
- **ID:** DEC-008
- **Date:** 2026-09-29
- **Status:** accepted
- **Context:** A further refinement found that the decomposition assigns OU aliases and organization validation to org-structure (Sections 10, 83). The source's `aliases?: string[]` does not specify alternate-reference resolution; DEC-007 inferred unsupported semantics and assigned ownership to foundation. Provider capability details likewise belong with the sibling implementing each feature, not with foundation's provider pin.
- **Decision:** Supersede DEC-007's alias interpretation and ownership: org-structure owns OU aliases and determines their semantics during its PRD refinement; foundation owns stable-logical-key naming conventions only. Foundation pins and records `@pulumi/aws`; capability owners verify their own provider unions, limits, SDK gaps, and operation preferences against that pin. Keep DEC-007's accepted directory-layout and secret-strategy preferences and fail-on-ambiguity guardrail.
- **Consequences:** Do not create a foundation alias registry or promise alternate-reference semantics. Do not require foundation to verify unimplemented sibling provider surfaces. DEC-006's claim that foundation verifies the whole capability surface is superseded.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md`, Source Sections 5, 8, 10, 25, 57-58, 61, 67, 83

## Decision
- **ID:** DEC-009
- **Date:** 2026-09-29
- **Status:** accepted
- **Context:** `/prd-breakdown` found a mismatch between this workstream's PRD and DEC-006 (user-approved: the per-account parameter spike and cross-deployment output design are design-only v1 deliverables owned by the deployments workstream) and the decomposition index, which still classifies Sections 73, 80-81, and 116-117 as `Deferred` with primary owner `N/A` and repeats that in its Deferred Scope list.
- **Decision:** Treat the user-approved DEC-006 scope as governing. The stale index rows are not mapped to this child, so they are not slice input; record the reconciliation debt in the workstream checklist rather than blocking breakdown.
- **Consequences:** No foundation slice implements or plans the two design spikes. Someone must update the decomposition index and the deployments PRD so they agree with DEC-006; until then those two documents are the stale artifacts, not this workstream's PRD.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, `sessions/aws-organization-as-code-deployments/aws-organization-as-code-deployments-prd.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-next-steps.md`, Source Sections 73, 80-81, 116-117

## Decision
- **ID:** DEC-010
- **Date:** 2026-09-29
- **Status:** accepted
- **Context:** PRD requirements 4, 6, and 7 cover Pulumi Cloud and DIY backends plus a protected deployment workflow, but no source section, `AGENTS.md`, or repo file names a CI platform or a backend, and this repo has no CI config. Guessing either would violate the no-unsupported-claim rule.
- **Decision:** Scope the CI and deploy slice to `package.json` scripts plus a provider-agnostic gate-order definition. Leave the CI platform, the CI credential mechanism, and the repository's backend selection as explicit TBDs in the slice's Open Questions for `/refine-plan`.
- **Consequences:** Slice 07 cannot produce a pipeline file until the platform is chosen; the safe command and gate order can be implemented and verified now. OIDC or any other CI credential mechanism stays unasserted because no evidence names it.
- **Related files/plans:** `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-05-state-and-authentication.md`, `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-07-safe-deploy-and-ci-gates.md`, Source Sections 88-92
