# Decision Log: AWS Organization as Code Identity Center

## Decision
- **ID:** DEC-001
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** AWS does not expose organization Identity Center instance creation through the normal organization-management API path used here (Source Sections 2.3, 32).
- **Decision:** Keep instance creation a manual bootstrap operation: Pulumi provisions organization core first, a human enables the instance, then Pulumi discovers it and manages groups, users, permission sets, and assignments.
- **Consequences:** Greenfield setup is two-phase by necessity; automation never attempts instance creation.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 2.3, 31-32

## Decision
- **ID:** DEC-002
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Blindly selecting the first returned Identity Center instance risks managing the wrong instance (Source Section 34).
- **Decision:** Prove the intended organization instance: zero matches fail with bootstrap guidance, exactly one is used, more than one ambiguous candidate fails explicitly; fall back to SDK v3 `ListInstances` when provider metadata is insufficient; verify owner account, status, and region where possible.
- **Consequences:** Ambiguous environments fail safely instead of assigning access under the wrong instance.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 34

## Decision
- **ID:** DEC-003
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** External IdP principals need human-meaningful references without losing precision (Source Section 37).
- **Decision:** Prefer friendly lookup by unique display name (groups) or username (users); require unambiguous results; fail on multiple matches or missing principals; keep explicit `principalId` as an escape hatch; never create externally-synchronized identities in Pulumi.
- **Consequences:** Configuration stays readable; collisions and typos fail validation instead of binding the wrong principal.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 37

## Decision
- **ID:** DEC-004
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Overlapping OU and explicit-account assignment targets must not duplicate access records (Source Sections 40-41 and behavioral tests).
- **Decision:** Expand assignments through full set semantics (recursive OUs, tags, exclusions, management-account rules, dedupe) into one `AccountAssignment` per resolved account, with Pulumi identity derived from principal, permission-set, and account logical IDs.
- **Consequences:** OU plus explicit-account overlap yields one assignment; renames of AWS-generated IDs never fork assignment identity.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Sections 39-41

## Decision
- **ID:** DEC-005
- **Date:** Unknown (recorded 2026-09-28)
- **Status:** accepted
- **Context:** Provider ordering behavior requires explicit edges between policy attachments, assignments, and their prerequisites (Source Section 42).
- **Decision:** Centralize Identity Center dependency logic in the Identity Center component with explicit dependencies; never rely on incidental resource registration order.
- **Consequences:** Ordering stays correct regardless of declaration order or refactoring.
- **Related files/plans:** `sessions/aws-organization-as-code-prd-decomposition.md`, Source Section 42
