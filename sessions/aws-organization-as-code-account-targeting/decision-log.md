# Decision Log: AWS Organization as Code Account Targeting

## Decision
- **ID:** DEC-001
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** OrgFormation Organization Bindings need a TypeScript-native successor that stays organization-aware (Source Sections 2.2, 22).
- **Decision:** Implement Account Sets as the first-class model with `include`, optional `exclude`, and `includeManagementAccount`, where `OrganizationBinding: OrganizationalUnit: [Workloads]` conceptually becomes `accountSets.workloads.include = [{ ou: "workloads" }]`.
- **Consequences:** Policies, assignments, and deployments all target through one selection language instead of scattered enumeration syntax.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 2.2, 22

## Decision
- **ID:** DEC-002
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Selection must cover whole-org, subtree, single-account, and metadata cases without leaking the management account into everyday targets (Source Sections 21, 23).
- **Decision:** Support the `AccountSelector` union (`root`/`ou`/`account`/`tag`); `root: true` means configured member accounts by default and never silently includes the management account, which requires explicit inclusion.
- **Consequences:** Whole-org selectors stay safe by default; management-account targeting is always a conscious choice.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 21, 23

## Decision
- **ID:** DEC-003
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Overlapping selectors must resolve predictably for assignments and deployments (Source Section 23).
- **Decision:** Evaluate as union(includes) minus union(excludes) with recursive OU descendants, key or key/value tag matching, post-inclusion exclusions, deduplication, and deterministic ordering.
- **Consequences:** Overlapping OU plus explicit-account references collapse to one entry; test expectations are order-stable.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 23

## Decision
- **ID:** DEC-004
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Desired-model resolution must not depend on live unmanaged tag state (Source Section 24).
- **Decision:** Operate v1 tag selection on configuration-defined account metadata only; never dynamically query unmanaged AWS tags to build the desired organization model.
- **Consequences:** Tag-based sets are fully previewable from the checkout; tag changes are configuration changes.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 24

## Decision
- **ID:** DEC-005
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Resolution must be deterministic and unit-testable without cloud access (Source Sections 6, 13).
- **Decision:** Keep all selection logic on the Pulumi-independent `AccountModel` with no Outputs or provider resource objects.
- **Consequences:** The evaluator ships with pure unit tests covering traversal, matching, exclusions, dedupe, and management-account behavior.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 6, 13
