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
- **Decision:** Require `pulumi preview` before applying; run install, typecheck, unit tests, validation, and preview on PRs; deploy only through an approved protected workflow with an org-safe `npm run deploy` script (including constrained parallelism for account creation); protect the minimum critical set (Organization, member accounts, StackSets Organizations access, artifact bucket, StackSets, StackInstances, critical management stacks).
- **Consequences:** Routine automation cannot silently remove protected resources; CI and local workflows share the same safe command.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 62, 91-94
