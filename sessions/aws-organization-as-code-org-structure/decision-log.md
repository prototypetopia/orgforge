# Decision Log: AWS Organization as Code Org Structure

## Decision
- **ID:** DEC-001
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Framework resources need rename-safe identity independent of AWS display names (Source Section 8).
- **Decision:** Give every managed object a stable TypeScript logical key plus an AWS-visible display name; derive Pulumi resource names from logical identifiers; never require raw AWS IDs in human-authored config when a logical reference resolves.
- **Consequences:** Renames of AWS display names do not fork resource identity; all targeting layers resolve through logical keys and OU paths.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 8

## Decision
- **ID:** DEC-002
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** AWS supports at most five OU levels beneath the root, and late discovery would strand partial deployments (Source Section 11).
- **Decision:** Calculate OU depth in the pure organization model and fail validation before any Pulumi resource creation.
- **Consequences:** Depth violations surface as configuration errors with actionable messages, never as partial AWS failures.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 11

## Decision
- **ID:** DEC-003
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Account creation settings behave differently from mutable settings: `roleName` is undiscoverable afterwards and billing-access changes may replace the resource (Source Section 17).
- **Decision:** Distinguish creation settings (email, roleName, iamUserAccessToBilling) from mutable settings (OU parent, tags); document creation settings clearly; never present them as safe ordinary mutations; treat replacement previews as high risk.
- **Consequences:** Validation and docs must call out creation-setting changes explicitly; reviewers get replacement-risk signal in previews.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 17

## Decision
- **ID:** DEC-004
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Account deletion removes the member account from the organization even with `closeOnDeletion: false`, so ordinary refactoring must never trigger it (Source Section 18).
- **Decision:** Default every member account to `closeOnDeletion: false` plus `protect: true`; keep protection through ordinary refactoring; fail protected on declaration removal; require the explicit multi-step decommissioning workflow.
- **Consequences:** Account removal is always deliberate and multi-step; `protect` is the primary guard, not `closeOnDeletion`.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 18

## Decision
- **ID:** DEC-005
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** The organization root must enable all features and survive routine destroy operations (Source Section 19).
- **Decision:** Create the Organization with `featureSet: "ALL"` under `protect: true` so routine `pulumi destroy` fails before destroying organization-critical resources.
- **Consequences:** Feature-gated capabilities (policies, StackSets) stay available; destroy safety is enforced at the resource layer.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 19
