# Decision Log: AWS Organization as Code Policies and Integrations

## Decision
- **ID:** DEC-001
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** AWS policy types may outpace the pinned Pulumi provider, inviting false support claims (Source Sections 5, 25).
- **Decision:** Derive the policy-type union from the pinned `@pulumi/aws` version and fail explicitly when configuration requests an unsupported type, with upgrade guidance.
- **Consequences:** New AWS policy types stay unavailable until a reviewed provider upgrade; users get actionable errors instead of late deployment failures.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 5, 25, 85

## Decision
- **ID:** DEC-002
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** OU-targeted policies must inherit natively rather than fan out into per-account attachments (Source Section 27).
- **Decision:** Target policies at root, OU, or account using native Organizations inheritance; never expand OU targets into individual account attachments.
- **Consequences:** Attachment count stays proportional to declared targets; inheritance changes flow from OU moves automatically.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 27

## Decision
- **ID:** DEC-003
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Duplicate service-principal ownership causes conflicting updates between the Organization resource and standalone access resources (Source Section 28).
- **Decision:** Maintain exactly one Pulumi owner per Organizations service principal: policy-required prerequisites live in `Organization.awsServiceAccessPrincipals`, all other access uses `AwsServiceAccess` or service-specific resources, never both.
- **Consequences:** Ownership validation must reject dual-managed principals before resource creation.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 28

## Decision
- **ID:** DEC-004
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Enabling policies like Inspector or Security Hub variants without their required service access leaves the organization half-configured (Source Section 29).
- **Decision:** Implement and test the pure `resolvePolicyRequiredServicePrincipals(enabledPolicyTypes)` resolver for the pinned provider and derive required principals from enabled policy configuration.
- **Consequences:** Missing-prerequisite configurations fail in validation with guidance instead of half-applying.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 29

## Decision
- **ID:** DEC-005
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** No dedicated `@pulumi/aws` resource exists for StackSets Organizations trusted access, but deployments require it (Source Section 52).
- **Decision:** Create a Pulumi-managed `StackSetsOrganizationsAccess` custom resource using SDK v3 Activate/Describe/Deactivate operations with `protect: true`, using the service-specific API.
- **Consequences:** The deployments workstream consumes this resource; its protection and lifecycle follow the shared safety rails.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 52
