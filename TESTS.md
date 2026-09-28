# Testing Instructions

You are writing tests for the backend of this monorepo.

## Goal

- Write accurate, runnable tests in this repo's established style.
- Tests must be derived from actual implementation code, not assumptions.
- Optimize for correctness and reproducibility over speed or creativity.

## Primary Rules

- Do not write tests from assumptions.
- First inspect the code that implements the behavior, then derive the test from that code.
- **Mocks are a smell.** Prefer real integrations over mocks. Only mock when there is no practical alternative — e.g., a third-party service whose sandbox is unreliable or prohibitively slow. **LLMs and OpenAI are NOT an automatic exemption**: integration and e2e tests should exercise real LLM calls where the test budget allows, because the adapter boundary (Zod-to-JSON-schema translation, SDK version compatibility, structured-output parsing) only fails against live requests. Prefer looser assertions on non-deterministic LLM output (shape/regex/count) over mocking the adapter. Mock LLMs only in unit tests of code that wraps them. If you find yourself needing many mocks to test a function, that is a signal the code should be restructured — not that more mocks are needed. Integration and e2e tests with real AWS resources are the primary confidence drivers in this codebase.

---

## Test Tiers

This codebase uses three test tiers. Each level covers everything the level
below covers, plus additional integration surface.

### Unit Tests (`*.unit.test.ts`)

Test isolated business logic with all external dependencies mocked.

**When to write unit tests:**
- Domain logic with branching, edge cases, or status transitions (no I/O)
- Schema validation (Zod `.safeParse()` success and failure)
- Pure functions (mappers, transformers, prompt builders)
- Error handling paths (thrown errors, rejected promises)
- Adapter input parsing (SQS event shapes, DynamoDB stream events)

**What unit tests should NOT do:**
- Call real AWS services (DynamoDB, S3, SQS, EventBridge)
- Make HTTP requests
- Require `sst shell` to run (though the script uses it for path resolution)

**Entrypoint:** Individual functions or modules.

### Integration Tests (`*.int.test.ts`)

Test domain logic against real AWS services and external APIs without HTTP
layers. If the domain function performs I/O — reads, writes, event emission,
message sends, or external API calls — the integration test exercises that
boundary against real services, not mocks.

**When to write integration tests:**
- Domain functions that perform any I/O through AWS services or outbound
  adapters (`*-adapter-out.ts`) — DynamoDB, S3, EventBridge, SQS, IoT,
  Athena, external APIs, etc.
- Multi-step domain workflows (e.g., upsert that checks existence then
  creates or updates)
- Any code where persistence keys (PK/SK/GSI), outbound payload shapes,
  resource names (bus, topic, queue), or detail types are part of the
  behavior under test

The rule is simple: if the domain function's behavior includes I/O, that
I/O needs integration coverage. Pure branching logic without I/O is
unit-tier.

**What integration tests should NOT do:**
- Mock AWS services or outbound adapters — use real resources via `sst shell`. The adapter boundary is what the integration test verifies.
- Test through HTTP (that's e2e)
- Test adapter-level concerns (input parsing, authorization)

**Entrypoints:**

- **Entity domain functions** (`backend/domains/<entity>/...`) — call the
  domain function directly. Domain functions are shared across features, so
  they always get their own independent integration coverage.
- **Backend features** (`backend/features/<feature>/...`) — call the
  feature's Lambda handler (the exported `main` / `mainV1` from
  `api-adapter.ts`, `sqs-adapter-in.ts`, `lambda-adapter-in.ts`, etc.). The
  handler is the feature's real entry point; testing it directly exercises
  Middy middleware, input parsing, and the orchestration the handler
  performs on top of domain calls.

When you add a domain function, add int tests for it. When you add a
feature, add int tests for it. Downstream AWS services (DynamoDB, S3, SQS,
EventBridge) are real in both cases — never mocked.

### End-to-End Tests (`*.e2e.test.ts`)

Test the full deployed stack from the feature's own entry point through its
own pipeline to observable state. The entry point is whatever real event the
feature is wired to:

- **HTTP-triggered features:** `fetch(Resource.Api.url + '/...')` — API Gateway -> Lambda -> persistence -> response.
- **Stream-triggered features:** a direct DynamoDB write that fires streams -> EventBridge -> SQS -> Lambda -> observable state.
- **Event-triggered features:** an EventBridge event or cross-service trigger -> the feature's own subscriber Lambda -> observable state.

**Every feature that owns its own wiring in `infra/<feature>/features.ts` —
EventBridge rule, SQS queue, Lambda handler path, resource links, IAM
permissions — needs its own e2e test. Another feature's e2e proves that
feature's wiring, not yours.** A typo in your feature's filter pattern or a
missing `link` only surfaces when your feature's own pipeline runs end-to-end.

**When to write e2e tests:**
- New API endpoints (happy path + auth rejection + validation errors)
- Flows with async processing (API -> SQS -> Lambda -> DynamoDB)
- Stream- or event-triggered features (DynamoDB Streams -> EventBridge -> SQS -> Lambda)
- Authorization and authentication behavior
- CORS and HTTP-level configuration
- Any flow where deployment configuration (IAM, routes, links) is part of the risk

**What e2e tests validate that other tiers cannot:**
- API Gateway route configuration (path, method, CORS, authorizer)
- IAM permissions between Lambda and downstream services
- SST `link` wiring (correct table names, bucket names, secret values)
- End-to-end data flow including eventual consistency

**Entrypoint:** whatever real event the feature is wired to — usually
`fetch(Resource.Api.url + '/...')` for HTTP-triggered features, or a direct
DynamoDB write / EventBridge event for stream- or event-triggered features.

---

## Choosing the Right Tier

In serverless architectures, integration and e2e tests are the primary
confidence drivers. Unit tests supplement them for complex logic.

| Code Under Test | Recommended Tier |
|---|---|
| Domain function with branching logic (no I/O) | Unit |
| Schema validation | Unit |
| Adapter input parsing | Unit |
| Prompt/string generation | Unit |
| Domain function that writes to DynamoDB | Integration |
| Domain function that reads from DynamoDB with GSI | Integration |
| Domain function that emits to EventBridge | Integration (`toHaveMessage` on test queue) |
| Domain function that publishes to IoT | Integration (`toHaveIotMessage`) |
| Domain function that sends to SQS | Integration (`toHaveMessage`) |
| Domain function that calls an external API | Integration (real call, loose assertions) |
| Domain function that performs any other I/O | Integration |
| Multi-step domain workflow | Integration |
| New API endpoint (happy path) | E2E |
| Auth rejection for an endpoint | E2E |
| Async flow (API -> SQS -> persistence) | E2E |
| EventBridge subscriber business logic | Integration (direct invoke) |
| EventBridge event delivery | E2E (auxiliary queue pattern) |

**When a Lambda function is simple** (validates input, calls one domain
function, returns result), skip the unit test and cover it with integration +
e2e tests. Unit tests add the most value when there is complex logic to
exercise.

---

## Required Discovery Steps Before Writing Any Test

1. Read the implementation file under test.
2. Read nearby test files (`*.unit.test.ts`, `*.int.test.ts`, `*.e2e.test.ts`) in the same domain or feature area.
3. Read helper functions used to create prerequisite state.
4. Read model/type/constants files that define:
   - Persisted fields and entity shapes
   - PK/SK values and GSI values
   - Table names and bucket names
   - S3 key shapes
5. Read existing test helpers in `@utils/aws-test`.

## Do Not Guess Any Of The Following

- DynamoDB PK/SK values
- GSI names or GSI values
- Table names or bucket names
- S3 object keys
- Return object shapes
- Cleanup keys
- Error types or error messages
- Metadata field names
- Whether the function should throw, no-op, or partially update state

If a value is unclear:
- Derive it from the implementation under test
- Or derive it from nearby tests and constants
- If it still cannot be derived, explicitly state what is missing instead of inventing it

---

## Repo Conventions (All Tiers)

- **Framework:** Vitest with `describe`, `it`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, `expect`.
- **File naming:** `<feature>.unit.test.ts`, `<feature>.int.test.ts`, `<feature>.e2e.test.ts`. Name tests after the feature, not the adapter.
- **Colocation:** Test files live next to the code they test.
- **TypeScript:** Strict mode, single quotes, repo import style.
- **Path aliases:** `@domains/*`, `@utils/*`, `@features/*` (resolved by `vite-tsconfig-paths`).
- **Execution:** All backend tests run via `sst shell` (provides `Resource.*` bindings).
- **Logging:** `LOG_LEVEL=SILENT` suppresses Lambda Powertools output during tests.
- **PHI safety:** Never use real patient data in fixtures. Use synthetic data only.

### Describe Style

```typescript
// Top-level suite
describe('When <context>', () => {
  // Scenario suite
  describe('and <condition>', () => {
    // Test case
    it('should <expected behavior>', async () => {});
  });
});
```

### Test Flow Pattern (ARRANGE, ACT, ASSERT)

Every scenario follows ARRANGE, ACT, ASSERT with explicit section comments:

```typescript
describe('and the gap already exists', () => {
  let result: PatientGap;

  beforeAll(async () => {
    // ARRANGE
    await createPatientGap({ orgId, patientId, input });

    // ACT
    result = await upsertPatientGap({ orgId, patientId, input });
  });

  it('should return the updated gap', () => {
    // ASSERT
    expect(result.status).toBe('open');
  });
});
```

- In integration and e2e tests, `beforeAll` typically contains ARRANGE and ACT.
- `it(...)` blocks focus on ASSERT.
- In unit tests, ARRANGE/ACT/ASSERT may all live inside `it(...)`.

#### Arrange verification trade-off

A test's ARRANGE phase sometimes writes data via a GSI-backed access pattern
(e.g., `ingestCareInsightsGaps` followed by `materializePatientGapsForEncounter`,
which reads from GSI1). If GSI propagation is lagged, the ARRANGE step that
reads the just-written data can see partial results, and the ACT step that
follows will run against incomplete preconditions.

Three options, in order of preference:

1. **Change the domain function to return the created entity** so ARRANGE
   captures IDs at write time and doesn't need to re-read a GSI.
2. **Restructure ARRANGE to avoid the GSI round-trip** — e.g., pass the row
   directly from the write to the subsequent step instead of re-querying.
3. **Accept the race** when (1) and (2) aren't feasible. GSI propagation is
   typically sub-second and subsequent AWS round-trips add slack, so the
   in-practice flake risk is low. Document the trade-off in a comment near
   the arrange block.

Do not use `expectAws.toHave*` helpers as synchronization barriers in
`beforeAll`. Those helpers are assertion-tier; they throw `'Function timeout
reached'` on miss and turn arrange races into confusing failure modes. If the
race becomes a real problem, add a purpose-built non-assertion `waitUntil`
utility in `@utils/aws-test` — don't repurpose the assertion helpers.

### Unique Test Data

```typescript
import { ulid } from 'ulid';
import { v7 as uuidv7 } from 'uuid';

// Document-like IDs
const patientGapId = ulid();
const patientId = ulid();

// User IDs, email seeds, external IDs
const userId = `auth0|ehr-partners-users|${uuidv7()}|bookmdrr`;
const orgId = `org-${uuidv7()}`;
const encounterId = `enc-${uuidv7()}`;
```

Never use hardcoded IDs that may collide across parallel test runs.

---

## Unit Test Instructions

### Mocking Pattern: `vi.hoisted` + `vi.mock`

All mocks must be created with `vi.hoisted()` before `vi.mock()` calls.
Import the implementation AFTER all mocks are declared.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Step 1: Create mock functions with vi.hoisted
const {
  listPatientGapsMock,
  getS3ObjectMock,
} = vi.hoisted(() => ({
  listPatientGapsMock: vi.fn(),
  getS3ObjectMock: vi.fn(),
}));

// Step 2: Wire mocks to modules
vi.mock('sst', () => ({
  Resource: {
    Bucket: { name: 'test-bucket' },
  },
}));

vi.mock('@domains/patient-gap/list-patient-gaps/list-patient-gaps', () => ({
  listPatientGaps: listPatientGapsMock,
}));

vi.mock('@utils/s3/s3-utils', () => ({
  getS3Object: getS3ObjectMock,
}));

// Step 3: Import implementation AFTER mocks
import { evaluateTranscriptUpdate } from './evaluate-transcript-update';
```

### Mock Reset

Reset all mocks in `beforeEach` to ensure test isolation:

```typescript
beforeEach(() => {
  listPatientGapsMock.mockReset();
  getS3ObjectMock.mockReset();
});
```

### Base Fixture Pattern

Define base fixtures at the top of the describe block. Override per-scenario:

```typescript
const baseGap = {
  itemType: 'PATIENT_GAP' as const,
  orgId: 'org-123',
  patientId: '01HZXK6Q0V6R3Q2KEGJ3YQF3M1',
  patientGapId: '01HZXK6Q0V6R3Q2KEGJ3YQF3M2',
  status: 'open' as const,
  title: 'Test gap',
  // ... all required fields
};

// Per-scenario override
it('handles addressed gap', async () => {
  listPatientGapsMock.mockResolvedValueOnce([
    { ...baseGap, status: 'addressed' },
  ]);
  // ...
});
```

For repeated fixture creation, use a factory function:

```typescript
function makeGap(overrides: Partial<PatientGap> = {}): PatientGap {
  return {
    ...baseGap,
    patientGapId: ulid(),
    ...overrides,
  };
}
```

### Spy Pattern (for domain logic tests)

When testing a function that calls other domain functions, use `vi.spyOn`:

```typescript
import * as createModule from './create-patient-gap';
import * as findModule from './find-patient-gap-by-source-gap-id';

it('calls create when source gap is new', async () => {
  const createSpy = vi
    .spyOn(createModule, 'createPatientGap')
    .mockResolvedValueOnce(expectedGap);
  const findSpy = vi
    .spyOn(findModule, 'findPatientGapBySourceGapId')
    .mockResolvedValueOnce(undefined);

  const result = await upsertPatientGapFromSource({ orgId, patientId, input });

  expect(result).toEqual(expectedGap);
  expect(createSpy).toHaveBeenCalledTimes(1);
  expect(findSpy).not.toHaveBeenCalled();
});
```

Clean up spies with `vi.restoreAllMocks()` in `afterEach`.

### Schema Validation Tests

Test schemas with `.safeParse()`:

```typescript
import { MySchema } from './schemas';

describe('MySchema', () => {
  const validPayload = { /* ... */ };

  it('accepts valid payload', () => {
    const result = MySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects empty required field', () => {
    const result = MySchema.safeParse({ ...validPayload, entityId: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields as null', () => {
    const result = MySchema.safeParse({
      ...validPayload,
      description: null,
    });
    expect(result.success).toBe(true);
  });
});
```

### Error Path Testing

```typescript
it('throws when model output is invalid', async () => {
  getS3ObjectMock.mockResolvedValueOnce(JSON.stringify({ text: 'Hello' }));
  listPatientGapsMock.mockResolvedValueOnce([{ ...baseGap }]);
  evaluateMock.mockResolvedValueOnce({
    modelVersion: 'gpt-5.4',
    output: { results: [] },
  });

  await expect(
    evaluateTranscriptUpdate({ ...baseTrigger })
  ).rejects.toThrow('Invalid evaluation result');

  // Verify side effects did NOT occur
  expect(updateMock).not.toHaveBeenCalled();
});

it('propagates model invocation failure', async () => {
  evaluateMock.mockRejectedValueOnce(new Error('model_failure'));

  await expect(
    evaluateTranscriptUpdate({ ...baseTrigger })
  ).rejects.toThrow('model_failure');
});
```

### SQS Adapter Test Pattern

Build realistic AWS event shapes:

```typescript
function buildEventBody({
  newImage,
  oldImage,
}: {
  newImage: Record<string, unknown>;
  oldImage?: Record<string, unknown>;
}) {
  return JSON.stringify({
    'detail-type': 'DynamoDB Record',
    detail: {
      eventName: oldImage ? 'MODIFY' : 'INSERT',
      dynamodb: {
        NewImage: newImage,
        OldImage: oldImage,
      },
    },
  });
}

function buildSqsEvent(body: string): SQSEvent {
  return {
    Records: [
      {
        messageId: 'm1',
        receiptHandle: 'r1',
        body,
        attributes: {
          ApproximateReceiveCount: '1',
          SentTimestamp: '0',
          SenderId: 'sender',
          ApproximateFirstReceiveTimestamp: '0',
        },
        messageAttributes: {},
        md5OfBody: 'md5',
        eventSource: 'aws:sqs',
        eventSourceARN: 'arn:aws:sqs:us-east-1:123:queue',
        awsRegion: 'us-east-1',
      },
    ],
  };
}
```

### String/Prompt Generation Tests

Use `.toContain()` for string content assertions:

```typescript
it('includes required instruction sections', () => {
  const instructions = buildDeveloperInstructions();

  expect(instructions).toContain('Allowed evaluationStatus values');
  expect(instructions).toContain('potentially_addressed');
});
```

---

## Integration Test Instructions

### Core Principles

- Use real AWS integrations — never mock AWS services or outbound adapters.
- Seed prerequisite state using domain helpers the feature normally depends on.
- Assert outbound I/O using `@utils/aws-test` helpers: `toHaveMessage` for SQS/EventBridge (via test queue), `toHaveIotMessage` for IoT.
- Only mock narrow seams already treated as config seams in this repo (e.g., feature flags), and only when necessary.

### DynamoDB Assertion Helpers

Use the repo's standard `expectAws` helpers from `@utils/aws-test`:

```typescript
import expectAws from '@utils/aws-test';

// Full equality check (use the Resource that owns the entity under test)
await expectAws.toHaveItem({
  tableName: Resource.MyTable.name,
  key: { PK: entityKey, SK: entityKey },
  item: expectedFullItem,
});

// Partial match (only checks specified properties)
await expectAws.toHaveItemPartial({
  tableName: Resource.MyTable.name,
  key: { PK: lockKey, SK: lockKey },
  item: {
    itemType: 'MY_LOCK',
    orgId,
    entityId,
  },
});
```

**Retry behavior:** Built into `expectAws` — default 500ms interval, 2500ms
timeout. Override per call:

```typescript
await expectAws.toHaveItem({
  tableName: Resource.MyTable.name,
  key: { PK: sessionKey, SK: sessionKey },
  item: expectedSession,
  functionTimeout: 5000,
  retryInMilliseconds: 200,
});
```

Do not implement your own polling for DynamoDB assertions. Use the retry
behavior already built into `expectAws`.

### Query/List Assertions via `toHaveQueryResults`

`toHaveItem` / `toHaveItemPartial` only do point lookups. When rows are not
point-lookable — GSI queries, or lists where the PK/SK values are generated
inside the handler (e.g., a domain-created `ulid()`) — use
`toHaveQueryResults`:

```typescript
await expectAws.toHaveQueryResults({
  query: () => listPatientGapSources({ orgId, patientId }),
  predicate: (items) =>
    (items as PatientGapSourceEntity[]).some(
      (s) => s.source.payer === 'soap_note'
    ),
  functionTimeout: 15000,
  retryInMilliseconds: 500,
});
```

Notes:

- Predicate items are typed `unknown[]`. Cast inside the predicate body when
  you need typed access to fields.
- The raw function returns `Promise<boolean>`, but `expectAws.toHaveQueryResults`
  wraps it with `wrapInRetries`: returning `false` from the predicate triggers
  a retry (not a test failure), and only `true` settles the assertion. If you
  need the rows for further assertions, re-query after the helper settles.
- Throws `'Function timeout reached'` on timeout (same as other `expectAws.*`
  helpers) — a clearer diagnostic than a downstream `expected X, got 0`.
- This helper is only for `it` block assertions. See "Avoid These Common
  Mistakes" below.

When a test writes, puts, publishes, or otherwise triggers an observable
AWS-backed side effect, the first assertion of that side effect should use the
repo's standard `expectAws` helper for that service and access pattern.
Examples:

- DynamoDB point-lookable rows: `toHaveItem` / `toHaveItemPartial`
- DynamoDB query/list/GSI/generated-key paths: `toHaveQueryResults`
- S3 objects: `toHaveS3Object` / `toHaveS3ObjectPartial`
- S3 object tags: `toHaveS3ObjectTags`
- IoT messages: `startIotCollector(...)` + `toHaveIotMessage(...)`
- SQS/EventBridge messages (via test queue): `toHaveMessage`

If the repo does not yet have a helper for that AWS service, extend
`backend/utils/aws-test/` following the existing pattern. After the helper
settles, re-read through the domain function or service helper if you need
richer assertions on the observable outcome.

### Negative DynamoDB Assertions

When asserting that an item should NOT match a given shape:

```typescript
import { DynamoItemsNotEqualError } from '@utils/aws-test/dynamodb';

await expect(
  expectAws.toHaveItem({
    tableName: Resource.MyTable.name,
    key: { PK: entityKey, SK: entityKey },
    item: wrongShape,
  })
).rejects.toBeInstanceOf(DynamoItemsNotEqualError);
```

### Cleanup Is Mandatory

Delete every resource the test created. Never rely on a shared afterAll
across features to handle it. Two patterns are supported; choose based on
whether the test knows its row keys at write time:

**Pattern A — `createdKeys` tracking.** Use when every write returns (or
accepts) a deterministic key the test controls — e.g., you pass `patientGapId`
in and get the same ID back. Register the key at write time, delete it in
`afterAll`:

```typescript
interface DynamoKey {
  PK: string;
  SK: string;
}

const createdKeys: DynamoKey[] = [];

const registerKey = (key: DynamoKey) => {
  createdKeys.push(key);
};

afterAll(async () => {
  await Promise.all(
    createdKeys.map((key) =>
      dbClient.send(
        new DeleteCommand({
          TableName: Resource.MyTable.name,
          Key: key,
        })
      )
    )
  );
});
```

**Pattern B — scope-based cleanup.** Use when IDs are generated inside the
handler (ulid/uuid assigned by the domain function, so you can't know them at
write time). Scope the test to unique `orgId` / `patientId` / `encounterId`
values (`uuidv7()` / `ulid()`), then have `afterAll` list by that scope and
delete whatever the test produced, deriving lock/partition keys from the row
contents. This is **not** broad cleanup — it is bounded to a scope no other
test can share because the IDs are unique per-run:

```typescript
afterAll(async () => {
  const [sources, gaps] = await Promise.all([
    listPatientGapSources({ orgId, patientId }),
    listPatientGapsForEncounter({ orgId, patientId, encounterId }),
  ]);
  const deletes: Promise<unknown>[] = [];
  for (const src of sources) {
    const srcKey = buildPatientGapSourceKey({ orgId, patientId, patientGapSourceId: src.patientGapSourceId });
    const lockKey = buildPatientGapSourceLockKey({ orgId, patientId, payer: src.source.payer, sourceGapId: src.source.sourceGapId });
    deletes.push(
      dbClient.send(new DeleteCommand({ TableName: Resource.MyTable.name, Key: srcKey })),
      dbClient.send(new DeleteCommand({ TableName: Resource.MyTable.name, Key: lockKey })),
    );
  }
  await Promise.all(deletes);
});
```

Cleanup is best-effort under GSI lag; missed rows are ephemeral test data.

**Tracking rule for Pattern A: register keys only when you know them at write
time.** Do not poll DynamoDB inside `beforeAll` to discover handler-generated
IDs just so you can record them for `afterAll` — that crosses wires between
arrange and cleanup phases. If the handler generates IDs internally, either
(1) change the domain function to return the created entity so the test
captures IDs at write time, or (2) switch to Pattern B above.

For tests that create S3 objects, track and clean those separately:

```typescript
const createdS3Keys: string[] = [];

afterAll(async () => {
  await Promise.all(
    createdS3Keys.map((key) =>
      s3Client
        .send(
          new DeleteObjectCommand({
            Bucket: Resource.Bucket.name,
            Key: key,
          })
        )
        .catch(() => {})
    )
  );
});
```

Use `.catch(() => {})` for S3 cleanup to handle objects that may not exist.

### Key Builder Pattern

Build DynamoDB keys using helper functions that match the domain's partition
scheme. Derive key patterns from the `-db.ts` files:

```typescript
function buildPatientGapKey({
  orgId,
  patientId,
  patientGapId,
}: {
  orgId: string;
  patientId: string;
  patientGapId: string;
}) {
  const key = `ORG#${orgId}#PATIENT#${patientId}#GAP#${patientGapId}`;
  return { PK: key, SK: key };
}
```

### `removeUndefinedValues` Pattern

When comparing full persisted models that may include `undefined`, configure
the DynamoDB Document Client with `marshallOptions: { removeUndefinedValues: true }`
as done in existing tests. This strips `undefined` values before writes so
assertions don't need to account for them.

### Match Local Patterns First

If nearby tests in the same area show a local pattern, follow that pattern
before copying a pattern from another domain. Reuse production constants
where appropriate. Match `Resource.*.name` usage exactly as nearby tests do.

---

## End-to-End Test Instructions

### JWT Minting and Authentication

E2e tests authenticate by minting a fake JWT and exchanging it for a real
access token via the auth endpoint:

```typescript
function buildFakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'none', typ: 'JWT' })
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

async function mintAccessToken({
  vimUserId,
  vimOrganizationId,
}: {
  vimUserId: string;
  vimOrganizationId: string;
}): Promise<string> {
  const idToken = buildFakeJwt({
    sub: vimUserId,
    given_name: 'E2E',
    family_name: 'Test',
  });

  const response = await fetch(`${Resource.Auth.url}/token`, {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      provider: 'vimExchange',
      client_id: 'vim-provider-copilot',
      client_secret: Resource.VimClientSecret.value,
      id_token: idToken,
      organization_id: vimOrganizationId,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to mint access token: ${response.status} ${await response.text()}`
    );
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}
```

### HTTP Request Pattern

Use native `fetch()` with timeout and authorization:

```typescript
const response = await fetch(
  `${Resource.Api.url}/api/care-insights/gap/app-state`,
  {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
);
```

Always include `AbortSignal.timeout()` for network calls.

### Polling for Eventual Consistency

For async flows (API -> SQS -> Lambda -> DynamoDB), poll until the expected
state appears using the repo's standard `expectAws` helpers. Do not implement
custom polling loops for DynamoDB assertions.

```typescript
await expectAws.toHaveQueryResults({
  query: () => listPatientGaps({ orgId, patientId }),
  predicate: (items) =>
    (items as PatientGap[]).filter((gap) => gap.encounterId === encounterId)
      .length >= expectedCount,
  functionTimeout: 15000,
  retryInMilliseconds: 1000,
});

const gaps = await listPatientGaps({ orgId, patientId });
```

Prefer querying domain functions (e.g., `listPatientGaps`) over raw DynamoDB
queries, so the test validates the read path too. If the downstream state is
point-lookable, use `toHaveItem` / `toHaveItemPartial` instead.

### Timeouts

Use `beforeAll` timeout parameter for long-running setup:

```typescript
beforeAll(async () => {
  // ARRANGE + ACT (may take 30-60s for async flows)
  // ...
}, 60000);
```

### Auth Rejection Scenario

Every e2e test for a protected endpoint should include an auth rejection
scenario:

```typescript
describe('and sending a request without auth', () => {
  let status: number;

  beforeAll(async () => {
    // ACT
    const response = await fetch(`${Resource.Api.url}/my-endpoint`, {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    status = response.status;
  }, 20000);

  it('should return 401', () => {
    // ASSERT
    expect(status).toBe(401);
  });
});
```

### What E2E Tests Should Cover Per Endpoint

Based on serverless failure modes, each new endpoint's e2e test should verify:

1. **Happy path** — correct status code, response body, and persisted state
2. **Auth rejection** — 401 without token
3. **Validation rejection** — 400 with invalid/missing required fields
4. **Async side effects** — if the endpoint triggers async processing, poll for the downstream state
5. **Idempotency** — if the endpoint should be idempotent, call it twice and verify no duplicate state

### Cleanup

Same patterns as integration tests. Track DynamoDB keys and S3 objects
separately. Clean up in `afterAll`:

```typescript
const createdDynamoKeys: DynamoKey[] = [];
const createdS3Keys: string[] = [];

afterAll(async () => {
  await Promise.all(
    createdDynamoKeys.map((key) =>
      dbClient.send(
        new DeleteCommand({
          TableName: Resource.MyTable.name,
          Key: key,
        })
      )
    )
  );
  await Promise.all(
    createdS3Keys.map((key) =>
      s3Client
        .send(
          new DeleteObjectCommand({
            Bucket: Resource.Bucket.name,
            Key: key,
          })
        )
        .catch(() => {})
    )
  );
});
```

---

## AWS Service Integration Testing

This codebase interacts with multiple AWS services (DynamoDB, S3, SQS,
EventBridge). The same testing philosophy applies to all: **test against
real services in integration and e2e tests, never mock them.**

`@utils/aws-test` already has helpers for DynamoDB (`toHaveItem`,
`toHaveItemPartial`, `toHaveQueryResults`), S3 (`toHaveS3Object`,
`toHaveS3ObjectPartial`), and IoT (`startIotCollector`,
`toHaveIotMessage`). When writing tests that assert on services not yet
covered, **extend `backend/utils/aws-test/`** with new helpers following the
same pattern: a service-specific assertion file (e.g., `sqs.ts`) exported
through `index.ts` and wrapped with `wrapInRetries` for eventual consistency.

### S3 Assertions

`@utils/aws-test/s3.ts` provides two helpers for asserting on S3 JSON objects.
Both accept `{ bucket, key, item }` where `item` is `Record<string, unknown>`:

```typescript
// Full equality — object must match item exactly
await expectAws.toHaveS3Object({
  bucket: Resource.MyBucket.name,
  key: expectedS3Key,
  item: expectedPayload,
});

// Partial match — only checks keys present in item
await expectAws.toHaveS3ObjectPartial({
  bucket: Resource.MyBucket.name,
  key: expectedS3Key,
  item: { status: 'completed', orgId },
});
```

If the object doesn't exist yet, the helper returns `false` (triggering a
retry via `wrapInRetries`). If it exists but doesn't match, it throws
`S3ObjectNotEqualError`.

Always register created S3 keys for cleanup in `afterAll`.

For object tags rather than the JSON body, use `toHaveS3ObjectTags({ bucket, key, tags })` (exact tag-set match).

### IoT Assertions

IoT assertions use a collector-based pattern. Start a collector for the topic
under test, then assert against the collected messages with
`expectAws.toHaveIotMessage`:

```typescript
import expectAws, {
  startIotCollector,
  type IotCollector,
} from '@utils/aws-test';

let collector: IotCollector;

beforeAll(async () => {
  collector = await startIotCollector({
    topic: buildTopic(orgId, userId),
  });

  await publishNotification({ entity });
}, 30000);

afterAll(async () => {
  await collector.disconnect();
});

it('should deliver the expected IoT event', async () => {
  await expectAws.toHaveIotMessage({
    collector,
    message: {
      v: 1,
      type: 'soap_note.generating',
      orgId,
      encounterId,
      sessionId,
    },
    functionTimeout: 5000,
    retryInMilliseconds: 500,
  });
});
```

Use the collector's `getMessages()` only after `toHaveIotMessage(...)` settles
if you need richer assertions on the delivered payload.

### SQS Assertions

When testing code that sends messages to SQS, assert messages arrive on the
queue. Add an `sqs.ts` helper to `@utils/aws-test` if one doesn't exist yet:

```typescript
// Pattern for SQS assertion (add to @utils/aws-test/sqs.ts)
import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({});

interface SqsProps extends ExpectOptions {
  queueUrl: string;
  matchBody: (body: string) => boolean;
}

export const toHaveMessage = async (props: SqsProps): Promise<boolean> => {
  const result = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: props.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5,
    })
  );
  const match = result.Messages?.find((m) => props.matchBody(m.Body ?? ''));
  return !!match;
};
```

Usage in tests:

```typescript
await expectAws.toHaveMessage({
  queueUrl: Resource.MyQueue.url,
  matchBody: (body) => {
    const parsed = JSON.parse(body);
    return parsed.eventType === 'gap.created' && parsed.orgId === orgId;
  },
});
```

### EventBridge Testing

This codebase uses EventBridge Pipes (DynamoDB Streams -> EventBridge ->
SQS -> Lambda). Testing EventBridge flows requires strategies for both the
event publishing side and the event consuming side.

**Testing Event Consumers (Unit):**

Test subscriber Lambda business logic with unit tests by mocking the event
source and testing the domain function directly:

```typescript
// Mock the SQS adapter input shape, test the domain function
const event = buildSqsEvent(
  buildEventBody({
    newImage: { /* DynamoDB stream NEW_IMAGE shape */ },
    oldImage: { /* DynamoDB stream OLD_IMAGE shape */ },
  })
);

// Call the handler or domain function directly
```

This bypasses EventBridge entirely and tests the business logic in isolation.

**Testing Event Delivery (E2E):**

To verify that events flow through EventBridge to subscribers, use the
**auxiliary SQS queue pattern**:

1. Deploy a test-only SQS queue subscribed to the EventBridge bus with a
   matching rule pattern.
2. Trigger the event producer (e.g., write to DynamoDB to trigger the stream).
3. Poll the SQS queue for the expected event.
4. Assert the event payload matches expectations.

This approach validates:
- The EventBridge Pipe is configured correctly
- The event rule pattern matches
- The event payload structure is correct

**Timeout considerations:** EventBridge delivery + SQS visibility can take
10-20 seconds. Use generous polling timeouts (30s+).

**Downstream-state pattern (simpler):** If the subscriber Lambda writes
observable state as a side effect (DynamoDB / S3), polling for that state via
`toHaveQueryResults` (or `toHaveItem*` for point-lookable rows) is a lighter
e2e pattern that doesn't require deploying an auxiliary queue. Prefer it when
the subscriber writes something the test can query. Example:

```typescript
// Write the entity that triggers the EventBridge pipe
await dbClient.send(new PutCommand({ TableName: ..., Item: completedSoapNote }));

// Poll for the subscriber's observable outcome
await expectAws.toHaveQueryResults({
  query: () => listPatientGapSources({ orgId, patientId }),
  predicate: (items) =>
    (items as PatientGapSourceEntity[]).some(
      (s) => s.source.payer === 'soap_note'
    ),
  functionTimeout: 90000,
  retryInMilliseconds: 3000,
});
```

Use the auxiliary queue pattern when the subscriber has no persisted side
effect (pure notification), or when the event payload itself needs
verification.

### Idempotency Testing

EventBridge guarantees at-least-once delivery, and SQS standard queues can
also deliver duplicates. If a subscriber processes events that mutate state,
write tests that invoke the handler twice with the same event and verify no
duplicate state is created:

```typescript
describe('and the same event is delivered twice', () => {
  beforeAll(async () => {
    // ACT — process same event twice
    await handler(event);
    await handler(event);
  });

  it('should not create duplicate records', async () => {
    const items = await listItems({ orgId, patientId });
    expect(items).toHaveLength(1);
  });
});
```

### Managing Side Effects

EventBridge events can fan out to multiple subscribers. In test environments:
- Focus tests on the specific subscriber under test.
- Accept that other subscribers may fire — use unique test data (`ulid()`,
  `uuidv7()`) so side effects from other subscribers don't interfere.
- Clean up all resources created by the test in `afterAll`.

### Extending `@utils/aws-test`

When you need an assertion helper for a service not yet covered, follow this
pattern:

1. Create a new file in `backend/utils/aws-test/` (e.g., `sqs.ts`).
2. Define a props interface extending `ExpectOptions`.
3. Write the assertion function returning `boolean` (return `false` if the
   resource doesn't exist yet, `true` if it exists and matches, throw if it
   exists but doesn't match).
4. Export from `index.ts` and wrap with `wrapInRetries` for eventual
   consistency support.

The `wrapInRetries` wrapper in `index.ts` handles polling automatically —
your assertion function only needs to handle a single check.

---

## Serverless-Specific Failure Modes to Test

Beyond business logic, serverless architectures introduce configuration and
integration failure modes that tests should catch:

### Configuration Failures (Caught by E2E Tests)
- API Gateway route configuration (path, method, CORS headers, authorizer attachment)
- Lambda IAM permissions to call downstream services
- Lambda `link` wiring (correct table/bucket/secret names in `Resource.*`)
- Lambda execution configuration (memory, timeout)

### Data Mapping Failures (Caught by Integration Tests)
- Incorrect field mapping between in-memory objects and persistence attributes (DynamoDB PK/SK/GSI, S3 keys)
- Outbound I/O mapping errors: wrong resource name (bus, topic, queue URL), wrong payload shape, missing fields, or serialization mismatches for any AWS service or external API the domain calls

### Integration Failures (Caught by E2E Tests)
- Missing credentials for external API calls
- Error handling for AWS service failures
- Retry behavior and DLQ routing for async failures

---

## Accuracy Constraints

- Base every assertion on actual code paths.
- Base every persisted shape on actual writes.
- Base every cleanup key on actual created resources.
- Do not generate a template that merely looks correct.
- The test must be runnable and aligned with the repo's real behavior.

## Avoid These Common Mistakes

- Do not invent helper utilities that don't exist in the repo.
- Do not use unit-test-style mocks for persistence in integration/e2e tests.
- Do not assert fields that production code never writes.
- Do not guess PK/SK/GSI structure — derive from `-db.ts` files.
- Do not omit cleanup.
- Do not create a generic test template disconnected from the target function.
- Do not change production code just to make the test easier.
- Do not use cleanup scoped to shared or global identifiers (e.g., deleting everything in a table, or scoping to a hardcoded orgId reused across tests). Scope-based cleanup is fine only when the scope is unique per test run — `uuidv7()` / `ulid()` for orgId / patientId / encounterId — so no other test can share it. See "Pattern B — scope-based cleanup" above.
- Do not mock AWS services or outbound adapters (`*-adapter-out.ts`) in integration or e2e tests. The adapter boundary is exactly what an integration or e2e test exists to verify. If the adapter is mocked, the test is a unit test with the wrong filename suffix.
- Do not use `expectAws.toHave*` helpers inside `beforeAll` / `afterAll` as synchronization barriers. They are test-assertion helpers and belong in `it` blocks. Placeholder predicates (e.g., `items.length > 0`) in setup conflate assertion semantics with "wait for propagation." If setup needs to wait, either restructure (see "Tracking rule" above) or use scope-based cleanup.
- Do not hardcode IDs that may collide across parallel runs.

---

## Pre-Write Checklist

Before writing any test, verify:

- [ ] I read the implementation under test.
- [ ] I read nearby tests in the same area (all tiers).
- [ ] I read helper functions used for setup.
- [ ] I read constants/models that define persistence structure.
- [ ] I chose the correct test tier for what I'm testing.
- [ ] I structured each scenario using ARRANGE, ACT, ASSERT.
- [ ] I verified each asserted field is actually written by production code.
- [ ] I verified each cleanup operation targets something created by this test.
- [ ] I used unique IDs (`ulid()`, `uuidv7()`) for test data.
- [ ] My test structure matches this repo's style.

## Final Self-Check Before Returning The Test

- [ ] The file name matches the correct tier suffix.
- [ ] The test is colocated with the code under test.
- [ ] The describe/it wording matches repo style (`When...`, `and...`, `should...`).
- [ ] ARRANGE, ACT, ASSERT sections are present and in order.
- [ ] The setup uses real helpers and unique IDs.
- [ ] Unit tests use `vi.hoisted()` + `vi.mock()` correctly.
- [ ] Integration/e2e tests use real AWS resources, not mocks.
- [ ] Integration/e2e tests use `expectAws` helpers for DynamoDB assertions.
- [ ] Observable AWS side-effect assertions after writes/puts/publishes use
      the correct `expectAws` helper for the relevant AWS service and access
      pattern before any direct re-read for richer assertions.
- [ ] E2e tests include auth rejection scenario.
- [ ] The cleanup is complete and targeted.
- [ ] Nothing in the test is guessed.

---

## Commands Reference

```bash
# Run all unit tests
pnpm test:unit

# Run all integration tests
pnpm test:int

# Run all e2e tests
pnpm test:e2e

# Run a single test file (backend)
cd backend && LOG_LEVEL=SILENT sst shell -- vitest run path/to/file.unit.test.ts

# Run tests matching a name pattern
cd backend && LOG_LEVEL=SILENT sst shell -- vitest run -t "test name pattern"

# Before running pnpm, ensure fnm is initialized
eval "$(fnm env --use-on-cd --shell bash)"
```
