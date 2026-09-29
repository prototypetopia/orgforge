# Testing Instructions

You are writing tests for a TypeScript + Pulumi framework that manages an AWS
Organization as code.

## Goal

- Write accurate, runnable tests in this repo's established style.
- Tests must be derived from actual implementation code, not assumptions.
- Optimize for correctness and reproducibility over speed or creativity.

## Primary Rules

- Do not write tests from assumptions. First inspect the code that implements
  the behavior, then derive the test from that code.
- **The pure model is the product.** Target resolution, account-set evaluation,
  OU traversal, dependency analysis, and most validation must be testable
  without Pulumi. If a test needs mocks to exercise that logic, the logic is in
  the wrong layer — move it to `src/model/` or `src/validation/`.
- **Pulumi mock tests are the only sanctioned mocking mechanism.** They are for
  asserting which AWS resources get constructed and with which options. They are
  not a substitute for unit tests of pure logic.
- **Never create or destroy a live AWS Organization in ordinary CI.** There is no
  live-test tier in this repo, and adding one is a scope decision, not a test
  decision.

---

## Test Tiers

This codebase uses two tiers.

### Unit Tests (`*.unit.test.ts`)

Test pure logic with no Pulumi runtime and no AWS calls. These are the
primary confidence driver — the large majority of this framework's behavior is
pure by design.

**Test:**

```text
OU paths
OU depth
recursive traversal
AccountModel construction and defaults
Account selector evaluation (root / ou / account / tag)
account sets: inclusion, exclusion, deduplication, deterministic ordering
management-account behavior
tag matching by key and key/value
policy service-principal resolution
deployment-mode rules and automatic-mode restrictions
template parsing and artifact selection
dependency graph and cycle detection
quota validation
all validators in src/validation/
```

**These tests must NOT:**

- import `@pulumi/pulumi` or `@pulumi/aws`
- construct any Pulumi resource
- make AWS calls or require credentials
- use `vi.mock()` to stub out the code under test

**Entrypoint:** individual pure functions.

### Pulumi Mock Tests (`*.mock.test.ts`)

Test that the framework constructs the **expected AWS resources with the
expected inputs and options** — without calling AWS. A mock test runs the real
Pulumi runtime: real `ComponentResource` construction, real dependency graph,
real option merging, real `Output` resolution. Only the AWS API calls are
stubbed.

**Test:**

```text
which resource types are created
resource inputs (logical key -> Pulumi name mapping)
protect options on org-critical resources
closeOnDeletion: false on member accounts
dependsOn edges where ordering matters
StackSet targeting shape (organizationalUnitIds vs organizationsTargets)
exactly one plural StackInstances owner per StackSet
templateBody vs S3 templateUrl selection
ignoreChanges applied for NoEcho parameters
delegated administrator and service-access wiring
```

**These tests must NOT:**

- assert on logical-model behavior (that is a unit test with the wrong filename)
- hit AWS
- combine "expect resources were created" with "expect no resources were
  created" in the same file (see the setMocks caveat below)

**Entrypoint:** the resource-constructing function or component.

---

## Choosing the Right Tier

If the code you are testing lives in `src/model/` or `src/validation/`, it is a
unit test. If it constructs a Pulumi resource, it is a mock test. If it does
both, split the test.

| Code Under Test | Tier |
|---|---|
| OU path derivation | Unit |
| OU depth validation | Unit |
| Recursive OU traversal | Unit |
| `AccountModel` construction, account defaults | Unit |
| Account selector evaluation | Unit |
| Account set inclusion / exclusion / dedupe | Unit |
| Tag matching | Unit |
| Management-account inclusion rules | Unit |
| Policy service-principal resolution | Unit |
| Deployment-mode rules, automatic-mode restrictions | Unit |
| Template parsing, parameter extraction | Unit |
| Artifact selection (inline vs S3) | Unit |
| Dependency graph, cycle detection | Unit |
| Quota validation | Unit |
| Any validator in `src/validation/` | Unit |
| Resource type created for an OU / account / policy | Mock |
| Pulumi resource name derived from logical key | Mock |
| `protect: true` / `closeOnDeletion: false` options | Mock |
| `dependsOn` edge present | Mock |
| StackSet targeting shape | Mock |
| `ignoreChanges` for NoEcho parameters | Mock |

---

## Required Discovery Steps Before Writing Any Test

1. Read the implementation file under test.
2. Read nearby test files in the same directory (both suffixes).
3. Read the types, schemas, and constants that define the inputs.
4. For mock tests, read the resource-constructing code and note which options it
   passes.
5. Read `AGENTS.md` for the layer placement rules — if the code under test is in
   `src/model/` or `src/validation/` and the test needs Pulumi, something is
   wrong.

## Do Not Guess Any Of The Following

- OU logical paths
- Account logical keys or display names
- Which Pulumi resource names are produced
- Which options a resource is constructed with
- Pinned-provider type unions and limits
- Account selector and account-set evaluation semantics
- Deduplication and ordering guarantees
- Management-account default behavior
- Deployment-mode restrictions
- Template size limits and artifact-selection thresholds
- Dependency-count and OU-target limits
- Error types or error messages

If a value is unclear, derive it from the implementation under test, or from
nearby tests and constants. If it still cannot be derived, explicitly state
what is missing instead of inventing it.

---

## Repo Conventions (All Tiers)

- **Framework:** Vitest with `describe`, `it`, `beforeAll`, `afterAll`,
  `beforeEach`, `afterEach`, `expect`.
- **File naming:** `<module>.unit.test.ts` or `<module>.mock.test.ts`.
- **Colocation:** test files live next to the code they test. There is no
  global `test/` directory.
- **TypeScript:** strict mode, single quotes, repo import style.
- **Path aliases:** `@/*` → `./src/*`.
- **Credentials:** unit tests need none. Mock tests need none — `setMocks`
  intercepts before any AWS call.

### Describe Style

```typescript
// Top-level suite
describe('When <context>', () => {
  // Scenario suite
  describe('and <condition>', () => {
    // Example
    it('should <expected behavior>', () => {
```

Examples: `describe('When resolving an account set')`,
`describe('and the set excludes an account in the included OU')`,
`it('should return the remaining accounts in deterministic order')`.

### Test Flow Pattern (ARRANGE, ACT, ASSERT)

```typescript
describe('When validating account set references', () => {
  describe('and the set references an OU that does not exist', () => {
    it('should return an error naming the account set and OU path', () => {
      // ARRANGE
      const model = buildModel({
        accountSets: [
          {
            key: 'productionServices',
            include: [{ ou: 'workloads/prod' }],
          },
        ],
        organizationalUnits: { workloads: { displayName: 'Workloads' } },
      });

      // ACT
      const errors = validateAccountSets(model);

      // ASSERT
      expect(errors).toHaveLength(1);
      expect(errors[0].reference).toBe('productionServices');
      expect(errors[0].message).toContain('workloads/prod');
    });
  });
});
```

**Arrange verification trade-off:** assertions about the fixture itself are
noise. Build the smallest model that exercises the behavior and assert only on
what the function under test produced. Verify the fixture once in a dedicated
test if its shape matters.

### Unique Test Data

Use distinct logical keys per test so parallel runs cannot collide:

```typescript
const key = `test-ou-${crypto.randomUUID()}`;
```

Do not hardcode identifiers that could collide across runs.

---

## Unit Test Instructions

Unit tests need no special infrastructure. Build inputs as plain objects,
call the pure function, assert on the result.

### Schema Validation Tests

```typescript
describe('When validating an account definition', () => {
  describe('and the email is missing', () => {
    it('should return a validation error referencing the account key', () => {
      // ARRANGE
      const definition = { key: 'prod-a', displayName: 'Prod A' };

      // ACT
      const result = validateAccount(definition);

      // ASSERT
      expect(result.ok).toBe(false);
    });
  });
});
```

### Error Path Testing

Validation returns structured errors — assert on the `reference` field, which
is what makes the message actionable:

```typescript
expect(errors[0]).toMatchObject({
  code: 'UNRESOLVED_OU_REFERENCE',
  reference: 'productionServices',
});
```

Assert on the specific fields the production code produces. Do not assert on a
whole error message unless the message is itself the contract.

---

## Pulumi Mock Test Instructions

### The setMocks Caveat

`pulumi.runtime.setMocks` installs mocks on the runtime instance — it is
**module-global state**, not per-call. Vitest isolates module registries per
test file, so mocks do not leak across files, but within a file you get exactly
one runtime configuration.

Consequence: a single mock test file must consistently either assert resources
were created or assert a validation failure prevented creation. Mixing both is
incoherent. Split them.

### Mock Test Pattern

```typescript
import { aws } from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildAccounts } from '@/organization/accounts';

// Resolve an Output to its plain value.
// setMocks returns plain values, but they surface as Outputs.
function promiseOf<T>(output: pulumi.Output<T>): Promise<T> {
  return new Promise((resolve) => output.apply(resolve));
}

let resources: { type: string; name: string; inputs: unknown }[] = [];

beforeEach(() => {
  resources = [];

  pulumi.runtime.setMocks(
    {
      newResource: (args: pulumi.runtime.MockResourceArgs) => {
        resources.push({
          type: args.type,
          name: args.name,
          inputs: args.inputs,
        });
        return {
          id: `${args.name}-id`,
          state: { ...args.inputs, arn: `arn:${args.name}` },
        };
      },
      call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
    },
    'organization',
    'test',
    false
  );
});

describe('When creating member accounts', () => {
  describe('and an account is declared', () => {
    it('should create an aws.organizations.Account named from the logical key', async () => {
      // ARRANGE
      const accounts = [{ key: 'prod-a', displayName: 'Prod A', email: 'a@example.com', roleName: 'Admin' }];

      // ACT
      buildAccounts({ accounts, parentId: pulumi.output('ou-root') });
      await pulumi.all([]).apply(() => undefined);

      // ASSERT
      const account = resources.find((r) => r.type === 'aws:organizations/account:Account');
      expect(account?.name).toBe('Account-prod-a');
    });
  });
});
```

### Asserting Resource Options

Safety options are behavioral contracts, not implementation detail. Assert them
explicitly — they are the difference between a refactor being safe and being
destructive:

```typescript
describe('and the account resource is created', () => {
  it('should protect the account and disable closeOnDeletion', async () => {
    // ARRANGE + ACT
    buildAccounts({ accounts: [account], parentId: pulumi.output('ou-root') });
    await pulumi.all([]).apply(() => undefined);

    // ASSERT
    const registered = resources.find(
      (r) => r.type === 'aws:organizations/account:Account'
    );
    expect(registered?.inputs).toMatchObject({ closeOnDeletion: false });
  });
});
```

When the framework passes `protect` and `dependsOn` through resource options
rather than inputs, capture them from a `MockResourceArgs`-shaped recorder or
assert the exported policy helper the implementation uses. Read the
implementation first and assert what it actually produces — do not guess.

### Asserting Dependency Edges

```typescript
describe('and a child OU is declared', () => {
  it('should depend on its parent OU resource', async () => {
    // ARRANGE + ACT
    buildOrganizationUnits({ organization });

    // ASSERT — both OU resources exist and the child's dependency is declared
    expect(resources.filter((r) => r.type === 'aws:organizations/ou:OrganizationalUnit')).toHaveLength(3);
  });
});
```

---

## Required Behavioral Tests

These are the acceptance suite. Each maps to a capability contract and must be
covered.

### Nested OU expansion

Given:

```text
workloads
├── production
│   ├── prod-a
│   └── prod-b
└── development
    └── dev-a
```

Selecting `{ ou: 'workloads' }` returns `prod-a`, `prod-b`, `dev-a` — recursion,
not just direct children.

**Tier:** Unit.

### Account exclusion

Include `workloads`, exclude `prod-b`. Result: `prod-a`, `dev-a`. Exclusions
apply after inclusion.

**Tier:** Unit.

### Tag selection

Selector `{ tag: { key: 'Environment', value: 'production' } }` matches only
configured production-tagged accounts. Also test key-existence matching (key
with no value).

**Tier:** Unit.

### OU depth

A hierarchy exceeding AWS's supported depth fails **before resource
construction** — a validation error, not a thrown resource error.

**Tier:** Unit (validation), plus a mock test asserting no
`OrganizationalUnit` resource is created.

### Account deletion safety

Every member account is constructed with `protect: true` and
`closeOnDeletion: false`. The test must also document that removing protection
and deleting the resource would remove the account from the Organization.

**Tier:** Mock (option assertions) + Unit (documentation test for the
`closeOnDeletion` semantics).

### Identity Center deduplication

An OU selector plus an explicit account selector that overlap produces **one**
assignment, not two.

**Tier:** Unit.

### Identity Center discovery safety

Ambiguous instance discovery must **fail** rather than pick array index zero.
Test 0 instances and 2+ instances; both fail. Exactly 1 succeeds.

**Tier:** Unit (discovery resolution logic).

### Automatic StackSet targeting

Automatic OU deployment uses native `organizationalUnitIds` and does **not**
enumerate accounts.

**Tier:** Mock.

### Unsafe automatic mode

Each of these must fail validation:

```text
automatic + tag selector
automatic + account exclusion
automatic + per-account parameters
```

**Tier:** Unit.

### Resolved StackSet targeting

Resolved account sets use service-managed Organization deployment targets. The
test must verify the implementation does not fall back to self-managed
top-level `accounts` targeting.

**Tier:** Mock.

### One StackInstances owner

Two plural `StackInstances` owners for the same StackSet must fail validation.

**Tier:** Unit.

### Dependency graph

Declared dependencies produce a Pulumi `dependsOn` **and**, where applicable, a
native StackSet dependency (by ARN, so future accounts inherit it).

**Tier:** Unit (graph) + Mock (`dependsOn` present).

### Template handling

A small ordinary template uses `templateBody`. A large template, or one
containing `{{resolve:...}}` dynamic references, uses S3 plus `templateUrl`.
Never size-only.

**Tier:** Unit (selection logic) + Mock (resource shape).

### NoEcho parameters

A template containing `NoEcho: true` parameters triggers the framework's
secret handling — Pulumi secret semantics and `ignoreChanges` where the provider
requires it. Assert the secret is not exposed as a plain input.

**Tier:** Mock.

### Deployment deletion safety

Organization deployments (StackSet, StackInstances, management-account stack)
are protected by default.

**Tier:** Mock.

---

## Accuracy Constraints

- Base every assertion on actual code paths.
- Base every asserted resource option on what the implementation passes.
- Do not generate a test that merely looks correct.
- The test must be runnable and aligned with the repo's real behavior.

## Avoid These Common Mistakes

- Do not write a unit test that imports Pulumi. If it needs Pulumi, the logic
  belongs in a different layer or it is a mock test.
- Do not write a mock test that asserts pure-model behavior. That is a unit test
  with the wrong filename suffix.
- Do not guess Pulumi resource names — derive them from the naming helper and
  the logical key.
- Do not guess which options a resource is constructed with — read the
  implementation.
- Do not assert on an entire error message unless the message is the contract.
  Assert on `code` and `reference`.
- Do not create a generic test template disconnected from the target function.
- Do not change production code just to make the test easier.
- Do not propose adding a live-AWS tier. It is out of scope by design.

---

## Pre-Write Checklist

Before writing any test, verify:

- [ ] I read the implementation under test.
- [ ] I read nearby tests in the same directory (both suffixes).
- [ ] I read the types and constants that define the inputs.
- [ ] I chose the correct tier for what I'm testing.
- [ ] I structured each scenario using ARRANGE, ACT, ASSERT.
- [ ] My unit test imports no Pulumi module.
- [ ] My mock test captures every asserted resource option from real code.
- [ ] I used unique logical keys so parallel runs cannot collide.
- [ ] My test structure matches this repo's style.

## Final Self-Check Before Returning The Test

- [ ] The file name matches the correct tier suffix.
- [ ] The test is colocated with the code under test.
- [ ] The describe/it wording matches repo style (`When...`, `and...`,
      `should...`).
- [ ] ARRANGE, ACT, ASSERT sections are present and in order.
- [ ] Unit tests import nothing from `@pulumi/pulumi` or `@pulumi/aws`.
- [ ] Mock tests call `setMocks` and assert on captured resources.
- [ ] Safety options (`protect`, `closeOnDeletion`, `dependsOn`) are asserted
      where the implementation sets them.
- [ ] Nothing in the test is guessed.

---

## Commands Reference

```bash
# Run all unit tests
pnpm test:unit

# Run all Pulumi mock tests
pnpm test:mock

# Run everything
pnpm test

# Run a single unit test file
pnpm vitest run src/model/account-sets.unit.test.ts

# Run a single mock test file
pnpm vitest run src/organization/accounts.mock.test.ts

# Run tests matching a name pattern
pnpm vitest run -t "should expand nested OUs recursively"

# Before running pnpm, ensure fnm is initialized
eval "$(fnm env --use-on-cd --shell bash)"
```