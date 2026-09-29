# AGENTS.md - AWS Organization as Code

This file provides guidance for AI coding agents working in this repository.

## Core Principles

**KISS and YAGNI above all else.**

- **KISS (Keep It Simple, Stupid)**: Always choose the simplest solution that works. Avoid over-engineering, unnecessary abstractions, and clever code. If a simple function solves the problem, don't create a class hierarchy. If a local variable works, don't reach for state management.

- **YAGNI (You Aren't Gonna Need It)**: Only implement what is explicitly required right now. Do not add features, abstractions, or flexibility "for the future." No speculative generalization. No "just in case" code.

When in doubt: fewer files, fewer abstractions, fewer lines of code. Resist the urge to build frameworks when scripts will do.

Feature workflow reference: `docs/development-flow.md` (`/session-init` -> `/prd` -> `/refine-prd` -> `/prd-breakdown` -> `/session-plan` -> implement -> `/session-save` -> `/pr`).

---

## Project Overview

A TypeScript framework for managing an AWS Organization as code using Pulumi. It
replaces OrgFormation: organizational units, accounts, service control
policies, Identity Center, and organization-wide CloudFormation deployments are
declared in TypeScript and applied through Pulumi preview/up.

- **Language**: TypeScript (strict mode)
- **IaC**: Pulumi — `@pulumi/pulumi` + `@pulumi/aws`
- **Escape hatch**: AWS SDK for JavaScript v3, used only where `@pulumi/aws`
  lacks an operation or exposes insufficient metadata for safe discovery
- **State**: one long-lived Pulumi stack per AWS Organization, on Pulumi Cloud
  or a DIY (S3) backend

### Non-Goals

Do not introduce the following without a separate architecture decision:

```text
OrgFormation
Terraform CLI
CDKTF
AWS Control Tower
AFT (Account Factory for Terraform)
Landing Zone Accelerator
SST
```

Also out of scope:

- Nunjucks templating, custom `!Sub`/`!Join`, generic `Foreach`
- Shell / Terraform / Serverless / CDK task execution
- Annotated per-resource CloudFormation compiler recreation
- Generic task runners, generic CI/CD frameworks, CloudFormation preprocessors
- Automatic dev/staging/prod copies of one AWS Organization

SST applications, if they ever exist, remain separate infrastructure and state
boundaries.

---

## Build/Lint/Test Commands

```bash
# Setup
pnpm install

# Code quality
pnpm typecheck                # tsc --noEmit
pnpm lint                     # ESLint
pnpm lint:fix
pnpm format                   # Prettier

# Tests
pnpm test:unit                # Pure unit tests (fast, no Pulumi runtime)
pnpm test:mock                # Pulumi mock tests (setMocks)
pnpm test                     # Both

# Single test
pnpm vitest run src/model/account-sets.unit.test.ts
pnpm vitest run -t "test name pattern"

# Pulumi
pulumi preview
pulumi up
pnpm deploy                   # pulumi up with org-safe defaults

# Config validation (no AWS calls)
pnpm validate
```

### Running a Single Test

```bash
# Pure unit
pnpm vitest run src/model/ou-paths.unit.test.ts

# Pulumi mock
pnpm vitest run src/organization/accounts.mock.test.ts

# By name pattern
pnpm vitest run -t "should expand nested OUs recursively"
```

**Test file naming**: `*.unit.test.ts` (pure logic), `*.mock.test.ts`
(Pulumi `setMocks`).

**Testing guide**: See `TESTS.md` for tier selection, the Pulumi mock pattern,
and the required behavioral test suite.

---

## Core Architecture

Five conceptual layers. Code must flow downward, never upward.

```text
1. User configuration                 config/
        |
        v
2. Schema + semantic validation       src/validation/
        |
        v
3. Pure organization model             src/model/
        +-- OU graph
        +-- accounts
        +-- AccountModel
        +-- account sets
        +-- target resolution
        +-- dependency graph
        |
        v
4. Pulumi runtime model               src/runtime/
        +-- AccountContext
        +-- Pulumi Outputs
        +-- ComponentResources
        |
        v
5. AWS resources                      src/organization/, src/policies/, ...
```

### The Purity Rule

**Target resolution, account-set evaluation, OU traversal, dependency
analysis, and most validation must not depend on Pulumi.**

Files under `src/model/` and `src/validation/` must not import from
`@pulumi/pulumi` or `@pulumi/aws`. They operate on plain data:

```typescript
// src/model/account-model.ts — correct, no Pulumi
export interface AccountModel {
  key: string;
  displayName: string;
  email: string;
  ouPath: string;
  tags: Record<string, string>;
}
```

```typescript
// src/model/account-model.ts — WRONG, Pulumi has leaked into the model
import * as pulumi from "@pulumi/pulumi";
import { aws } from "@pulumi/aws";

export interface AccountModel {
  key: string;
  id: pulumi.Output<string>; // forbidden here
  org: aws.organizations.Organization; // forbidden here
}
```

AWS IDs belong in the runtime layer, which extends the model:

```typescript
// src/runtime/account-context.ts — correct
export interface AccountContext extends AccountModel {
  id: pulumi.Output<string>;
}
```

The payoff is testability: the entire logical organization structure must be
buildable and testable without Pulumi. If a pure-model function needs an
AWS account ID to make a decision, that's a design error — resolve the account
to its logical key and pass that instead.

---

## Provider Version Policy

The `@pulumi/aws` version is pinned through the lockfile and **governs what
this framework supports.**

```text
Rule 1: Type unions must reflect the PINNED PROVIDER's supported values.
Rule 2: If AWS supports a feature but the pinned provider does not,
        configuration requesting it must FAIL EXPLICITLY.
Rule 3: Do NOT silently introduce @pulumi/aws-native to fill provider gaps.
Rule 4: Provider upgrades are reviewed as infrastructure changes.
```

This matters because AWS adds Organizations policy types and CloudFormation
capabilities before `@pulumi/aws` exposes them. Behavior follows the pinned
provider, not the AWS API.

```typescript
// Correct — explicit failure with upgrade guidance
if (!SUPPORTED_POLICY_TYPES.includes(policy.type)) {
  throw new Error(
    `Policy type "${policy.type}" is not supported by @pulumi/aws ` +
      `${PINNED_AWS_VERSION}. Supported types: ${SUPPORTED_POLICY_TYPES.join(', ')}. ` +
      `Upgrade @pulumi/aws or choose a supported type.`
  );
}
```

Never hardcode AWS limits or provider unions inline. Derive them from the
pinned provider, or centralize them in one module that a version bump updates
in one place.

---

## Stable Logical Identifiers

Every managed object has two identifiers, and they are not the same thing:

1. A **stable TypeScript logical key** — the framework's identity for the object
2. An **AWS-visible display name** — what operators see in the console

Pulumi resource names derive from the logical key, never from the display name
and never from a raw AWS ID.

```typescript
// config/organization.ts
export const organization = {
  organizationalUnits: {
    workloads: {
      displayName: 'Workloads',
      children: {
        production: { displayName: 'Production' },
      },
    },
  },
};
```

Logical OU paths are derived deterministically from config keys
(`workloads/production`) and are what policies, account sets, assignments, and
deployments reference.

```typescript
// Correct — logical reference
policy.attachments: [{ target: { ou: 'workloads/production' } }]

// WRONG — raw AWS ID in human-authored config
policy.attachments: [{ target: { ouId: 'ou-abc1-xyz987' } }]
```

Raw AWS IDs in config only when a logical reference genuinely cannot resolve.

---

## Safety Rules

These are not defaults to override casually. They exist because the failure
mode is an entire AWS account or an organization-wide infrastructure outage.

### Protection Defaults

Protect at minimum (Section 94):

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

```typescript
// The Organization resource
new aws.organizations.Organization('Organization', {
  featureSet: 'ALL',
  protect: true,
});
```

A routine `pulumi destroy` must fail before destroying organization-critical
resources.

### Account Safety

Every member account uses:

```typescript
new aws.organizations.Account(`Account-${key}`, {
  // ...
  closeOnDeletion: false,
}, {
  protect: true,
});
```

**`closeOnDeletion: false` does NOT mean deletion is a no-op.** If Pulumi
deletes the resource, AWS removes the account from the Organization while
leaving the AWS account itself open. `protect: true` is therefore the primary
guard against ordinary account removal.

- Accounts must be protected by default
- Ordinary refactoring must never automatically unprotect accounts
- Removing an account declaration must produce a protected-resource failure,
  not a silent removal from the Organization
- Account decommissioning requires the explicit 9-step procedure below

### Account Decommissioning

Deleting an account declaration is **not** an account-closing workflow. The
documented procedure:

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

Normal `pulumi up` must never close accounts.

### Preview Is Mandatory

`pulumi preview` is required before applying organization changes. Review with
extra care when the preview contains:

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

### Deployments Are Protected By Default

StackSets, StackInstances, and management-account stacks are protected.
Ordinary refactoring must not destroy organization-wide infrastructure.

Two distinct lifecycles, do not conflate them:

- **Account leaves a targeted OU** — deployment stays, StackInstances follow the
  account
- **Deployment is deleted from Pulumi** — requires a staged retain workflow

The retain workflow is staged, never same-operation:

```text
1. Set retain behavior.
2. pulumi up.
3. Verify retention.
4. Unprotect.
5. Remove declaration.
6. pulumi up.
```

Never combine a retain-behavior change with a destroy in one operation.

---

## Validation Quality Bar

Validate the complete logical model **before** constructing dependent
resources, wherever possible. Errors must be actionable — name the exact
account set, OU path, account, or policy at fault.

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

```typescript
// Correct — names the offending reference
throw new Error(
  `Account set "${setName}" references OU "${ouPath}", ` +
    `but no OU exists with that logical path.`
);
```

Validation must catch problems that are cheap to fix in the pure model and
expensive to fix after AWS has created half the resources. OU depth exceeding
AWS's supported maximum is the canonical example: it fails in
`src/validation/` before any `OrganizationalUnit` resource is constructed.

---

## Eventual Consistency

Organizations and Identity Center operations exhibit propagation delay.
Handle it explicitly, never by guessing:

- Use Pulumi dependency edges first (`dependsOn`, implicit references)
- Use provider waiters
- Use AWS SDK waiters when the provider lacks one
- **Avoid arbitrary sleeps**
- Document unavoidable cases
- Expose useful errors

```typescript
// Wrong — hides the real problem and is slow
await new Promise((resolve) => setTimeout(resolve, 30_000));

// Right — declare the dependency, let Pulumi order the graph
new aws.organizations.OrganizationalUnit('Production', args, {
  dependsOn: [parentOu],
});
```

---

## Drift

Console changes to IaC-owned resources are drift. Operational guidance:

```bash
pulumi refresh
pulumi preview
```

- Document provider-specific StackSet drift limitations. `pulumi refresh` is
  useful but insufficient for auditing StackSet targets — do not claim full
  drift coverage
- No automatic adoption of unmanaged AWS resources
- Imports are deliberate

---

## Secret Handling

CloudFormation parameters marked `NoEcho: true` require special handling.
Centralize this behavior in the framework rather than requiring every
deployment author to know the provider-specific rule.

```typescript
// Correct — framework applies ignoreChanges automatically where required
{
  ignoreChanges: noEchoParameters,
}
```

Rules:

- Prefer secret references (Secrets Manager, SSM Parameter Store,
  CloudFormation dynamic references) over passing plaintext secret values
  through StackSet parameters
- If Pulumi secret values must flow as parameters, preserve Pulumi secret
  semantics and document any unavoidable CloudFormation exposure
- Never leak secret parameter values into previews or logs

---

## Code Style Guidelines

### Prettier & ESLint

- Semi: true, single quotes, trailing commas (es5), 80 char line width
- Unused vars are errors (prefix with `_` to ignore)
- `@typescript-eslint/no-explicit-any` is a warning

### Import Order

```typescript
// 1. External dependencies
import { aws } from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

// 2. Internal imports with path aliases
import { validateOrganization } from '@/validation/organization';
import { buildOrganizationModel } from '@/model/organization-model';
```

**Path aliases**: `@/*` → `./src/*`

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Functions / variables | camelCase | `resolveAccounts` |
| Types / interfaces | PascalCase | `AccountModel` |
| Files | kebab-case | `account-sets.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_OU_DEPTH` |
| Pulumi resource names | derived from logical key | `Account-${accountKey}` |

### Component Pattern

```typescript
// Interface before component
export interface AccountsOptions {
  accounts: AccountDefinition[];
}

// Named export (primary)
export function Accounts({ accounts }: AccountsOptions) {
  // ...
}
```

### Pulumi Resource Pattern

```typescript
// GOOD — logical key drives the Pulumi name, safety options are explicit
export function Account(
  { key, displayName, email, roleName }: AccountOptions,
  { org }: RuntimeContext
) {
  return new aws.organizations.Account(`Account-${key}`, {
    email,
    name: displayName,
    roleName,
    parentId: org.ouId,
  }, {
    protect: true,
  });
}
```

### Validation Pattern

Validators are pure functions returning structured errors. They never throw
bare strings and never import Pulumi.

```typescript
export interface ValidationError {
  code: string;
  message: string;
  reference?: string;
}

export function validateAccountSets(
  model: OrganizationModel
): ValidationError[] {
  const errors: ValidationError[] = [];
  // ...
  return errors;
}
```

---

## Directory Structure

```
.
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── Pulumi.yaml
├── README.md
│
├── config/                     # User configuration
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
│   ├── types/                  # Type definitions and schemas
│   │   ├── organization.ts
│   │   ├── accounts.ts
│   │   ├── targets.ts
│   │   ├── policies.ts
│   │   ├── identity-center.ts
│   │   └── deployments.ts
│   │
│   ├── model/                  # Pure — NO PULUMI IMPORTS
│   │   ├── organization-model.ts
│   │   ├── account-model.ts
│   │   ├── ou-paths.ts
│   │   ├── account-sets.ts
│   │   ├── target-resolver.ts
│   │   └── dependency-graph.ts
│   │
│   ├── runtime/                # Pulumi runtime model
│   │   └── account-context.ts
│   │
│   ├── validation/             # Pure — NO PULUMI IMPORTS
│   │   ├── organization.ts
│   │   ├── account-sets.ts
│   │   ├── policies.ts
│   │   ├── identity-center.ts
│   │   ├── deployments.ts
│   │   └── quotas.ts
│   │
│   ├── naming/
│   │   └── resource-names.ts
│   │
│   ├── organization/           # AWS Organizations resources
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
│   └── deployments/
│       ├── deployment.ts
│       ├── automatic-deployment.ts
│       ├── resolved-deployment.ts
│       ├── management-account.ts
│       ├── dependencies.ts
│       ├── template-parser.ts
│       ├── parameters.ts
│       ├── artifacts.ts
│       └── decommission.ts
│
├── policies/
│   └── *.json
│
└── deployments/
    └── */
        └── template.yaml
```

### File Placement Rules

| Code | Location | Constraint |
|------|----------|-------------|
| Target resolution, account-set evaluation, OU traversal, dependency analysis | `src/model/` | **No Pulumi imports** |
| Schema + semantic validation | `src/validation/` | **No Pulumi imports** |
| `AccountContext`, Outputs, ComponentResources | `src/runtime/` | Pulumi allowed |
| AWS resource construction | `src/{organization,policies,identity-center,integrations,deployments}/` | Pulumi required |
| Pure model type definitions | `src/types/` | **No Pulumi imports** |

### Test Placement

Tests are colocated with the code they test, matching the source path:

```text
src/model/account-sets.unit.test.ts        # pure
src/model/account-sets.mock.test.ts        # Pulumi mocks, if needed
src/organization/accounts.mock.test.ts     # resource + options assertions
```

A global `test/` directory is not used. Section 99's required behavioral tests
are pure logic and live next to their implementation.

---

## Environment

- Node.js 22+, pnpm 10.x (see `packageManager` field)
- **Always use pnpm** (not npm or yarn)
- **Before running pnpm**, ensure fnm is initialized:
  ```bash
  eval "$(fnm env --use-on-cd --shell bash)"
  ```
- AWS credentials come from IAM Identity Center, not long-lived access keys:
  ```bash
  aws sso login --profile org-admin
  AWS_PROFILE=org-admin pulumi preview
  ```

---

## CI/CD

Pull requests run:

```text
dependency install
typecheck
unit tests
Pulumi mock tests
configuration validation
Pulumi preview
```

Deployment requires an approved protected workflow. Organization modifications
must not auto-deploy from arbitrary branches.

Do not automatically create and destroy AWS Organizations during ordinary CI.

---

## Common Patterns

**New Organizational Unit**:
1. Add the OU to `config/organization.ts` with a stable logical key
2. Depth and duplicate-path validation runs automatically in `src/validation/`
3. Logical path derives from the key path — use it in policies, sets, deployments

**New Account Selector or Account Set**:
1. Extend the `AccountSelector` union in `src/types/targets.ts`
2. Implement evaluation in `src/model/account-sets.ts` (pure)
3. Add validation in `src/validation/account-sets.ts` (pure)
4. Add unit tests covering inclusion, exclusion, dedupe, and management-account rules

**New AWS Resource**:
1. Add it under the capability directory (`src/policies/`, etc.)
2. Derive the Pulumi resource name from the logical key via `src/naming/`
3. Apply protection defaults and `dependsOn` where ordering matters
4. Add a `*.mock.test.ts` asserting the resource type, inputs, and options

**New Validation Rule**:
1. Add it to the relevant validator in `src/validation/`
2. Return a `ValidationError` with a `reference` naming the exact offender
3. Add a unit test asserting both the failure and the error message