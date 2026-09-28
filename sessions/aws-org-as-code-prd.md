# PRD: AWS Organization as Code with Pulumi

**Version:** 2.1 Final
**Status:** Ready for implementation planning
**Primary language:** TypeScript
**IaC engine:** Pulumi
**AWS provider:** `@pulumi/aws`
**Purpose:** Build a modern, actively maintained, Pulumi-based replacement for OrgFormation for greenfield AWS Organizations management.

---

# 1. Executive Summary

Build a reusable TypeScript framework using Pulumi that manages an AWS Organization declaratively.

The project should preserve the most valuable properties of OrgFormation:

* Organization structure as code
* Nested Organizational Units
* AWS account creation and OU placement
* Account creation defaults
* Organization policies and policy targeting
* Account and OU metadata and tags
* Reusable account target groups
* Include and exclude targeting rules
* Tag-based account selection
* IAM Identity Center configuration
* OU-level Identity Center assignment abstraction
* Organization-wide CloudFormation deployments
* Automatic deployment to future accounts
* Resolved targeting when native StackSet automatic targeting is insufficient
* Multi-region deployments
* Deployment dependencies
* Management-account deployment
* Deployment artifact management
* Previewable changes
* Strong protections against destructive organization changes

The implementation must use current AWS and Pulumi capabilities rather than recreating OrgFormation's custom CloudFormation compiler.

The resulting developer experience should feel approximately like:

```text
OrgFormation's organization-aware model
                +
TypeScript
                +
Pulumi state and preview
                +
AWS Organizations
                +
IAM Identity Center
                +
CloudFormation StackSets
```

The intended architecture is:

```text
TypeScript configuration
          |
          v
Validation + organization model
          |
          +-----------------------------+
          |                             |
          v                             v
AWS Organizations                Account targeting
          |                             |
          |                             +-- account sets
          |                             +-- tag selectors
          |                             +-- exclusions
          |                             +-- recursive OU resolution
          |
          +-- Organization
          +-- OUs
          +-- Accounts
          +-- Policies
          +-- Service integrations
          +-- Delegated admins
          |
          +-----------------------------+
          |                             |
          v                             v
IAM Identity Center               Deployments
                                        |
                              +---------+---------+
                              |                   |
                              v                   v
                         automatic             resolved
                         StackSets             StackSets
```

---

# 2. Goals

## 2.1 Organization as code

A repository checkout should describe the intended AWS Organization without requiring inspection of the AWS Console.

The configuration must make it possible to understand:

* OU hierarchy
* AWS accounts
* account placement
* account creation settings
* account metadata
* organization policies
* policy targets
* trusted AWS services
* delegated administrators
* Identity Center groups and permission sets
* account access assignments
* reusable account sets
* organization-wide deployments
* deployment mode
* deployment dependencies
* target Regions

---

## 2.2 Closest practical replacement for OrgFormation

The framework should preserve OrgFormation's organization-aware abstractions while replacing OrgFormation-specific syntax with normal TypeScript.

For example:

```yaml
OrganizationBinding:
  OrganizationalUnit:
    - Workloads
```

should conceptually become:

```ts
accountSets: {
  workloads: {
    include: [
      { ou: "workloads" },
    ],
  },
}
```

OrgFormation account enumeration should become ordinary TypeScript APIs.

OrgFormation organization-wide CloudFormation updates should become managed deployment abstractions backed by service-managed CloudFormation StackSets.

---

## 2.3 Infrastructure as code wherever AWS permits it

Except where AWS itself does not expose an appropriate API, organization configuration must be managed through Pulumi.

Expected Pulumi ownership includes:

* AWS Organization
* OUs
* member accounts
* account tags
* OU tags
* organization policies
* policy tags
* policy attachments
* service integrations
* delegated administrators
* Identity Center groups where AWS is the identity source
* Identity Center users where AWS is the identity source
* group memberships
* permission sets
* permission-set policies
* Identity Center account assignments
* CloudFormation StackSets
* StackSet trusted access
* CloudFormation deployment artifacts
* management-account stacks

The known manual bootstrap exception is creation of the organization-level IAM Identity Center instance.

---

# 3. Non-goals

The framework must not initially become:

* AWS Control Tower
* Account Factory for Terraform
* Landing Zone Accelerator
* Terraform
* CDK
* SST
* a generic deployment task runner
* a generic CI/CD framework
* a CloudFormation preprocessor

Do not recreate OrgFormation features already handled naturally by TypeScript or Pulumi, including:

* Nunjucks templating
* custom `!Sub`
* custom `!Join`
* generic `Foreach` syntax
* shell task execution
* Terraform task execution
* Serverless Framework task execution
* CDK task execution

---

# 4. Technology Decisions

Use:

```text
TypeScript
@pulumi/pulumi
@pulumi/aws
AWS SDK for JavaScript v3
```

AWS SDK v3 should only be introduced where:

1. `@pulumi/aws` does not expose the required AWS operation, or
2. the Pulumi data source does not expose sufficient metadata for safe discovery.

Do not introduce:

```text
OrgFormation
Terraform CLI
CDKTF
AWS Control Tower
AFT
Landing Zone Accelerator
SST
```

inside this project without a separate architecture decision.

SST applications remain separate infrastructure and state boundaries.

---

# 5. Provider Version Policy

The project must pin a supported `@pulumi/aws` version through the package lockfile.

Framework behavior must be based on the capabilities of the **pinned provider version**, not merely on features available in the AWS API.

This is important because AWS may add new Organizations policy types or CloudFormation capabilities before `@pulumi/aws` exposes them.

Rules:

1. Type unions must reflect the pinned provider's supported values.
2. If AWS supports a feature but the pinned Pulumi provider does not, configuration requesting that feature must fail explicitly.
3. Do not silently introduce `@pulumi/aws-native` to fill individual provider gaps.
4. Provider upgrades must be reviewed as infrastructure changes.

---

# 6. Core Architecture

The framework should contain five conceptual layers:

```text
1. User configuration
          |
          v
2. Schema + semantic validation
          |
          v
3. Pure organization model
          |
          +-- OU graph
          +-- accounts
          +-- AccountModel
          +-- account sets
          +-- target resolution
          +-- dependency graph
          |
          v
4. Pulumi runtime model
          |
          +-- AccountContext
          +-- Pulumi Outputs
          +-- ComponentResources
          |
          v
5. AWS resources
```

Target resolution, account-set evaluation, OU traversal, dependency analysis, and most validation must not depend on Pulumi.

---

# 7. Repository Structure

Recommended:

```text
aws-organization/
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── Pulumi.yaml
├── README.md
│
├── config/
│   ├── organization.ts
│   ├── account-sets.ts
│   ├── policies.ts
│   ├── identity-center.ts
│   ├── deployments.ts
│   └── integrations.ts
│
├── src/
│   ├── index.ts
│   │
│   ├── types/
│   │   ├── organization.ts
│   │   ├── accounts.ts
│   │   ├── targets.ts
│   │   ├── policies.ts
│   │   ├── identity-center.ts
│   │   └── deployments.ts
│   │
│   ├── model/
│   │   ├── organization-model.ts
│   │   ├── account-model.ts
│   │   ├── ou-paths.ts
│   │   ├── account-sets.ts
│   │   ├── target-resolver.ts
│   │   └── dependency-graph.ts
│   │
│   ├── runtime/
│   │   └── account-context.ts
│   │
│   ├── organization/
│   │   ├── organization.ts
│   │   ├── organizational-units.ts
│   │   └── accounts.ts
│   │
│   ├── policies/
│   │   ├── policies.ts
│   │   ├── attachments.ts
│   │   └── service-access-requirements.ts
│   │
│   ├── identity-center/
│   │   ├── discovery.ts
│   │   ├── groups.ts
│   │   ├── users.ts
│   │   ├── memberships.ts
│   │   ├── permission-sets.ts
│   │   └── assignments.ts
│   │
│   ├── integrations/
│   │   ├── service-access.ts
│   │   ├── delegated-administrators.ts
│   │   └── stacksets-organizations-access.ts
│   │
│   ├── deployments/
│   │   ├── deployment.ts
│   │   ├── automatic-deployment.ts
│   │   ├── resolved-deployment.ts
│   │   ├── management-account.ts
│   │   ├── dependencies.ts
│   │   ├── template-parser.ts
│   │   ├── parameters.ts
│   │   ├── artifacts.ts
│   │   └── decommission.ts
│   │
│   ├── validation/
│   │   ├── organization.ts
│   │   ├── account-sets.ts
│   │   ├── policies.ts
│   │   ├── identity-center.ts
│   │   ├── deployments.ts
│   │   └── quotas.ts
│   │
│   └── naming/
│       └── resource-names.ts
│
├── policies/
│   └── *.json
│
├── deployments/
│   └── */
│       └── template.yaml
│
└── test/
    ├── organization-model.test.ts
    ├── account-sets.test.ts
    ├── target-resolver.test.ts
    ├── policies.test.ts
    ├── identity-center.test.ts
    ├── deployments.test.ts
    ├── dependencies.test.ts
    └── quotas.test.ts
```

---

# 8. Stable Logical Identifiers

Every managed object must have:

1. a stable TypeScript logical key;
2. an AWS-visible display name.

Example:

```ts
organizationalUnits: {
  workloadProduction: {
    name: "Production",
  },
}
```

`workloadProduction` is the framework identity.

`Production` is the AWS-visible name.

Pulumi resource names must derive from stable logical identifiers.

---

# 9. Organization Definition

The primary configuration should resemble:

```ts
export const organization: OrganizationDefinition = {
  accountDefaults: {},
  organizationalUnits: {},
  accounts: {},
  accountSets: {},
  policies: {},
  identityCenter: {},
  integrations: {},
  deployments: {},
};
```

The framework must not prescribe a specific company OU structure.

---

# 10. Organizational Units

Support arbitrary nested OUs.

Example:

```ts
organizationalUnits: {
  workloads: {
    name: "Workloads",

    children: {
      production: {
        name: "Production",
      },

      development: {
        name: "Development",
      },
    },
  },

  security: {
    name: "Security",
  },
}
```

Suggested type:

```ts
interface OrganizationalUnitDefinition {
  name: string;

  tags?: Record<string, string>;

  children?: Record<
    string,
    OrganizationalUnitDefinition
  >;

  aliases?: string[];
}
```

Implementation:

```text
aws.organizations.OrganizationalUnit
```

---

# 11. OU Depth Validation

AWS currently supports an OU hierarchy with a maximum depth of five levels beneath the root.

The pure organization model must calculate OU depth before Pulumi resource creation.

Configuration exceeding the supported AWS depth must fail validation.

Example error:

```text
OU "workloads/us/production/platform/team"
would exceed the supported AWS Organizations OU depth.
```

Do not rely on AWS to discover this after partial deployment.

---

# 12. OU Logical Paths

Nested OUs receive deterministic logical paths.

Example:

```text
workloads
workloads/production
workloads/development
security
```

Paths use configuration keys, not AWS display names.

Paths are used by:

* account placement
* policy targets
* account sets
* Identity Center assignments
* deployment targets

---

# 13. Pure AccountModel

Account selection logic must operate on a Pulumi-independent model.

```ts
interface AccountModel {
  logicalId: string;

  name: string;

  email: string;

  organizationalUnit: string;

  tags: Record<string, string>;

  isManagementAccount: boolean;
}
```

`AccountModel` must not contain:

```text
pulumi.Output
aws.organizations.Account
provider resource objects
```

This keeps organization resolution deterministic and easy to unit-test.

---

# 14. Runtime AccountContext

Pulumi resource construction may use:

```ts
interface AccountContext
  extends AccountModel {

  id: pulumi.Output<string>;
}
```

Only the runtime layer should depend on Pulumi Outputs.

---

# 15. Accounts

Account configuration:

```ts
accounts: {
  production: {
    name: "production",

    email:
      "aws-production@example.com",

    organizationalUnit:
      "workloads/production",

    tags: {
      Environment:
        "production",
    },
  },
}
```

Implementation:

```text
aws.organizations.Account
```

---

# 16. Account Defaults

Support shared account defaults:

```ts
accountDefaults: {
  roleName:
    "OrganizationAccountAccessRole",

  iamUserAccessToBilling:
    "DENY",

  tags: {
    ManagedBy:
      "pulumi",
  },
}
```

Account-specific values override defaults.

---

# 17. Account Creation Settings

The framework must distinguish account **creation settings** from mutable account settings.

Creation settings include at minimum:

```text
email
roleName
iamUserAccessToBilling
```

These must not be treated as ordinary mutable properties.

`roleName` is not fully discoverable by Organizations after account creation.

Changing `iamUserAccessToBilling` through the provider may require account resource replacement.

Therefore:

1. account creation settings must be clearly documented;
2. validation must prevent the framework from presenting them as safe ordinary mutations;
3. previews involving replacement of `aws.organizations.Account` must be treated as high risk.

Mutable settings include:

```text
OU parent
tags
```

where supported by AWS.

---

# 18. Account Safety

Every member account must use:

```ts
closeOnDeletion: false
```

and Pulumi:

```ts
{
  protect: true,
}
```

Important behavior:

```text
closeOnDeletion = false
```

does **not** mean deletion is a no-op.

If Pulumi deletes the resource, AWS removes the member account from the Organization while leaving the AWS account open.

Therefore:

```text
protect = true
```

is the primary protection against ordinary account removal.

Rules:

1. Accounts must be protected by default.
2. Ordinary configuration refactoring must never automatically unprotect accounts.
3. Removing an account declaration must produce a protected-resource failure rather than removing the account from the Organization.
4. Account decommissioning requires an explicit procedure.

---

# 19. Organization Safety

The Organization resource must:

```ts
featureSet: "ALL"
```

and use:

```ts
{
  protect: true,
}
```

A routine:

```bash
pulumi destroy
```

must fail before destroying organization-critical resources.

---

# 20. Account Enumeration APIs

Expose pure helper APIs such as:

```ts
org.getAccount(
  "production",
);

org.getOu(
  "workloads/production",
);

org.resolveAccounts({
  include: [
    { ou: "workloads" },
  ],
});

org.getAccountsInOu(
  "workloads",
);

org.getDescendantOus(
  "workloads",
);
```

Also support normal TypeScript mapping:

```ts
org.resolveAccounts({
  include: [
    { ou: "workloads" },
  ],
}).map(account =>
  account.name
);
```

This replaces OrgFormation account enumeration syntax.

---

# 21. Account Selector Model

```ts
type AccountSelector =
  | { root: true }
  | { ou: OuPath }
  | { account: AccountKey }
  | {
      tag: {
        key: string;
        value?: string;
      };
    };
```

`root: true` refers to configured member accounts by default.

It does not silently include the Organizations management account.

---

# 22. Account Sets

Account Sets replace OrgFormation Organization Bindings.

Example:

```ts
accountSets: {
  workloads: {
    include: [
      { ou: "workloads" },
    ],
  },

  nonSandboxWorkloads: {
    include: [
      { ou: "workloads" },
    ],

    exclude: [
      {
        ou:
          "workloads/sandbox",
      },
    ],
  },

  budgetManaged: {
    include: [
      {
        tag: {
          key:
            "BudgetThreshold",
        },
      },
    ],
  },
}
```

Suggested type:

```ts
interface AccountSetDefinition {
  include: AccountSelector[];

  exclude?: AccountSelector[];

  includeManagementAccount?: boolean;
}
```

---

# 23. Account Set Semantics

Rules:

1. inclusion selectors are additive;
2. OU selectors recursively include descendants;
3. account selectors include individual accounts;
4. tag selectors may match key existence or key/value;
5. exclusions run after inclusion;
6. duplicates are removed;
7. result ordering is deterministic;
8. management account is excluded by default;
9. management account requires explicit inclusion.

Conceptually:

```text
union(includes)
     -
union(excludes)
```

---

# 24. Tag-Based Selection

Support:

```ts
{
  tag: {
    key: "Environment",
    value: "production",
  },
}
```

and:

```ts
{
  tag: {
    key: "BudgetThreshold",
  },
}
```

The second means the tag exists regardless of value.

Tag selection in v1 operates on configuration-defined account metadata.

Do not dynamically query unmanaged AWS tags to build the desired organization model.

---

# 25. Organization Policies

Use:

```text
aws.organizations.Policy
aws.organizations.PolicyAttachment
```

The framework must define its policy-type union from the pinned `@pulumi/aws` version.

Do not claim support for every Organizations policy type available in AWS if the pinned provider does not expose it.

If configuration requests an unsupported policy type, fail explicitly.

---

# 26. Policy Definition

Example:

```ts
policies: {
  restrictRegions: {
    name:
      "RestrictRegions",

    type:
      "SERVICE_CONTROL_POLICY",

    file:
      "./policies/restrict-regions.json",

    targets: [
      {
        ou:
          "workloads",
      },
    ],

    tags: {
      ManagedBy:
        "organization-iac",
    },
  },
}
```

Support exactly one:

```ts
file?: string;
document?: object;
```

The framework must:

1. validate source existence;
2. parse JSON;
3. serialize object policies deterministically;
4. create policies;
5. resolve logical targets;
6. create attachments.

---

# 27. Policy Targeting

Policies may target:

```ts
{ root: true }

{ ou: "workloads" }

{ account: "production" }
```

Use native Organizations inheritance.

Do not expand OU policy targets into individual account attachments.

---

# 28. Service Access Ownership

The project must maintain **exactly one Pulumi owner for each Organizations service principal**.

There are two ownership mechanisms.

## 28.1 Organization-owned policy prerequisites

Some enabled Organization policy types may require specific principals to appear in:

```text
Organization.awsServiceAccessPrincipals
```

For those policy types, the framework must derive the required principal list from enabled policy configuration.

Example categories include provider-documented policy prerequisites such as Inspector or Security Hub policies.

These principals are owned by the `Organization` resource.

## 28.2 Standalone service integration

All other service access should use:

```text
aws.organizations.AwsServiceAccess
```

or a service-specific AWS/Pulumi resource.

A principal managed by the Organization resource must not also be managed by `AwsServiceAccess`.

---

# 29. Service Access Requirement Resolver

Implement a pure resolver:

```ts
resolvePolicyRequiredServicePrincipals(
  enabledPolicyTypes
)
```

It returns only principals required by policy types in the pinned provider version.

The implementation must be covered by tests.

This prevents configuration like:

```text
INSPECTOR_POLICY
```

from being enabled without its required service access.

---

# 30. Delegated Administrators

Configuration:

```ts
delegatedAdministrators: {
  securityHub: {
    account:
      "security",

    servicePrincipal:
      "securityhub.amazonaws.com",
  },
}
```

Implementation:

```text
aws.organizations.DelegatedAdministrator
```

Configuration uses logical account references.

---

# 31. IAM Identity Center

IAM Identity Center is part of the organization IaC model.

Manage:

* AWS-managed groups
* AWS-managed users
* group memberships
* external principals
* permission sets
* managed policy attachments
* customer-managed policy references
* inline policies
* permission boundaries
* account assignments

---

# 32. Identity Center Bootstrap

The organization-level IAM Identity Center instance remains a manual AWS bootstrap operation because AWS does not expose its creation through the normal organization-management API path required here.

Bootstrap:

```text
Pulumi
  |
  +-- Organization
  +-- OUs
  +-- Accounts
  +-- Policies
  |
  v

Manual:
Enable organization IAM Identity Center instance

  |
  v

Pulumi
  |
  +-- discover instance
  +-- groups/users
  +-- permission sets
  +-- assignments
```

---

# 33. Bootstrap Mode

Support:

```text
bootstrapMode=true
```

This deploys organization core without Identity Center configuration.

Normal mode:

```text
bootstrapMode=false
```

If Identity Center is configured but a valid organization instance cannot be discovered, deployment must fail.

Default:

```text
false
```

---

# 34. Identity Center Discovery

Do not blindly select:

```ts
instances.arns[0]
```

The discovery algorithm must prove that the selected Identity Center instance is the intended organization instance.

Required behavior:

```text
0 matching active organization instances
    -> fail with bootstrap guidance

1 matching active organization instance
    -> use it

more than 1 ambiguous candidate
    -> fail explicitly
```

If `aws.ssoadmin.getInstances()` does not expose enough metadata to disambiguate safely, use AWS SDK v3 `ListInstances`.

Where possible verify:

```text
OwnerAccountId == managementAccountId

Status == ACTIVE

PrimaryRegion == configured Identity Center region
```

Do not silently choose an arbitrary instance.

---

# 35. Identity Source Modes

Support:

```ts
identitySource:
  "aws"
```

and:

```ts
identitySource:
  "external"
```

---

# 36. AWS-Managed Identities

In AWS mode, Pulumi may manage:

```text
aws.identitystore.User
aws.identitystore.Group
aws.identitystore.GroupMembership
```

---

# 37. External Identity Provider Principals

External principals should support friendly lookup by unique identity attributes.

Preferred configuration:

```ts
groups: {
  developers: {
    type:
      "external",

    displayName:
      "Developers",
  },
}
```

The framework resolves the Identity Store group by its unique display name.

Users may similarly resolve by a unique username where supported.

Also allow:

```ts
principalId:
  "..."
```

as an explicit escape hatch.

Rules:

1. friendly lookup is preferred;
2. lookup must require an unambiguous result;
3. multiple matches fail;
4. missing principals fail;
5. Pulumi must not create identities synchronized from an external IdP.

---

# 38. Permission Sets

Example:

```ts
permissionSets: {
  administrator: {
    name:
      "Administrator",

    sessionDuration:
      "PT4H",

    managedPolicies: [
      "arn:aws:iam::aws:policy/AdministratorAccess",
    ],
  },
}
```

Support:

```text
aws.ssoadmin.PermissionSet
aws.ssoadmin.ManagedPolicyAttachment
aws.ssoadmin.PermissionSetInlinePolicy
aws.ssoadmin.CustomerManagedPolicyAttachment
aws.ssoadmin.PermissionsBoundaryAttachment
```

---

# 39. Identity Center Assignments

Configuration:

```ts
assignments: [
  {
    principal:
      "developers",

    permissionSet:
      "developer",

    accountSet:
      "development",
  },
]
```

The framework expands this into one:

```text
aws.ssoadmin.AccountAssignment
```

per resolved AWS account.

---

# 40. Assignment Target Expansion

Assignments may reference:

```ts
accountSet:
  "development"
```

or inline account selectors.

Expansion must:

1. recursively resolve OUs;
2. evaluate tags;
3. apply exclusions;
4. apply management-account rules;
5. deduplicate;
6. create one assignment per account.

---

# 41. Identity Assignment Resource Identity

Pulumi logical identity should derive from:

```text
principalLogicalId
permissionSetLogicalId
accountLogicalId
```

not AWS-generated IDs.

---

# 42. Identity Center Dependency Ordering

Permission-set policy attachments and account assignments must use explicit dependencies where required by provider behavior.

The Identity Center component centralizes this dependency logic.

Do not rely on incidental resource registration order.

---

# 43. Generic Organization Deployments

Use:

```text
deployments
```

rather than limiting the concept to baselines.

A deployment may represent:

* security baseline
* logging
* IAM infrastructure
* monitoring
* budgets
* networking prerequisites
* shared roles
* organization-wide service setup

---

# 44. Deployment Modes

Every deployment is:

```text
automatic
```

or:

```text
resolved
```

The modes must be modeled as a TypeScript discriminated union.

Do not expose invalid combinations and then rely exclusively on runtime validation.

---

# 45. Automatic Deployment Mode

Use when infrastructure should follow Organization root or OU membership automatically.

Example:

```ts
securityBaseline: {
  mode:
    "automatic",

  targets: {
    include: [
      {
        ou:
          "workloads",
      },
    ],
  },

  regions: [
    "us-east-1",
    "us-west-2",
  ],

  automaticDeployment: {
    retainOnAccountRemoval:
      false,
  },
}
```

Implementation:

```text
aws.cloudformation.StackSet
aws.cloudformation.StackInstances
```

using:

```text
permissionModel = SERVICE_MANAGED
```

and native Organization/OU deployment targets.

---

# 46. Automatic Deployment Restrictions

Allowed:

```text
root targeting
OU targeting
multiple OUs
static StackSet parameters
```

Disallowed:

```text
tag-based account selection
account exclusions
individual account filtering
per-account parameters
arbitrary resolved Account Sets
```

These combinations must fail validation.

Do not emulate them in a way that breaks future-account automatic behavior.

---

# 47. Resolved Deployment Mode

Resolved mode handles selectors that AWS automatic deployment cannot preserve safely.

Examples:

```text
tag matching
OU minus selected accounts
arbitrary Account Set
individual accounts
per-account configuration
```

Example:

```ts
budgets: {
  mode:
    "resolved",

  accountSet:
    "budgetManaged",

  regions: [
    "us-east-1",
  ],
}
```

A newly created matching account joins this deployment on the next `pulumi up`.

---

# 48. Resolved StackSet Targeting

Resolved mode must still use:

```text
permissionModel = SERVICE_MANAGED
```

wherever compatible.

Do **not** use the top-level self-managed StackSet `accounts` targeting mechanism.

For resolved individual accounts, use service-managed Organizations deployment targets.

The generic implementation should be based on:

```ts
deploymentTargets: {
  organizationalUnitIds: [
    organizationRootId,
  ],

  accounts:
    resolvedAccountIds,

  accountFilterType:
    "INTERSECTION",
}
```

This expresses:

```text
accounts from the resolved set
that belong to this Organization
```

while retaining the service-managed StackSet permission model.

The implementation may optimize target shapes later, but must remain service-managed.

---

# 49. One StackInstances Owner Per StackSet

The plural Pulumi:

```text
aws.cloudformation.StackInstances
```

resource owns the stack-instance set associated with its StackSet configuration.

Therefore:

```text
one StackSet
    |
    v
exactly one StackInstances owner
```

is a framework invariant.

Do not allow multiple framework components to create plural `StackInstances` resources for the same StackSet.

This must be validated at the logical model level.

---

# 50. Management Account Deployment

Service-managed StackSets do not deploy into the Organizations management account.

When:

```ts
includeManagementAccount:
  true
```

the framework must produce:

```text
OrganizationDeployment
       |
       +-- StackSet
       |      |
       |      +-- member accounts
       |
       +-- aws.cloudformation.Stack
              |
              +-- management account
```

The developer should not need a separate deployment declaration.

---

# 51. Management Account Parameters

Static parameters should be applied consistently to both:

```text
StackSet
management-account Stack
```

The framework should normalize parameters once and use the normalized values for both paths.

---

# 52. StackSet Trusted Access

Create a Pulumi-managed custom resource:

```text
StackSetsOrganizationsAccess
```

when no dedicated `@pulumi/aws` resource exists.

Use AWS SDK v3 operations:

```text
ActivateOrganizationsAccess
DescribeOrganizationsAccess
DeactivateOrganizationsAccess
```

Default:

```ts
protect:
  true
```

Use the service-specific API rather than generic trusted access.

---

# 53. Deployment Capabilities

Deployments must support CloudFormation capability acknowledgement.

Configuration:

```ts
capabilities: [
  "CAPABILITY_NAMED_IAM",
]
```

Supported v1 values:

```text
CAPABILITY_IAM
CAPABILITY_NAMED_IAM
```

Do not expose `CAPABILITY_AUTO_EXPAND` for service-managed organization deployments while macros and transforms remain unsupported.

The framework must pass configured capabilities to:

```text
aws.cloudformation.StackSet
aws.cloudformation.Stack
```

where applicable.

---

# 54. Managed Execution

Automatic StackSets should default to:

```ts
managedExecution: {
  active: true,
}
```

Allow explicit opt-out only if required.

---

# 55. Deployment Dependencies

Configuration:

```ts
dependsOn: [
  "baseIam",
  "logging",
]
```

Dependencies must be represented at two layers.

## Pulumi

Use resource `dependsOn`.

## AWS automatic future-account provisioning

For automatic StackSets, also configure native StackSet auto-deployment dependencies using StackSet ARNs.

This ensures dependency ordering remains effective when AWS deploys into a future account without Pulumi running.

---

# 56. Dependency Validation

Before resource creation:

* referenced deployments must exist;
* direct cycles must fail;
* indirect cycles must fail;
* errors must show the dependency path.

Example:

```text
Deployment dependency cycle:

baseIam
 -> monitoring
 -> security
 -> baseIam
```

---

# 57. StackSet Dependency Limit

Validate the provider/AWS-supported direct dependency count.

The initial implementation should reject more than the documented supported number for the pinned environment rather than letting AWS fail after resource creation.

If quotas later become configurable, this validation may become configuration-aware.

---

# 58. Operation Preferences

StackSet operation controls exist at multiple lifecycle levels.

Do not model them as one ambiguous object.

Use:

```ts
operationPreferences: {
  stackSetUpdates?: {
    // update behavior
  },

  instanceOperations?: {
    // create/update/delete
    // stack instance behavior
  },
}
```

Expose the subset supported by the pinned provider.

Potential fields include:

```text
failureToleranceCount
failureTolerancePercentage

maxConcurrentCount
maxConcurrentPercentage

regionConcurrencyType
regionOrder

concurrencyMode
```

Do not pass the same structure blindly to both resources if their schemas differ.

---

# 59. Regions

Every deployment must explicitly declare target Regions.

Example:

```ts
regions: [
  "us-east-1",
  "us-west-2",
]
```

Do not infer target Regions from the default Pulumi AWS provider Region.

---

# 60. StackSet Administration Region

Configure separately:

```ts
deployments: {
  administrationRegion:
    "us-east-1",
}
```

The administration Region is distinct from target Regions.

---

# 61. StackSet OU Target Limit

AWS imposes limits on the number of OU IDs accepted in StackSet instance operations.

The validator must enforce the currently documented limit for the AWS operation being used.

At initial implementation, configuration producing more than 50 OU deployment target IDs in a single StackInstances operation must fail with an actionable error unless the implementation deliberately batches operations in a verified safe manner.

Do not silently exceed API limits.

---

# 62. Account Creation Concurrency

AWS Organizations limits concurrent member-account creation.

Initial deployment automation must not assume that arbitrary Pulumi parallelism is safe.

The project must provide an organization deployment script that constrains Pulumi parallelism when account creation is present.

Recommended conservative workflow:

```bash
pulumi up --parallel 5
```

or lower.

CI must use the same safe organization deployment command.

If a future implementation provides dedicated account-creation batching, it may replace this global Pulumi limit.

Do not rely on undocumented provider serialization.

---

# 63. Template Restrictions

Service-managed StackSet templates must reject unsupported constructs where detectable.

At minimum validate obvious:

```yaml
Transform:
```

and:

```text
AWS::CloudFormation::Stack
```

nested-stack resources when incompatible with the chosen service-managed behavior.

CloudFormation remains authoritative for complete validity.

---

# 64. Template Parsing

The framework must parse the CloudFormation template before constructing StackSet resources.

Extract at minimum:

```text
Parameters
Parameter defaults
NoEcho markers
Transform
resource types
dynamic-reference usage
```

Support YAML and JSON CloudFormation templates.

---

# 65. Template Artifact Selection

Artifact selection must account for both size and template content.

Conceptually:

```text
small template
+
no reason requiring S3
        |
        v
templateBody

large template
OR
dynamic references requiring URL behavior
        |
        v
S3 artifact
        |
        v
templateUrl
```

Do not use only file size to make the decision.

---

# 66. Dynamic References

If a template contains CloudFormation dynamic references such as Secrets Manager or SSM references and AWS/provider guidance indicates `TemplateUrl` should be preferred, force S3 staging.

Example patterns include:

```text
{{resolve:ssm:...}}
{{resolve:ssm-secure:...}}
{{resolve:secretsmanager:...}}
```

The parser should detect these conservatively.

---

# 67. Template Size Limits

Validate against the **pinned Pulumi provider's limits**, even if the underlying AWS API currently permits a larger template.

Current implementation strategy:

```text
templateBody
    -> provider-supported inline limit

templateUrl
    -> provider-supported URL template limit
```

Do not hard-code AWS's larger API limit if the provider rejects it earlier.

Error messages should explain whether the limitation comes from Pulumi or AWS.

---

# 68. Deployment Artifact Bucket

Create one protected organization artifact bucket.

Required characteristics:

```text
private
Block Public Access
versioning enabled
server-side encryption
Pulumi protected
```

Use content-addressed keys where practical:

```text
cloudformation/
security-baseline/
sha256-abc123.yaml
```

Artifacts should be immutable from the framework's perspective.

---

# 69. StackSet Parameters

The framework must parse the template's `Parameters` section before building StackSet parameters.

It must distinguish:

```text
required parameters
parameters with Default
NoEcho parameters
```

Do not assume CloudFormation defaults allow the Pulumi StackSet resource to omit arbitrary parameters without considering provider behavior.

---

# 70. NoEcho Parameters

CloudFormation parameters marked:

```yaml
NoEcho: true
```

require special Pulumi handling.

The framework must centralize this behavior.

Where provider semantics require:

```text
ignoreChanges
```

for `NoEcho` parameter values, configure it automatically rather than requiring every deployment author to know this provider-specific rule.

Do not leak secret parameter values into ordinary previews or logs.

---

# 71. Secret Strategy

Prefer secret references in CloudFormation templates over passing plaintext secret values through StackSet parameters.

Preferred mechanisms include:

```text
AWS Secrets Manager
SSM Parameter Store
CloudFormation dynamic references
```

If Pulumi secret values must be used as parameters, preserve Pulumi secret semantics and document any unavoidable CloudFormation exposure characteristics.

---

# 72. Static Parameters

Automatic mode may support static parameters:

```ts
parameters: {
  LogLevel:
    "INFO",
}
```

Parameters are normalized before use.

---

# 73. Per-Account Parameters

Per-account parameter generation is **not part of the initial v1 implementation commitment**.

It remains an intended capability for resolved deployments, but must begin with a technical design spike because the plural Pulumi `StackInstances` resource has limitations around account-specific parameter override drift.

Target API may look like:

```ts
parametersForAccount:
  account => ({
    BudgetThreshold:
      account.tags.BudgetThreshold,

    AccountName:
      account.name,
  })
```

Before implementation, verify:

* resource ownership model;
* parameter override behavior;
* drift behavior;
* update behavior;
* interaction with one-StackInstances-owner invariant.

Do not implement this feature merely because AWS APIs support parameter overrides.

---

# 74. Deployment Removal Safety

A deployment disappearing from configuration is potentially destructive across many AWS accounts.

Every organization deployment should default to protection.

Protect at minimum:

```text
StackSet
StackInstances
management-account Stack
```

Do not allow a normal refactor to automatically destroy organization-wide infrastructure.

---

# 75. Account Leaves OU vs Deployment Is Deleted

These are separate lifecycle events.

## Account leaves a targeted OU

Controlled by:

```text
automaticDeployment.retainOnAccountRemoval
```

## Deployment is removed from Pulumi

Controlled by:

```text
StackInstances.retainStacks
Pulumi protection
deployment decommission workflow
```

Do not conflate the two.

---

# 76. StackInstances Retain Behavior

If stacks should remain when the `StackInstances` resource is deliberately destroyed, the required retain configuration must already be applied before destruction.

The decommission workflow must therefore support a staged operation:

```text
1. set retainStacks appropriately
2. pulumi up
3. verify
4. explicitly unprotect
5. remove deployment
6. pulumi up
```

Do not attempt to change retention behavior and destroy the StackInstances resource in the same unreviewed operation.

---

# 77. Deployment Decommission Workflow

Document a deliberate workflow:

```text
1. Decide whether target stacks should remain.
2. Configure retain behavior.
3. Run pulumi preview.
4. Apply retain configuration.
5. Verify target accounts.
6. Explicitly remove protection.
7. Remove deployment configuration.
8. Run pulumi preview.
9. Apply.
10. Confirm expected AWS result.
```

This is analogous to account decommissioning.

---

# 78. StackSet Drift Limitations

Pulumi refresh does not provide complete drift detection for every StackSet deployment-target field.

The README must explicitly state:

```text
pulumi refresh
```

is useful but not sufficient for comprehensive StackSet target auditing.

Do not claim full drift detection where the provider does not provide it.

---

# 79. Future Organization Audit Command

A future read-only audit command is recommended:

```bash
npm run audit
```

Potential checks:

```text
configured accounts
vs
actual Organization accounts

configured OUs
vs
actual OUs

expected Account Set membership

expected Identity Center assignments
vs
actual assignments

expected StackSet target accounts
vs
actual stack instances
```

This is post-v1 unless required during implementation to compensate for a critical provider drift limitation.

---

# 80. Cross-Deployment Outputs

Cross-deployment references remain a post-v1 capability.

Target API:

```ts
deploymentOutput({
  deployment:
    "centralLogging",

  account:
    "logArchive",

  region:
    "us-east-1",

  output:
    "BucketArn",
})
```

The framework should automatically create dependency relationships.

---

# 81. Cross-Account Output Technical Design

Before implementation, define:

* read role;
* trust policy;
* minimum permissions;
* StackSet vs direct Stack behavior;
* output lookup mechanism;
* caching;
* failure handling;
* security implications.

Possible implementation:

```text
AWS SDK
+
STS AssumeRole
+
CloudFormation DescribeStacks
```

Do not introduce unmanaged credentials.

---

# 82. Configuration Validation

Validate the complete logical model before constructing dependent resources wherever possible.

Errors must be actionable.

Bad:

```text
Invalid target
```

Good:

```text
Account set "productionServices"
references OU "workloads/prod",
but no OU exists with that logical path.
```

---

# 83. Organization Validation

Validate at minimum:

* duplicate logical OU paths
* OU depth
* duplicate account logical keys
* duplicate account email addresses
* account placement references
* missing account fields
* invalid aliases
* unsupported creation-setting changes when detectable
* management-account references

---

# 84. Account Set Validation

Validate:

* at least one include selector
* referenced OUs
* referenced accounts
* tag keys
* management-account rules
* deterministic deduplication
* account-set references if introduced
* recursive references either forbidden or cycle-checked

Prefer forbidding nested account-set references in v1.

---

# 85. Policy Validation

Validate:

* exactly one source
* valid JSON
* policy type supported by pinned provider
* target existence
* duplicate effective attachments
* required service principals
* policy tags

If a requested AWS policy type exists in AWS but not in the pinned provider, fail with:

```text
Policy type X is not supported by the pinned
@pulumi/aws version.
Upgrade the provider or choose a supported type.
```

---

# 86. Identity Center Validation

Validate:

* explicit Region
* valid identity source
* instance discovery succeeds
* principal references
* unique external principal lookup
* permission-set references
* assignment targets
* management-account assignment rules
* duplicate effective assignments

---

# 87. Deployment Validation

Validate:

* deployment IDs
* names
* template path
* template syntax
* template parameters
* capabilities
* Regions
* targets
* dependency references
* dependency cycles
* automatic-mode restrictions
* resolved-mode targeting
* one StackInstances owner
* retain settings
* template size
* dynamic-reference staging
* unsupported transforms
* nested stacks
* OU target count
* management-account configuration

---

# 88. State Strategy

Use one long-lived Pulumi stack for one AWS Organization.

Do not create:

```text
dev
staging
prod
```

copies of a single Organization unless they represent genuinely separate AWS Organizations.

---

# 89. State Backend

Support:

* Pulumi Cloud
* Pulumi DIY backend such as S3

Do not make framework source dependent on Pulumi Cloud-specific APIs.

---

# 90. Authentication

Normal development should use AWS IAM Identity Center credentials.

Example:

```bash
aws sso login \
  --profile org-admin

AWS_PROFILE=org-admin \
  pulumi preview

AWS_PROFILE=org-admin \
  pulumi up
```

Do not require long-lived access keys.

---

# 91. CI/CD

Pull requests should run:

```text
dependency install
typecheck
unit tests
configuration validation
Pulumi preview
```

Deployment requires an approved protected workflow.

Organization modifications must not auto-deploy from arbitrary branches.

---

# 92. Safe Deployment Command

Provide a repository script such as:

```bash
npm run deploy
```

which runs Pulumi with organization-safe defaults.

When account creation may occur, enforce safe Pulumi parallelism.

For example:

```text
pulumi up --parallel 5
```

or a stricter value.

The exact script should be documented and used consistently by CI.

---

# 93. Preview Safety

`pulumi preview` is mandatory before applying organization changes.

High-risk examples include:

```text
account replacement
account removal
OU deletion
OU move
SCP changes
service-access changes
Identity Center access removal
StackSet deletion
StackInstances deletion
management-account stack deletion
trusted-access deletion
```

---

# 94. Protected Resources

Protect at minimum:

```text
AWS Organization
member accounts
StackSets Organizations access
deployment artifact bucket
organization-wide StackSets
StackInstances
critical management-account stacks
```

Critical policies may also be protected through configuration.

---

# 95. Account Decommissioning

Deleting an account declaration is not a valid account-closing workflow.

Document:

```text
1. Remove or reduce Identity Center access.
2. Remove resolved deployments as intended.
3. Review StackSet retention behavior.
4. Remove special policies.
5. Preserve required data.
6. Move account to decommission/quarantine OU if used.
7. Review Pulumi preview.
8. Explicitly remove account protection.
9. Deliberately remove from Organization or perform account closure.
```

Normal `pulumi up` must not close accounts.

---

# 96. Drift

Console changes to IaC-owned resources are drift.

Operational guidance should use:

```bash
pulumi refresh
pulumi preview
```

but must also document provider-specific StackSet drift limitations.

No automatic adoption of unmanaged AWS resources.

Imports are deliberate.

---

# 97. Eventual Consistency

Organizations and Identity Center operations may exhibit propagation delay.

Rules:

* use Pulumi dependency edges first;
* use provider waiters;
* use AWS SDK waiters when needed;
* avoid arbitrary sleeps;
* document unavoidable cases;
* expose useful errors.

---

# 98. Testing Strategy

## Pure unit tests

Test:

```text
OU paths
OU depth
recursive traversal
AccountModel
Account Sets
tag matching
exclusions
deduplication
management account behavior
policy service-principal resolution
deployment-mode rules
dependency graph
cycle detection
quota validation
```

## Pulumi mock tests

Verify expected AWS resources and resource options.

## Live tests

Do not automatically create and destroy AWS Organizations during ordinary CI.

---

# 99. Required Behavioral Tests

## Nested OU expansion

Given:

```text
workloads
├── production
│   ├── prod-a
│   └── prod-b
└── development
    └── dev-a
```

Selecting:

```ts
{ ou: "workloads" }
```

returns:

```text
prod-a
prod-b
dev-a
```

---

## Account exclusion

Include:

```text
workloads
```

Exclude:

```text
prod-b
```

Result:

```text
prod-a
dev-a
```

---

## Tag selection

Selector:

```ts
{
  tag: {
    key:
      "Environment",

    value:
      "production",
  },
}
```

matches only configured production-tagged accounts.

---

## OU depth

A hierarchy exceeding AWS's supported depth fails before resource creation.

---

## Account deletion safety

Every member account uses:

```text
protect = true
closeOnDeletion = false
```

Tests must specifically document that removing protection plus deleting the Pulumi resource would remove the account from the Organization.

---

## Identity Center deduplication

OU plus explicit account overlap produces one assignment.

---

## Identity Center discovery

Ambiguous instance discovery must fail rather than choose array index zero.

---

## Automatic StackSet targeting

Automatic OU deployment uses native:

```text
organizationalUnitIds
```

and does not enumerate accounts.

---

## Unsafe automatic mode

The following must fail:

```text
automatic
+
tag selector
```

```text
automatic
+
account exclusion
```

```text
automatic
+
per-account parameters
```

---

## Resolved StackSet targeting

Resolved account sets must use service-managed Organization deployment targets.

Tests must verify that the implementation does not fall back to self-managed top-level `accounts` targeting.

---

## One owner

Attempting to create two plural `StackInstances` owners for the same StackSet must fail validation.

---

## Dependency graph

Dependencies produce:

```text
Pulumi dependsOn
+
native StackSet dependency
```

where applicable.

---

## Template handling

Small ordinary template:

```text
templateBody
```

Large or dynamic-reference template:

```text
S3
+
templateUrl
```

---

## NoEcho

A template containing `NoEcho` parameters triggers the framework's secret/ignoreChanges handling.

---

## Deployment deletion safety

Organization deployments are protected by default.

---

# 100. Example Configuration

Illustrative only:

```ts
export const organization:
  OrganizationDefinition = {

  accountDefaults: {
    roleName:
      "OrganizationAccountAccessRole",

    iamUserAccessToBilling:
      "DENY",

    tags: {
      ManagedBy:
        "pulumi",
    },
  },

  organizationalUnits: {
    security: {
      name:
        "Security",
    },

    workloads: {
      name:
        "Workloads",

      children: {
        production: {
          name:
            "Production",
        },

        development: {
          name:
            "Development",
        },
      },
    },

    sandbox: {
      name:
        "Sandbox",
    },
  },

  accounts: {
    security: {
      name:
        "security",

      email:
        "aws-security@example.com",

      organizationalUnit:
        "security",
    },

    production: {
      name:
        "production",

      email:
        "aws-production@example.com",

      organizationalUnit:
        "workloads/production",

      tags: {
        Environment:
          "production",

        BudgetThreshold:
          "500",
      },
    },

    development: {
      name:
        "development",

      email:
        "aws-development@example.com",

      organizationalUnit:
        "workloads/development",

      tags: {
        Environment:
          "development",

        BudgetThreshold:
          "200",
      },
    },
  },

  accountSets: {
    workloads: {
      include: [
        {
          ou:
            "workloads",
        },
      ],
    },

    development: {
      include: [
        {
          ou:
            "workloads/development",
        },
      ],
    },

    nonSandbox: {
      include: [
        {
          root:
            true,
        },
      ],

      exclude: [
        {
          ou:
            "sandbox",
        },
      ],
    },

    budgetManaged: {
      include: [
        {
          tag: {
            key:
              "BudgetThreshold",
          },
        },
      ],
    },
  },

  policies: {
    restrictRegions: {
      name:
        "RestrictRegions",

      type:
        "SERVICE_CONTROL_POLICY",

      file:
        "./policies/restrict-regions.json",

      targets: [
        {
          ou:
            "workloads",
        },
      ],

      tags: {
        ManagedBy:
          "organization-iac",
      },
    },
  },

  identityCenter: {
    region:
      "us-east-1",

    identitySource:
      "aws",

    groups: {
      administrators: {
        displayName:
          "Administrators",
      },

      developers: {
        displayName:
          "Developers",
      },
    },

    permissionSets: {
      administrator: {
        name:
          "Administrator",

        sessionDuration:
          "PT4H",

        managedPolicies: [
          "arn:aws:iam::aws:policy/AdministratorAccess",
        ],
      },

      developer: {
        name:
          "Developer",

        sessionDuration:
          "PT4H",
      },

      readOnly: {
        name:
          "ReadOnly",

        managedPolicies: [
          "arn:aws:iam::aws:policy/ReadOnlyAccess",
        ],
      },
    },

    assignments: [
      {
        principal:
          "administrators",

        permissionSet:
          "administrator",

        targets: {
          include: [
            {
              root:
                true,
            },
          ],

          includeManagementAccount:
            true,
        },
      },

      {
        principal:
          "developers",

        permissionSet:
          "developer",

        accountSet:
          "development",
      },
    ],
  },

  deployments: {
    administrationRegion:
      "us-east-1",

    definitions: {
      baseIam: {
        name:
          "base-iam",

        mode:
          "automatic",

        template:
          "./deployments/base-iam/template.yaml",

        capabilities: [
          "CAPABILITY_NAMED_IAM",
        ],

        targets: {
          include: [
            {
              ou:
                "workloads",
            },
          ],
        },

        regions: [
          "us-east-1",
        ],

        managedExecution:
          true,

        automaticDeployment: {
          retainOnAccountRemoval:
            false,
        },
      },

      monitoring: {
        name:
          "monitoring",

        mode:
          "automatic",

        template:
          "./deployments/monitoring/template.yaml",

        targets: {
          include: [
            {
              ou:
                "workloads",
            },
          ],
        },

        regions: [
          "us-east-1",
        ],

        dependsOn: [
          "baseIam",
        ],

        managedExecution:
          true,

        operationPreferences: {
          instanceOperations: {
            failureTolerancePercentage:
              10,

            maxConcurrentPercentage:
              25,

            regionConcurrencyType:
              "PARALLEL",
          },
        },

        automaticDeployment: {
          retainOnAccountRemoval:
            false,
        },
      },

      budgets: {
        name:
          "budgets",

        mode:
          "resolved",

        template:
          "./deployments/budgets/template.yaml",

        accountSet:
          "budgetManaged",

        regions: [
          "us-east-1",
        ],
      },
    },
  },
};
```

---

# 101. New Account Workflow

Adding:

```ts
analytics: {
  name:
    "analytics",

  email:
    "aws-analytics@example.com",

  organizationalUnit:
    "workloads/development",

  tags: {
    Environment:
      "development",
  },
}
```

should result in:

```text
Pulumi
  |
  +-- create AWS account
  |
  +-- place in Development OU
  |
  +-- inherited policies apply
  |
  +-- automatic StackSets follow OU
  |
  +-- Account Set membership recalculated
  |
  +-- Identity Center assignments created
  |
  +-- resolved deployments updated
```

---

# 102. Account Move Workflow

Changing:

```text
workloads/development
```

to:

```text
workloads/production
```

must result in:

```text
AWS account OU move

Organization policy inheritance changes

Identity Center target recalculation

automatic StackSet membership change

resolved deployment target recalculation
```

Preview should make Pulumi-owned consequences visible.

---

# 103. Features Explicitly Not Recreated

Do not recreate OrgFormation's annotated per-resource CloudFormation compiler.

Instead:

```text
central-logging deployment
security deployment
workload deployment
management deployment
```

are separate deployment definitions connected through dependencies and, later, explicit outputs.

---

# 104. Generic Task Runner Is Out of Scope

Do not implement a DSL for:

```text
shell commands
Terraform
CDK
Serverless Framework
generic scripts
arbitrary deployment tools
```

---

# 105. Phase 1: Project Foundation

Implement:

* TypeScript project
* Pulumi project
* strict mode
* provider pinning
* naming helpers
* aliases
* testing
* validation framework

### Acceptance

* typecheck passes
* tests execute
* provider version is pinned
* minimal config previews

---

# 106. Phase 2: Pure Organization Model

Implement:

* OU tree
* OU paths
* depth validation
* `AccountModel`
* account defaults
* target resolution

### Acceptance

Logical organization structure can be fully built and tested without Pulumi.

---

# 107. Phase 3: Account Sets

Implement:

* inclusion
* exclusion
* recursive OU resolution
* tag selectors
* management account handling
* deduplication
* deterministic ordering

### Acceptance

Account Sets reproduce supported OrgFormation-style binding behavior.

---

# 108. Phase 4: Organization Resources

Implement:

```text
Organization
OrganizationalUnit
Account
```

including safety settings.

### Acceptance

Greenfield Organization can be provisioned safely.

---

# 109. Phase 5: Organization Policies

Implement:

* provider-supported policy-type union
* policy parsing
* policy tags
* attachments
* policy-required service-principal resolver

### Acceptance

Policy/service-access ownership is unambiguous.

---

# 110. Phase 6: Organization Integrations

Implement:

* standalone service access
* delegated admins
* StackSets Organizations access

### Acceptance

Each service principal has exactly one owner.

---

# 111. Phase 7: Deployment Artifact and Template System

Implement:

* YAML/JSON parser
* parameter extraction
* NoEcho detection
* dynamic-reference detection
* transform detection
* nested-stack detection
* hash generation
* artifact bucket
* inline-vs-S3 decision
* provider-limit validation

### Acceptance

Templates are prepared correctly before StackSet creation.

---

# 112. Phase 8: Automatic Deployments

Implement:

* service-managed StackSet
* native OU/root targeting
* auto deployment
* managed execution
* capabilities
* dependencies
* operation preferences
* target limits
* deployment protection

### Acceptance

Future accounts entering targeted OUs receive deployments without Pulumi running.

---

# 113. Phase 9: Resolved Deployments

Implement:

* Account Set resolution
* service-managed targeting
* root plus `INTERSECTION` account filtering
* management-account direct stack
* deployment protection

### Acceptance

Arbitrary resolved Account Sets can be deployed without switching to self-managed StackSets.

---

# 114. Phase 10: Identity Center

Implement:

* bootstrap mode
* robust instance discovery
* AWS-managed identities
* external identity lookup
* permission sets
* policies
* assignments
* Account Set expansion
* dependency ordering

### Acceptance

OU/account-set access can be managed without hard-coded AWS account IDs.

---

# 115. Phase 11: Safety, CI, and Lifecycle

Implement:

* safe deployment command
* concurrency limits
* preview workflow
* account decommission documentation
* deployment decommission documentation
* StackSet drift caveats

### Acceptance

Routine automation cannot silently remove protected accounts or organization-wide deployments.

---

# 116. Phase 12: Per-Account Parameter Technical Spike

Before implementation, investigate and document:

* StackInstances parameter override ownership
* Pulumi drift limitations
* update semantics
* resolved-target behavior
* one-owner invariant
* management-account behavior

Only after the technical design is approved should implementation begin.

---

# 117. Phase 13: Cross-Deployment Output Technical Design

Define:

* output API
* role model
* cross-account security
* dependency semantics
* lookup strategy
* failure behavior

Implementation follows only after design approval.

---

# 118. v1 Definition of Done

## Organization

* [ ] Organization created with required features.
* [ ] Nested OUs supported.
* [ ] OU depth validated.
* [ ] OU tags supported.
* [ ] Accounts supported.
* [ ] Account defaults supported.
* [ ] Account tags supported.
* [ ] Account creation settings distinguished from mutable settings.
* [ ] Accounts protected.
* [ ] `closeOnDeletion` false.
* [ ] Account removal semantics documented.

## Account Sets

* [ ] Named Account Sets.
* [ ] Recursive OU inclusion.
* [ ] Account inclusion.
* [ ] OU exclusion.
* [ ] Account exclusion.
* [ ] Tag-key matching.
* [ ] Tag key/value matching.
* [ ] Deduplication.
* [ ] Management account excluded by default.
* [ ] Explicit management inclusion.

## Policies

* [ ] Policy types derived from pinned provider.
* [ ] Unsupported policy types fail cleanly.
* [ ] File policies.
* [ ] Object policies.
* [ ] Tags.
* [ ] Root targeting.
* [ ] OU targeting.
* [ ] Account targeting.
* [ ] Policy-required service principals resolved.
* [ ] No duplicate service-access ownership.

## Identity Center

* [ ] Organization instance discovered safely.
* [ ] Ambiguous discovery fails.
* [ ] Region explicit.
* [ ] AWS-managed groups.
* [ ] AWS-managed users.
* [ ] External group lookup.
* [ ] External user lookup where supported.
* [ ] Principal ID escape hatch.
* [ ] Permission sets.
* [ ] Managed policies.
* [ ] Inline policies.
* [ ] Assignments.
* [ ] Account Set expansion.
* [ ] Assignment deduplication.

## Deployments

* [ ] Automatic mode.
* [ ] Resolved mode.
* [ ] Service-managed StackSets.
* [ ] Automatic native OU targeting.
* [ ] Resolved service-managed `INTERSECTION` targeting.
* [ ] No self-managed account targeting.
* [ ] One StackInstances owner per StackSet.
* [ ] Management-account direct stack.
* [ ] Capabilities.
* [ ] Multi-region support.
* [ ] Managed execution.
* [ ] Separate operation preference layers.
* [ ] Pulumi dependencies.
* [ ] Native StackSet future-account dependencies.
* [ ] S3 template staging.
* [ ] Dynamic-reference detection.
* [ ] Template parameter parsing.
* [ ] NoEcho handling.
* [ ] Template restrictions.
* [ ] Provider size-limit validation.
* [ ] OU target-limit validation.
* [ ] Explicit retain-on-account-removal.
* [ ] Deployment deletion lifecycle.
* [ ] StackSet resources protected.

## Safety and Operations

* [ ] Organization protected.
* [ ] Accounts protected.
* [ ] StackSets trusted access protected.
* [ ] Artifact store protected.
* [ ] Deployments protected.
* [ ] Safe account-creation parallelism.
* [ ] Preview CI.
* [ ] Account decommission workflow.
* [ ] Deployment decommission workflow.
* [ ] StackSet drift limitation documented.

---

# 119. Critical Rules for Coding Agents

1. Do not add Control Tower.

2. Do not add Terraform.

3. Do not wrap the organization project in SST.

4. Use the pinned `@pulumi/aws` provider as the primary AWS provider.

5. Do not assume AWS API features automatically exist in the pinned Pulumi provider.

6. Do not use raw AWS IDs in normal human-authored configuration when a logical reference can resolve them.

7. Do not automatically close AWS accounts.

8. Do not assume `closeOnDeletion: false` means deletion is harmless.

9. Keep AWS account resources protected.

10. Treat `roleName` and `iamUserAccessToBilling` as account creation settings.

11. Do not hard-code OU or account topology into framework code.

12. Implement Account Sets as a first-class model.

13. Keep Account Set resolution independent of Pulumi.

14. Use `AccountModel` for pure logic and `AccountContext` only at runtime.

15. Do not ask developers to enumerate account IDs for Identity Center OU assignments.

16. Do not blindly select the first Identity Center instance returned.

17. Resolve and validate the active organization Identity Center instance.

18. Prefer external principal lookup by meaningful unique attributes over opaque IDs where safe.

19. Keep explicit principal IDs available as an escape hatch.

20. Maintain exactly one owner for each Organizations service principal.

21. Do not use standalone `AwsServiceAccess` for principals already owned by `Organization.awsServiceAccessPrincipals`.

22. Derive policy-required service principals from enabled policy configuration.

23. Use service-managed StackSets.

24. Do not use self-managed top-level StackSet account targeting for resolved deployments.

25. Use Organizations deployment targets and account filtering for resolved deployments.

26. Use native OU targets for automatic deployments.

27. Do not combine automatic deployment with account filters, exclusions, tag selectors, or per-account parameters.

28. Maintain exactly one plural `StackInstances` owner per StackSet.

29. Protect StackSet and StackInstances resources by default.

30. Do not conflate account-leaves-OU retention with deployment-deletion retention.

31. Do not change `retainStacks` and destroy StackInstances in the same unreviewed operation.

32. Expose CloudFormation IAM capabilities explicitly.

33. Do not expose macro expansion capability while transforms/macros remain prohibited.

34. Parse CloudFormation parameters before StackSet creation.

35. Handle `NoEcho` provider behavior centrally.

36. Prefer secret references over plaintext secret StackSet parameters.

37. Force S3 `TemplateUrl` where template content or provider behavior requires it.

38. Validate template sizes against the pinned provider, not only against AWS API limits.

39. Use both Pulumi dependencies and native StackSet dependencies for automatic deployments.

40. Keep StackSet update preferences separate from stack-instance operation preferences.

41. Validate OU depth and StackSet target limits before creating resources.

42. Constrain account-creation concurrency.

43. Do not assume `pulumi refresh` provides complete StackSet target drift detection.

44. Do not implement per-account parameter overrides until the dedicated technical spike is complete.

45. Do not implement cross-account outputs until their security design is approved.

46. Do not recreate OrgFormation's annotated CloudFormation compiler.

47. Do not recreate OrgFormation's generic task runner.

48. Do not introduce arbitrary sleeps where provider or AWS waiters can solve propagation delays.

49. Fail on ambiguous or unsupported behavior rather than guessing.

50. If current AWS or Pulumi behavior conflicts with this PRD, verify the current documentation/API, document the conflict, and follow verified platform behavior rather than inventing a workaround.

---

# 120. Final Product Experience

The framework should allow developers to think primarily in terms of:

```text
Organization
OUs
Accounts
Account Sets
Policies
Identity Access
Deployments
```

instead of:

```text
AWS account IDs
OU IDs
StackSet instance IDs
SSO assignment IDs
manual execution roles
manual cross-account deployment
```

A normal change should be:

```text
Edit typed TypeScript
        |
        v
Run validation/tests
        |
        v
pulumi preview
        |
        v
Review
        |
        v
pulumi up
```

Creating or moving an account should naturally cause the rest of the desired organization model to converge:

```text
Account configuration
       |
       v
AWS Organizations
       |
       +-- OU placement
       |
       +-- policy inheritance
       |
       +-- Account Set membership
       |      |
       |      +-- Identity Center assignments
       |      |
       |      +-- resolved deployments
       |
       +-- automatic StackSet targeting
              |
              +-- organization deployments
```

The project is successful when this provides the organization-aware ergonomics that made OrgFormation useful while relying on maintained Pulumi and AWS primitives rather than an abandoned custom framework.

