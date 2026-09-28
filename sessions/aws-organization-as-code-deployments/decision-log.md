# Decision Log: AWS Organization as Code Deployments

## Decision
- **ID:** DEC-001
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Invalid mode combinations (automatic plus tag selectors, exclusions, account filtering, or per-account params) would silently break future-account behavior if emulated (Source Sections 44, 46).
- **Decision:** Model modes as a TypeScript discriminated union and fail validation on invalid automatic combinations instead of emulating them.
- **Consequences:** Authors choose resolved mode explicitly for dynamic targeting; automatic mode keeps native future-account semantics intact.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 44, 46

## Decision
- **ID:** DEC-002
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Self-managed StackSet account targeting would abandon the service-managed permission model for resolved deployments (Source Section 48).
- **Decision:** Keep resolved mode on `SERVICE_MANAGED` using Organizations deployment targets with account filtering (`organizationalUnitIds` plus resolved account IDs with `INTERSECTION`); never use top-level self-managed `accounts` targeting.
- **Consequences:** Resolved sets deploy as organization members under the service-managed model; future target-shape optimizations must preserve it.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 48

## Decision
- **ID:** DEC-003
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Multiple plural `StackInstances` resources for one StackSet would fight over the same instance set (Source Section 49).
- **Decision:** Enforce exactly one plural `StackInstances` owner per StackSet as a framework invariant validated at the logical model level.
- **Consequences:** Deployment composition must route all instance configuration for a StackSet through its single owner.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 49

## Decision
- **ID:** DEC-004
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Service-managed StackSets skip the management account, but organization-wide intent often includes it (Source Section 50).
- **Decision:** Produce both the member-account StackSet and the management-account direct `Stack` from one deployment declaration when `includeManagementAccount` is true, with parameters normalized once for both paths.
- **Consequences:** Authors never write a second declaration for management-account coverage; parameter drift between paths is structurally impossible.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 50-51

## Decision
- **ID:** DEC-005
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Template delivery (inline vs S3 URL) affects both size limits and dynamic-reference behavior, and provider limits differ from AWS API limits (Source Sections 64-67).
- **Decision:** Parse templates before StackSet construction; decide inline body vs S3 URL on size plus content (forcing S3 for dynamic references where URL behavior is preferred); validate against pinned provider limits with Pulumi-vs-AWS error attribution.
- **Consequences:** Template defects surface pre-creation; artifact staging is content-aware rather than size-only.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 64-67

## Decision
- **ID:** DEC-006
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Deployment disappearance is destructive across many accounts, and retention has two independent axes (Source Sections 74-77).
- **Decision:** Protect StackSet, StackInstances, and management-account Stack by default; keep account-leaves-OU retention separate from deployment-deletion retention; require the staged retain workflow and ten-step decommission procedure.
- **Consequences:** Removal is always deliberate, staged across reviewed operations, and verified per target account.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 74-77
