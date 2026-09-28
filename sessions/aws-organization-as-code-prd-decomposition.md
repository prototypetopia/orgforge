# PRD Decomposition: AWS Organization as Code with Pulumi

## Source

- Status: Complete
- Original PRD: `sessions/aws-org-as-code-prd.md`
- Canonical snapshot: `sessions/aws-organization-as-code-source-prd.md`
- Source SHA-256: `24f5e37e76a426b1f45590fe0cf42b7524a2c2b98f9f9c96858ec8c26a5f04b8`
- Parent slug: `aws-organization-as-code`
- Generated: `2026-09-28`
- Strategy: capability-scoped workstreams with independently meaningful
  outcomes

---

## Progress

- Snapshot status: Complete
- Inventory status: Complete
- Inventory cursor: Section 120 (full source sections 1-120 inventoried)
- Artifacts complete: 26/26

---

## Child Workstreams

| Order | Workstream | Outcome | Depends on | PRD |
| --- | --- | --- | --- | --- |
| 1 | `aws-organization-as-code-foundation-operations` | Safe project foundation, validation framework, state/CI/preview lifecycle, and protection defaults developers and operators can rely on | None | `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md` |
| 2 | `aws-organization-as-code-org-structure` | Declarative OU hierarchy, accounts, and Organization resource provisioned safely from TypeScript without hard-coded topology | `aws-organization-as-code-foundation-operations` | `sessions/aws-organization-as-code-org-structure/aws-organization-as-code-org-structure-prd.md` |
| 3 | `aws-organization-as-code-account-targeting` | Deterministic reusable organization-aware account selection (selectors, account sets, tag matching, exclusions) tested without Pulumi | `aws-organization-as-code-org-structure` | `sessions/aws-organization-as-code-account-targeting/aws-organization-as-code-account-targeting-prd.md` |
| 4 | `aws-organization-as-code-policies-integrations` | Policy-governed organization with unambiguous single-owner service integrations and delegated administration | `aws-organization-as-code-org-structure` | `sessions/aws-organization-as-code-policies-integrations/aws-organization-as-code-policies-integrations-prd.md` |
| 5 | `aws-organization-as-code-identity-center` | Workforce access (groups, users, permission sets, OU/account-set assignments) managed without hard-coded AWS account IDs | `aws-organization-as-code-org-structure`, `aws-organization-as-code-account-targeting` | `sessions/aws-organization-as-code-identity-center/aws-organization-as-code-identity-center-prd.md` |
| 6 | `aws-organization-as-code-deployments` | Organization-wide CloudFormation delivered safely via service-managed StackSets in automatic and resolved modes | `aws-organization-as-code-org-structure`, `aws-organization-as-code-account-targeting`, `aws-organization-as-code-policies-integrations` | `sessions/aws-organization-as-code-deployments/aws-organization-as-code-deployments-prd.md` |

---

## Artifact Manifest

Statuses: `Not started`, `In Progress`, `Complete`.

| Artifact | Path | Status |
| --- | --- | --- |
| Decomposition index | `sessions/aws-organization-as-code-prd-decomposition.md` | Complete |
| Source snapshot | `sessions/aws-organization-as-code-source-prd.md` | Complete |
| `aws-organization-as-code-foundation-operations` context | `sessions/aws-organization-as-code-foundation-operations/context.md` | Complete |
| `aws-organization-as-code-foundation-operations` decision log | `sessions/aws-organization-as-code-foundation-operations/decision-log.md` | Complete |
| `aws-organization-as-code-foundation-operations` handoff | `sessions/aws-organization-as-code-foundation-operations/latest.md` | Complete |
| `aws-organization-as-code-foundation-operations` PRD | `sessions/aws-organization-as-code-foundation-operations/aws-organization-as-code-foundation-operations-prd.md` | Complete |
| `aws-organization-as-code-org-structure` context | `sessions/aws-organization-as-code-org-structure/context.md` | Complete |
| `aws-organization-as-code-org-structure` decision log | `sessions/aws-organization-as-code-org-structure/decision-log.md` | Complete |
| `aws-organization-as-code-org-structure` handoff | `sessions/aws-organization-as-code-org-structure/latest.md` | Complete |
| `aws-organization-as-code-org-structure` PRD | `sessions/aws-organization-as-code-org-structure/aws-organization-as-code-org-structure-prd.md` | Complete |
| `aws-organization-as-code-account-targeting` context | `sessions/aws-organization-as-code-account-targeting/context.md` | Complete |
| `aws-organization-as-code-account-targeting` decision log | `sessions/aws-organization-as-code-account-targeting/decision-log.md` | Complete |
| `aws-organization-as-code-account-targeting` handoff | `sessions/aws-organization-as-code-account-targeting/latest.md` | Complete |
| `aws-organization-as-code-account-targeting` PRD | `sessions/aws-organization-as-code-account-targeting/aws-organization-as-code-account-targeting-prd.md` | Complete |
| `aws-organization-as-code-policies-integrations` context | `sessions/aws-organization-as-code-policies-integrations/context.md` | Complete |
| `aws-organization-as-code-policies-integrations` decision log | `sessions/aws-organization-as-code-policies-integrations/decision-log.md` | Complete |
| `aws-organization-as-code-policies-integrations` handoff | `sessions/aws-organization-as-code-policies-integrations/latest.md` | Complete |
| `aws-organization-as-code-policies-integrations` PRD | `sessions/aws-organization-as-code-policies-integrations/aws-organization-as-code-policies-integrations-prd.md` | Complete |
| `aws-organization-as-code-identity-center` context | `sessions/aws-organization-as-code-identity-center/context.md` | Complete |
| `aws-organization-as-code-identity-center` decision log | `sessions/aws-organization-as-code-identity-center/decision-log.md` | Complete |
| `aws-organization-as-code-identity-center` handoff | `sessions/aws-organization-as-code-identity-center/latest.md` | Complete |
| `aws-organization-as-code-identity-center` PRD | `sessions/aws-organization-as-code-identity-center/aws-organization-as-code-identity-center-prd.md` | Complete |
| `aws-organization-as-code-deployments` context | `sessions/aws-organization-as-code-deployments/context.md` | Complete |
| `aws-organization-as-code-deployments` decision log | `sessions/aws-organization-as-code-deployments/decision-log.md` | Complete |
| `aws-organization-as-code-deployments` handoff | `sessions/aws-organization-as-code-deployments/latest.md` | Complete |
| `aws-organization-as-code-deployments` PRD | `sessions/aws-organization-as-code-deployments/aws-organization-as-code-deployments-prd.md` | Complete |

---

## Dependency Graph

- Arrow direction: `prerequisite -> dependent`.
- `aws-organization-as-code-foundation-operations -> aws-organization-as-code-org-structure`
- `aws-organization-as-code-org-structure -> aws-organization-as-code-account-targeting`
- `aws-organization-as-code-org-structure -> aws-organization-as-code-policies-integrations`
- `aws-organization-as-code-org-structure -> aws-organization-as-code-identity-center`
- `aws-organization-as-code-account-targeting -> aws-organization-as-code-identity-center`
- `aws-organization-as-code-org-structure -> aws-organization-as-code-deployments`
- `aws-organization-as-code-account-targeting -> aws-organization-as-code-deployments`
- `aws-organization-as-code-policies-integrations -> aws-organization-as-code-deployments`
- No dependency cycles detected.

---

## Shared Constraints And Ownership

| Constraint | Primary owner | Applies to | Source locator |
| --- | --- | --- | --- |
| Pinned `@pulumi/aws` provider governs supported behavior; unsupported AWS features fail explicitly; no silent `@pulumi/aws-native` gap-filling; upgrades reviewed as infra changes | `aws-organization-as-code-foundation-operations` | All children | Section 5, Provider Version Policy |
| Stable TypeScript logical keys own framework identity; AWS display names are separate; Pulumi names derive from logical keys; no raw AWS IDs in human-authored config when a logical reference resolves | `aws-organization-as-code-org-structure` | All children | Section 8; Section 119 rule 6 |
| Pure organization model (target resolution, account-set evaluation, OU traversal, dependency analysis, most validation) must not depend on Pulumi; `AccountModel` stays Pulumi-free, `AccountContext` only at runtime | `aws-organization-as-code-account-targeting` | `aws-organization-as-code-org-structure`, `aws-organization-as-code-account-targeting`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` | Section 6; Section 13; Section 14; Section 119 rules 13-14 |
| Protection defaults and destructive-change safety (`protect: true` on org-critical resources, `closeOnDeletion: false` on accounts, mandatory preview, explicit decommission workflows, no auto-closing accounts) | `aws-organization-as-code-foundation-operations` | `aws-organization-as-code-org-structure`, `aws-organization-as-code-policies-integrations`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` | Sections 18-19; Sections 74-77; Sections 93-95; Section 119 rules 7-9, 29-31 |
| Exactly one Pulumi owner per Organizations service principal; policy-required principals derived from enabled policy types | `aws-organization-as-code-policies-integrations` | `aws-organization-as-code-policies-integrations`, `aws-organization-as-code-deployments` | Sections 28-29; Section 119 rules 20-22 |
| Service-managed StackSets only; native OU/root targeting for automatic mode; Organizations targets plus account filtering for resolved mode; exactly one plural `StackInstances` owner per StackSet; no self-managed top-level `accounts` targeting | `aws-organization-as-code-deployments` | `aws-organization-as-code-deployments` | Sections 44-49; Section 119 rules 23-28 |
| Out of scope: Control Tower, AFT, LZA, Terraform/CDK/SST inside this project, generic task runners, CloudFormation preprocessors, OrgFormation templating/task syntax | `aws-organization-as-code-foundation-operations` | All children | Sections 3-4; Sections 103-104; Section 119 rules 1-3, 46-47 |

---

## Source Coverage

Every independently normative source requirement, decision, acceptance check,
or deferred commitment has one primary disposition. Broad heterogeneous
sections use item-level locators. Secondary workstreams are listed only when a
traceability unit materially constrains them.

Inventory build is in progress by source chunk; rows below are the complete
record. Cursor marks the last fully processed source locator.

| Source locator | Summary | Source force | Disposition | Classification | Primary owner | Secondary workstreams |
| --- | --- | --- | --- | --- | --- | --- |
| Preamble (title, v2.1, TS/Pulumi/`@pulumi/aws`, greenfield OrgFormation replacement purpose) | Project identity and purpose | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 1, org-aware model properties (org as code, nested OUs, accounts, policies, targeting, Identity Center, StackSets, preview, safety) | Capability inventory defining decomposition scope | Required | Shared | Context Only | `aws-organization-as-code-foundation-operations` | All children |
| Section 1, TS + Pulumi + Organizations + Identity Center + StackSets DX and architecture diagram | Layered architecture intent (config, validation, model, targeting, org, Identity Center, deployments) | Required | Shared | Context Only | `aws-organization-as-code-foundation-operations` | All children |
| Section 2.1, config must describe OU hierarchy, accounts, placement, creation settings, metadata, policies, targets, services, delegated admins, Identity Center, account sets, deployments, modes, dependencies, Regions | Organization-as-code readability requirements | Required | Shared | Locked | `aws-organization-as-code-org-structure` | `aws-organization-as-code-account-targeting`, `aws-organization-as-code-policies-integrations`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 2.2, preserve OrgFormation abstractions in TypeScript; account sets replace bindings; TS APIs replace enumeration; managed deployments replace org-wide updates | Replacement approach | Required | Shared | Locked | `aws-organization-as-code-account-targeting` | `aws-organization-as-code-deployments`, `aws-organization-as-code-identity-center` |
| Section 2.3, Pulumi ownership list (org, OUs, accounts, tags, policies, attachments, integrations, delegated admins, Identity Center objects, StackSets, artifacts, mgmt stacks); manual Identity Center instance bootstrap exception | IaC ownership boundary | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | `aws-organization-as-code-org-structure`, `aws-organization-as-code-policies-integrations`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 3, must not become Control Tower/AFT/LZA/Terraform/CDK/SST/task runner/CI/CD/preprocessor | Product non-goals | Non-Goal | Non-Goal | Non-Goal | N/A | None |
| Section 3, do not recreate Nunjucks, custom Sub/Join, Foreach, shell/Terraform/Serverless/CDK task execution | Do-not-recreate list | Non-Goal | Non-Goal | Non-Goal | N/A | None |
| Section 4, use TS + `@pulumi/pulumi` + `@pulumi/aws` + AWS SDK v3 | Technology stack | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 4, AWS SDK v3 only where provider lacks operation or metadata | SDK containment rule | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 4, do not introduce OrgFormation/Terraform/CDKTF/Control Tower/AFT/LZA/SST without separate architecture decision; SST apps stay separate state boundaries | Technology exclusions | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 5, pin supported `@pulumi/aws` via lockfile; behavior follows pinned provider; unions reflect provider; unsupported features fail explicitly; no silent aws-native; upgrades are infra changes | Provider version policy | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 6, five layers (config, schema+validation, pure model, Pulumi runtime, AWS resources) | Layering rule | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 6, target resolution, account-set evaluation, OU traversal, dependency analysis, most validation must not depend on Pulumi | Purity rule | Required | Shared | Locked | `aws-organization-as-code-account-targeting` | `aws-organization-as-code-org-structure`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 7, recommended repo structure (config, types, model, runtime, organization, policies, identity-center, integrations, deployments, validation, naming, tests) | Recommended layout (illustrative) | Proposed | Child | Pending | `aws-organization-as-code-foundation-operations` | None |
| Section 8, every managed object has stable TS logical key plus AWS display name; Pulumi names derive from logical identifiers | Stable logical identifiers | Required | Shared | Locked | `aws-organization-as-code-org-structure` | All children |
| Section 9, primary `OrganizationDefinition` shape; must not prescribe company OU structure | Top-level config contract | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 10, arbitrary nested OUs with name/tags/children/aliases; `aws.organizations.OrganizationalUnit` | Nested OU support | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 11, max five OU levels beneath root; pure-model depth check fails validation before resource creation | OU depth validation | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 12, deterministic logical OU paths from config keys; used by placement, policies, sets, assignments, deployments | OU logical paths | Required | Shared | Locked | `aws-organization-as-code-org-structure` | `aws-organization-as-code-account-targeting`, `aws-organization-as-code-policies-integrations`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 13, Pulumi-independent `AccountModel` shape; forbids Output/resource objects; deterministic and unit-testable | Pure AccountModel | Required | Shared | Locked | `aws-organization-as-code-account-targeting` | `aws-organization-as-code-org-structure`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 14, runtime `AccountContext` extends model with `id: Output<string>`; only runtime uses Outputs | Runtime context layering | Required | Shared | Locked | `aws-organization-as-code-org-structure` | `aws-organization-as-code-account-targeting`, `aws-organization-as-code-deployments`, `aws-organization-as-code-identity-center` |
| Section 15, account config (name, email, OU, tags); `aws.organizations.Account` | Account provisioning | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 16, shared account defaults with per-account override | Account defaults | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 17, creation settings (email, roleName, iamUserAccessToBilling) vs mutable settings (OU parent, tags); roleName undiscoverable; billing change may replace; previews involving replacement are high risk | Creation-vs-mutable distinction | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 18, every member account `closeOnDeletion: false` + `protect: true`; deletion removes account from org (not no-op); protect is primary guard; removal must fail protected; decommission is explicit | Account safety | Required | Shared | Locked | `aws-organization-as-code-org-structure` | `aws-organization-as-code-foundation-operations` |
| Section 19, Organization `featureSet: ALL` + `protect: true`; `pulumi destroy` must fail before destroying org-critical resources | Organization safety | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 20, pure helper APIs (getAccount, getOu, resolveAccounts, getAccountsInOu, getDescendantOus, TS mapping) replacing OrgFormation enumeration | Account enumeration APIs | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 21, `AccountSelector` union (root/ou/account/tag); root means configured members, never silently includes management account | Selector model | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 22, account sets replace bindings; include/exclude/tag examples; `includeManagementAccount` flag | Account sets definition | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 23, set semantics: additive includes, recursive OU, tag key or key/value, exclusions after inclusion, dedupe, deterministic order, mgmt excluded by default | Set evaluation semantics | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 24, tag selection by key/value or key existence; v1 operates on config-defined metadata; no dynamic unmanaged-tag queries | Tag-based selection scope | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 25, `Policy` + `PolicyAttachment`; type union from pinned provider; fail explicitly on unsupported types | Policy implementation boundary | Required | Child | Locked | `aws-organization-as-code-policies-integrations` | None |
| Section 26, policy definition (file XOR document); validate source, parse JSON, deterministic serialize, create, resolve targets, attach | Policy definition handling | Required | Child | Locked | `aws-organization-as-code-policies-integrations` | None |
| Section 27, policy targets (root/ou/account); native inheritance; no OU-to-account attachment expansion | Policy targeting | Required | Child | Locked | `aws-organization-as-code-policies-integrations` | None |
| Section 28, exactly one Pulumi owner per service principal; org-owned policy prerequisites via `Organization.awsServiceAccessPrincipals` vs standalone `AwsServiceAccess`/service-specific resources | Service access ownership | Required | Shared | Locked | `aws-organization-as-code-policies-integrations` | `aws-organization-as-code-deployments` |
| Section 29, pure `resolvePolicyRequiredServicePrincipals` from pinned provider; tested; prevents enabling policies without required access | Prerequisite resolver | Required | Child | Locked | `aws-organization-as-code-policies-integrations` | None |
| Section 30, delegated administrators via logical account references; `DelegatedAdministrator` | Delegated admins | Required | Child | Locked | `aws-organization-as-code-policies-integrations` | None |
| Section 31, Identity Center scope (AWS-managed groups/users, memberships, external principals, permission sets, policy attachments/references/inline/boundaries, assignments) | Identity Center scope | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 32, org-level Identity Center instance is manual bootstrap; Pulumi owns org first, then discovers instance and manages identity objects | Bootstrap sequencing | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 33, `bootstrapMode=true` deploys core without Identity Center; `false` normal; missing instance with Identity Center configured fails; default `false` | Bootstrap mode | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 34, discovery must prove intended org instance (0->fail with guidance; 1->use; >1->fail); use SDK ListInstances when needed; verify owner/status/region; never pick index zero | Instance discovery safety | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 35, identity source modes `aws` and `external` | Identity source modes | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 36, AWS mode may manage `User`, `Group`, `GroupMembership` in identity store | AWS-managed identities | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 37, external principals prefer friendly lookup by display name/username; unambiguous result required; multiple/missing fail; explicit `principalId` escape hatch; never create externally-synced identities | External principal lookup | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 38, permission sets with managed/inline/customer-managed/boundary attachments | Permission sets | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 39, assignments expand one `AccountAssignment` per resolved account from principal + permission set + account set | Assignment expansion | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 40, assignment targets allow named account set or inline selectors; resolve OUs recursively, tags, exclusions, mgmt rules, dedupe, one per account | Assignment target expansion | Required | Shared | Locked | `aws-organization-as-code-identity-center` | `aws-organization-as-code-account-targeting` |
| Section 41, assignment Pulumi identity derives from principal + permission set + account logical IDs | Assignment resource identity | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 42, centralize explicit dependency ordering for policy attachments and assignments; no reliance on registration order | Identity dependency ordering | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 43, generic `deployments` concept covering baselines, logging, IAM, monitoring, budgets, networking, roles, service setup | Deployment concept | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 44, every deployment is `automatic` or `resolved` as TS discriminated union; no invalid combos deferred to runtime | Deployment mode modeling | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 45, automatic mode follows root/OU natively; example config; `StackSet` + `StackInstances` with `SERVICE_MANAGED` | Automatic deployment mode | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 46, automatic allows root/OU/multiple OUs/static params; forbids tags/exclusions/account filtering/per-account params/resolved sets; violations fail validation | Automatic restrictions | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 47, resolved mode for tag/exclusion/arbitrary-set/individual-account cases; new matching accounts join on next `pulumi up` | Resolved deployment mode | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 48, resolved stays `SERVICE_MANAGED`; no self-managed top-level `accounts`; use root IDs plus INTERSECTION account filtering | Resolved targeting shape | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 49, one StackSet has exactly one plural `StackInstances` owner; validated at logical model level | One-owner invariant | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 50, service-managed StackSets skip mgmt account; `includeManagementAccount: true` produces StackSet plus direct `Stack` without separate declaration | Management account deployment | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 51, static parameters normalized once and applied to both StackSet and mgmt Stack | Management account parameters | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 52, Pulumi-managed `StackSetsOrganizationsAccess` custom resource via SDK Activate/Describe/Deactivate; `protect: true`; service-specific API | StackSet trusted access | Required | Child | Locked | `aws-organization-as-code-policies-integrations` | `aws-organization-as-code-deployments` |
| Section 53, capability acknowledgement (`CAPABILITY_IAM`, `CAPABILITY_NAMED_IAM`); no `CAPABILITY_AUTO_EXPAND` for service-managed org deployments; pass to StackSet/Stack | Deployment capabilities | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 54, automatic StackSets default `managedExecution: { active: true }`; opt-out only if required | Managed execution default | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 55, `dependsOn` at Pulumi resource layer plus native StackSet auto-deployment dependencies via ARNs for future accounts | Deployment dependencies | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 56, dependency validation: references exist, direct/indirect cycles fail with path | Dependency validation | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 57, validate provider/AWS-supported direct dependency count; reject over documented limit for pinned environment | Dependency count limit | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 58, separate `operationPreferences.stackSetUpdates` from `instanceOperations`; expose pinned-provider subset; no blind reuse across differing schemas | Operation preferences layering | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 59, every deployment declares target Regions explicitly; no inference from provider Region | Explicit regions | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 60, separate `administrationRegion` distinct from target Regions | Administration region | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 61, enforce documented OU-ID limit per StackInstances operation (initially 50) unless verified safe batching | OU target limit | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 62, constrain Pulumi parallelism for account creation (`pulumi up --parallel 5` or lower); CI uses safe command; no reliance on undocumented serialization | Account creation concurrency | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | `aws-organization-as-code-org-structure` |
| Section 63, reject detectable unsupported service-managed constructs (Transform, nested `AWS::CloudFormation::Stack`); CloudFormation remains authoritative | Template restrictions | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 64, parse template before StackSet construction; extract params, defaults, NoEcho, Transform, resource types, dynamic references; YAML and JSON | Template parsing | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 65, artifact selection by size plus content (small clean->templateBody; large or URL-requiring->S3 templateUrl); never size-only | Artifact selection | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 66, conservative detection of `{{resolve:...}}` dynamic references forces S3 staging when URL preferred | Dynamic references | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 67, validate against pinned provider limits (inline vs URL); explain Pulumi-vs-AWS source in errors; no AWS-limit hard-coding | Template size limits | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 68, one protected artifact bucket (private, Block Public Access, versioned, encrypted, protected); content-addressed immutable-from-framework keys | Artifact bucket | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 69, parse `Parameters` first; distinguish required/default/NoEcho; no assumption that CloudFormation defaults let provider omit params | StackSet parameters | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 70, centralize NoEcho handling (automatic `ignoreChanges` where provider requires); never leak secrets into previews/logs | NoEcho parameters | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 71, prefer secret references/dynamic references over plaintext secret params; preserve Pulumi secret semantics and document exposure when unavoidable | Secret strategy (recommendation with fallback) | Proposed | Child | Pending | `aws-organization-as-code-deployments` | None |
| Section 72, automatic mode static parameters with normalization | Static parameters | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 73, per-account parameter generation not in v1; intended for resolved only; requires design spike (ownership, overrides, drift, updates, one-owner, mgmt behavior); no implementation from AWS support alone | Per-account params: spike plus deferred implementation | Proposed | Deferred | Deferred | N/A | None |
| Section 74, deployments default to protection (StackSet, StackInstances, mgmt Stack); normal refactors must not destroy org-wide infra | Deployment removal safety | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 75, account-leaves-OU (`retainOnAccountRemoval`) vs deployment-deleted (`retainStacks`/protection/decommission) are separate lifecycles | Retention layering | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 76, staged retain workflow: set retain, up, verify, unprotect, remove, up; no same-operation retain-change plus destroy | Retain staging rule | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 77, documented 10-step deployment decommission workflow analogous to account decommissioning | Decommission workflow | Required | Shared | Locked | `aws-organization-as-code-deployments` | `aws-organization-as-code-foundation-operations` |
| Section 78, README must state `pulumi refresh` is useful but insufficient for StackSet target auditing; no full-drift claims | Drift limitation disclosure | Required | Shared | Locked | `aws-organization-as-code-deployments` | `aws-organization-as-code-foundation-operations` |
| Section 79, future read-only `npm run audit` comparing configured vs actual org/accounts/sets/assignments/instances; post-v1 unless needed for critical drift gap | Future audit command (recommendation, post-v1) | Proposed | Deferred | Deferred | N/A | None |
| Section 80, cross-deployment references post-v1 with target API and automatic dependencies | Cross-deployment outputs implementation | Deferred | Deferred | Deferred | N/A | None |
| Section 81, cross-account output design questions (role, trust, permissions, StackSet-vs-Stack, lookup, caching, failure, security, no unmanaged credentials) | Cross-output technical design | Proposed | Deferred | Deferred | N/A | None |
| Section 82, validate complete logical model before dependent resources where possible; actionable errors with naming example | Validation quality bar | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 83, organization validation checklist (duplicate paths/keys/emails, placement, fields, aliases, creation-setting changes, mgmt references) | Organization validation | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 84, account-set validation (includes, OU/account refs, tag keys, mgmt rules, dedupe, nested refs); prefer forbidding nested refs in v1 | Account-set validation | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 85, policy validation (exactly one source, JSON, provider-supported type, targets, duplicate attachments, service principals, tags) with explicit unsupported-type error | Policy validation | Required | Child | Locked | `aws-organization-as-code-policies-integrations` | None |
| Section 86, Identity Center validation (region, source, discovery, principals, unique lookup, permission sets, targets, mgmt rules, duplicate assignments) | Identity validation | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 87, deployment validation checklist (IDs, names, template, params, capabilities, regions, targets, deps, cycles, mode restrictions, one owner, retain, size, staging, transforms, nested stacks, OU count, mgmt config) | Deployment validation | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 88, one long-lived Pulumi stack per AWS Organization; no dev/staging/prod copies unless separate orgs | State strategy | Required | Child | Locked | `aws-organization-as-code-foundation-operations` | None |
| Section 89, support Pulumi Cloud and DIY (S3) backends; no framework dependence on Pulumi Cloud APIs | State backend | Required | Child | Locked | `aws-organization-as-code-foundation-operations` | None |
| Section 90, Identity Center credentials for development (`aws sso login`, `AWS_PROFILE`); no long-lived access keys | Authentication | Required | Child | Locked | `aws-organization-as-code-foundation-operations` | None |
| Section 91, PRs run install/typecheck/unit/validation/preview; deployment needs approved protected workflow; no auto-deploy from arbitrary branches | CI/CD | Required | Child | Locked | `aws-organization-as-code-foundation-operations` | None |
| Section 92, `npm run deploy` with org-safe defaults and enforced parallelism; documented and used by CI | Safe deployment command | Required | Child | Locked | `aws-organization-as-code-foundation-operations` | None |
| Section 93, mandatory `pulumi preview` with high-risk example list (account replacement/removal, OU deletion/move, SCP/service-access changes, access removal, StackSet/Instances/mgmt-stack/trusted-access deletion) | Preview safety | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 94, minimum protected set (org, accounts, StackSets access, artifact bucket, StackSets, StackInstances, critical mgmt stacks; critical policies optionally) | Protected resources | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | `aws-organization-as-code-org-structure`, `aws-organization-as-code-policies-integrations`, `aws-organization-as-code-deployments` |
| Section 95, account decommissioning 9-step workflow; normal `pulumi up` must not close accounts | Account decommissioning | Required | Shared | Locked | `aws-organization-as-code-org-structure` | `aws-organization-as-code-foundation-operations` |
| Section 96, console changes are drift; guidance uses refresh+preview plus StackSet caveats; no auto-adoption; deliberate imports | Drift handling | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 97, eventual consistency: Pulumi edges first, provider/SDK waiters, no arbitrary sleeps, document unavoidable cases, useful errors | Consistency handling | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | `aws-organization-as-code-org-structure`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 98, pure unit tests list; Pulumi mock tests for resources/options; no automatic org create/destroy in ordinary CI | Testing strategy | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 99 behavioral tests, nested OU expansion | Acceptance: nested OU expansion | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 99 behavioral tests, account exclusion | Acceptance: account exclusion | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 99 behavioral tests, tag selection | Acceptance: tag selection | Required | Child | Locked | `aws-organization-as-code-account-targeting` | None |
| Section 99 behavioral tests, OU depth fails pre-creation | Acceptance: OU depth | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 99 behavioral tests, account deletion safety (`protect`, `closeOnDeletion`, removal-from-org semantics) | Acceptance: account deletion safety | Required | Child | Locked | `aws-organization-as-code-org-structure` | None |
| Section 99 behavioral tests, Identity Center deduplication | Acceptance: assignment dedupe | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 99 behavioral tests, ambiguous discovery fails | Acceptance: discovery safety | Required | Child | Locked | `aws-organization-as-code-identity-center` | None |
| Section 99 behavioral tests, automatic uses native `organizationalUnitIds` without account enumeration | Acceptance: automatic targeting | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 99 behavioral tests, automatic plus tag/exclusion/per-account-params fails | Acceptance: unsafe automatic mode | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 99 behavioral tests, resolved uses service-managed org targets, never self-managed `accounts` | Acceptance: resolved targeting | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 99 behavioral tests, two plural StackInstances owners for one StackSet fails | Acceptance: one owner | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 99 behavioral tests, dependencies produce Pulumi plus native StackSet dependency | Acceptance: dependency graph | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 99 behavioral tests, small template inline vs large/dynamic S3+URL | Acceptance: template handling | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 99 behavioral tests, NoEcho triggers secret/ignoreChanges handling | Acceptance: NoEcho | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 99 behavioral tests, deployments protected by default | Acceptance: deployment deletion safety | Required | Child | Locked | `aws-organization-as-code-deployments` | None |
| Section 100, illustrative example configuration | Example only, not normative | Example | Child | Context Only | `aws-organization-as-code-foundation-operations` | None |
| Section 101, new account workflow (create, place, inherit, auto StackSets, recalc sets/assignments/resolved) | Account arrival convergence | Required | Shared | Locked | `aws-organization-as-code-org-structure` | `aws-organization-as-code-account-targeting`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 102, account move workflow (OU move, policy inheritance, recalc, StackSet changes, visible preview) | Account move convergence | Required | Shared | Locked | `aws-organization-as-code-org-structure` | `aws-organization-as-code-account-targeting`, `aws-organization-as-code-policies-integrations`, `aws-organization-as-code-identity-center`, `aws-organization-as-code-deployments` |
| Section 103, no annotated per-resource CloudFormation compiler; separate deployments linked by dependencies/outputs | Compiler exclusion | Non-Goal | Non-Goal | Non-Goal | N/A | None |
| Section 104, no DSL for shell/Terraform/CDK/Serverless/scripts/arbitrary tools | Task runner exclusion | Non-Goal | Non-Goal | Non-Goal | N/A | None |
| Sections 105-115, phased delivery plan with per-phase acceptance (foundation, pure model, sets, resources, policies, integrations, artifacts, automatic, resolved, Identity Center, safety/CI) | Delivery sequencing only; capability scope owned by children above | Proposed | Child | Context Only | `aws-organization-as-code-foundation-operations` | None |
| Sections 116-117, per-account parameter spike and cross-deployment output design before implementation | Design spikes, approval-gated | Proposed | Deferred | Deferred | N/A | None |
| Section 118, v1 definition of done checklists (org, sets, policies, Identity Center, deployments, safety/ops) | V1 acceptance inventory (mapped to children above) | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 119 rules 1-50, critical agent rules | Normative guardrails (mapped to owning children above) | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 119 rule 50, platform-behavior conflict resolution (verify docs/API, document conflict, follow verified behavior) | Conflict resolution rule | Required | Shared | Locked | `aws-organization-as-code-foundation-operations` | All children |
| Section 120, product experience (think in org concepts, typed-TS to preview to up, account convergence) | Experience vision | Required | Shared | Context Only | `aws-organization-as-code-foundation-operations` | All children |

---

## Deferred Scope

- Per-account parameter generation implementation for resolved deployments (Section 73; Phase 12 spike in Section 116 approval-gated)
- Cross-deployment output references and cross-account output implementation (Sections 80-81; Phase 13 design in Section 117 approval-gated)
- Future read-only organization audit command `npm run audit` (Section 79; post-v1 unless needed for a critical drift gap)
- Nested account-set references beyond v1 preference to forbid or cycle-check (Section 84)
- Configurable quota-aware StackSet dependency-limit validation if quotas later become configurable (Section 57)
- Dedicated account-creation batching replacing the global Pulumi parallelism limit (Section 62)
- Optimized resolved-target shapes beyond the required service-managed INTERSECTION form (Section 48)

---

## Non-Goals

- AWS Control Tower (Section 3)
- Account Factory for Terraform (Section 3)
- Landing Zone Accelerator (Section 3)
- Terraform (Section 3; Section 119 rules 2, 47)
- CDK (Section 3; Section 119 rules 2, 47)
- SST inside this project; SST apps remain separate state boundaries (Sections 3-4; Section 119 rule 3)
- Generic deployment task runner / generic CI/CD framework / CloudFormation preprocessor (Section 3)
- Nunjucks templating; custom `!Sub` / `!Join`; generic `Foreach` syntax (Section 3)
- Shell / Terraform / Serverless Framework / CDK task execution (Section 3; Section 104)
- OrgFormation annotated per-resource CloudFormation compiler recreation (Section 103; Section 119 rule 46)
- Automatic organization copies (dev/staging/prod) unless genuinely separate AWS Organizations (Section 88)
- Framework dependence on Pulumi Cloud-specific APIs (Section 89)
- Long-lived access keys as the required auth path (Section 90)
- Auto-deploying organization modifications from arbitrary branches (Section 91)
- Automatically closing AWS accounts via normal `pulumi up` (Section 95; Section 119 rule 7)
- Macro expansion capability (`CAPABILITY_AUTO_EXPAND`) while transforms/macros remain prohibited (Section 53; Section 119 rule 33)
- Per-account parameter overrides before the dedicated spike completes (Section 119 rule 44)
- Cross-account outputs before security design approval (Section 119 rule 45)

---

## Open Questions

1. Which exact `@pulumi/aws` version will be pinned at implementation start, and what is its supported policy-type union, template limits, dependency count, and OU-target limit? (Sections 5, 25, 57, 61, 67)
2. What are the verified AWS SDK v3 gaps (Identity Center discovery metadata, StackSets Organizations access) for the pinned provider? (Sections 4, 34, 52)
3. What are the exact `operationPreferences` field subsets supported by the pinned provider for StackSet updates vs instance operations? (Section 58)
4. What is the approved account-creation parallelism value and safe deploy script form for this repository? (Sections 62, 92)
5. Is the Phase 12 per-account parameter spike in v1 scope as a design-only deliverable, or fully deferred? (Section 73, Section 116)
6. Is the Phase 13 cross-deployment output design in v1 scope as a design-only deliverable, or fully deferred? (Sections 80-81, Section 117)
7. What becomes of the illustrative Section 100 field shapes (e.g. assignment `targets` vs `accountSet`, `managedExecution: true` shorthand) during `/refine-prd` normalization?

---

## Validation

- [x] Every inventoried source traceability unit has exactly one primary
      disposition.
- [x] Every child has a distinct outcome and independently meaningful
      acceptance criteria.
- [x] Child dependencies resolve and contain no cycles.
- [x] Shared constraints appear in every affected child PRD.
- [x] Deferred scope and non-goals did not become child requirements.
- [x] Every child claim has a coverage row mapped to that child.
- [x] Every `Child` or `Shared` row classified `Locked` or `Pending` appears in
      every mapped child's PRD.
- [x] Source force and decision classification agree; proposed and example
      content was not silently locked.
- [x] Parent snapshot, index, contexts, decision logs, and child PRDs contain no
      unresolved contradictions.
- [x] The source snapshot is verbatim-identical to the supplied source PRD.
- [x] Every child PRD follows `docs/templates/prd-template.md`.
