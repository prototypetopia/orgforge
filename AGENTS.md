# AGENTS.md - Provider Co-Pilot

This file provides guidance for AI coding agents working in this repository.

## Core Principles

**KISS and YAGNI above all else.**

- **KISS (Keep It Simple, Stupid)**: Always choose the simplest solution that works. Avoid over-engineering, unnecessary abstractions, and clever code. If a simple function solves the problem, don't create a class hierarchy. If a local variable works, don't reach for state management.

- **YAGNI (You Aren't Gonna Need It)**: Only implement what is explicitly required right now. Do not add features, abstractions, or flexibility "for the future." No speculative generalization. No "just in case" code.

When in doubt: fewer files, fewer abstractions, fewer lines of code. Resist the urge to build frameworks when scripts will do.

Feature workflow reference: `docs/development-flow.md` (`/session-init` -> `/prd` -> `/prd-breakdown` -> `/session-plan` -> implement -> `/session-save` -> `/pr`).

## Project Overview

A full-stack healthcare clinical assistant application built with:
- **Frontend**: React 19, TanStack Router/Start, Mantine UI v8, Vite 7
- **Backend**: AWS Lambda with Middy, TypeScript, Zod v4
- **Infrastructure**: SST v4 (Serverless Stack), DynamoDB, S3, EventBridge
- **Monorepo**: pnpm workspaces + Lerna

## Build/Lint/Test Commands

```bash
# Development & Deployment
pnpm dev                    # Start SST dev mode
pnpm deploy                 # SST deploy

# Code Quality
pnpm lint                   # ESLint all packages
pnpm lint:fix               # ESLint with auto-fix
pnpm typecheck              # TypeScript check across workspaces
pnpm format                 # Prettier format all files

# Testing
pnpm test:unit              # Run all unit tests
pnpm test:unit:fe           # Frontend unit tests only
pnpm test:int               # Integration tests
pnpm test:e2e               # E2E tests
```

### Running a Single Test

```bash
# Backend (requires SST shell for AWS resource access)
cd backend && LOG_LEVEL=SILENT sst shell -- vitest run path/to/file.unit.test.ts
cd backend && LOG_LEVEL=SILENT sst shell -- vitest run -t "test name pattern"

# Frontend
cd frontend && pnpm vitest run path/to/file.test.ts
cd frontend && pnpm vitest run -t "test name pattern"
```

**Test file naming**: `*.unit.test.ts`, `*.int.test.ts`, `*.e2e.test.ts`

**Testing guide**: See `TESTS.md` for comprehensive testing patterns, tier
selection criteria, and code examples.

## Logging

Use `import { log } from '@utils/lambda/powertools-utils'` (AWS Lambda Powertools Logger) for all backend logging.

### PHI Rules

`patientId` is PHI and must **never** be logged above `debug` level. If any new patient-identifying fields are added to the codebase (e.g., name, DOB, MRN, SSN, address, phone), they follow the same rule.

Operational identifiers (`encounterId`, `sessionId`, `soapNoteId`, `visitSummaryId`) are internal ULIDs safe to log at `info` level — they are needed for request traceability. They must never be logged alongside patient-identifying context.

Middy wrapper choice enforces transport-level PHI safety: `middyWrapper` (no input/output logging) for SQS handlers and PHI-processing Lambdas; `apiGatewayWrapperNoIo` / `apiGatewayWrapperPostNoIo` for API endpoints. No wrapper logs request/response payloads (V-002/#31) — handlers log entry/exit with operational IDs instead.

### Log Levels

| Level | When to use |
|-------|-------------|
| `error` | Caught exceptions that the function cannot recover from |
| `warn` | Validation failures, missing optional data, degraded paths |
| `info` | Entry/exit points, state transitions, decisions, successful I/O |
| `debug` | PHI fields, verbose payloads, intermediate computation |

### Minimum Logging by Layer

Every function that performs I/O must log entry and exit at minimum.

| Layer | Minimum log statements | Example |
|-------|----------------------|---------|
| **Inbound adapters** (`api-adapter.ts`, `sqs-adapter-in.ts`) | Entry (request received with key IDs) + exit (response status or batch summary) | `log.info('Request received', { encounterId })` → `log.info('Response', { statusCode: 200 })` |
| **Feature domain** (`features/[feature]/[feature].ts`) | Entry + exit + each major decision/branch + errors | `log.info('Orchestration started', { ... })` → `log.info('Skipping: already processed')` → `log.info('Orchestration completed')` |
| **Entity domain** (`domains/[entity]/[operation]/*.ts`) | Entry + state transitions + exit | `log.info('Session transitioning', { from, to })` |
| **Entity DB** (`domains/[entity]/[operation]/*-db.ts`) | Writes at `info` (confirm persistence) + conditional failures at `info` + reads at `debug` (high volume) | `log.info('Item created', { encounterId })` / `log.debug('Query returned', { count })` |
| **Outbound adapters** (`*-adapter-out.ts`) | Call start + call result + duration/metrics | `log.info('OpenAI completed', { model, durationMs, usage })` |

## Date & Time Handling

Use Luxon (`DateTime` from `luxon`) for date and time handling in all code — parsing, formatting, arithmetic, durations, diffs, and time zones. Prefer Luxon's API over raw `Date` / millisecond math for date calculations. Add `luxon` to a package's dependencies when it isn't present yet.

## Code Style Guidelines

### Prettier & ESLint

- Semi: true, single quotes, trailing commas (es5), 80 char line width
- Unused vars are errors (prefix with `_` to ignore)
- `@typescript-eslint/no-explicit-any` is a warning

### Import Order

```typescript
// 1. External dependencies
import { Container, Group, Text } from '@mantine/core';
import { Mic, Play } from 'lucide-react';
import type { ReactNode } from 'react';

// 2. Internal imports with path aliases
import { log } from '@utils/lambda/powertools-utils';
```

**Path aliases**: Frontend `@/*` → `./src/*`, Backend `@utils/*`, `@domains/*`, `@features/*`

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ActiveConditionsCard.tsx` |
| Utilities | kebab-case | `middy-utils.ts` |
| Interfaces/Types | PascalCase | `CardProps`, `PatientInfo` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

### React Component Pattern

```typescript
import { Box, Text } from '@mantine/core';

// Interface before component
export interface MyComponentProps {
  title: string;
  items: Item[];
}

// Named export (primary)
export function MyComponent({ title, items }: MyComponentProps) {
  return (
    <Box><Text>{title}</Text></Box>
  );
}

// Default export (optional, at bottom)
export default MyComponent;
```

### Mantine UI Styling

- Use `style` prop for inline styles, `styles` prop for component customization
- Access theme via `useMantineTheme()` hook
- Use theme spacing: `xs`, `sm`, `md`, `lg`, `xl`
- Avoid deprecated `sx` prop

```typescript
<Button
  styles={{
    root: {
      background: '#E4FFF9',
      '&:hover': { background: '#d4fff4' },
    },
  }}
>
  Click me
</Button>
```

### Lambda Handler Pattern

**Adapters vs Domain Logic**: Adapters (e.g., `api-adapter.ts`) should only handle input validation and call domain logic functions. Business logic belongs in a separate file named after the feature.

```typescript
// feature-name.ts - Domain logic (pure business logic)
import { Resource } from 'sst';

interface DoSomethingInput {
  id: string;
}

export async function doSomething({ id }: DoSomethingInput): Promise<Result> {
  // Business logic here
  return result;
}
```

API endpoints target API Gateway V1 (REST API). New api-adapter files export
only the V1 handler (`mainV1`). Older files may still contain V2 `main`
exports — those are leftovers from a prior migration and are not deployed;
do not add new V2 handlers.

```typescript
// api-adapter.ts - API endpoint adapter (V1)
import type { APIGatewayProxyResult } from 'aws-lambda';
import { apiGatewayWrapperNoIo } from '@utils/lambda/middy-utils';
import { log } from '@utils/lambda/powertools-utils';
import {
  getAuthContextV1,
  unauthorizedV1,
} from '@utils/api/api-utils';
import type { AuthorizedApiEventV1 } from '@utils/api/api-utils';
import { doSomething } from './feature-name';

const handlerV1 = async (
  event: AuthorizedApiEventV1
): Promise<APIGatewayProxyResult> => {
  const context = getAuthContextV1(event);

  if (!context) {
    log.warn('Missing user context from authorizer');
    return unauthorizedV1();
  }

  try {
    const result = await doSomething({ id: context.userID });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    log.error('Operation failed', { error });
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};

export const mainV1 = apiGatewayWrapperNoIo(handlerV1);
```

```typescript
// sqs-adapter-in.ts - SQS event handler
import type { SQSEvent, Handler } from 'aws-lambda';
import { middyWrapper } from '@utils/lambda/middy-utils';
import { log } from '@utils/lambda/powertools-utils';
import sqsBatch from '@middy/sqs-partial-batch-failure';
import { doSomething } from './feature-name';

const handler: Handler = async (event: SQSEvent) => {
  const results = await Promise.allSettled(
    event.Records.map(async (record) => {
      const parsed = JSON.parse(record.body);
      log.info('Processing record', { messageId: record.messageId });
      await doSomething(parsed);
    })
  );

  return results;
};

export const main = middyWrapper(handler).use(sqsBatch());
```

**Middy wrapper choices**:
- `middyWrapper` — Use for SQS handlers and any handler processing PHI. No input/output logging.
- `apiGatewayWrapperNoIo` / `apiGatewayWrapperPostNoIo` — Use for API endpoints. Never logs request/response payloads (V-002/#31); handlers must log entry/exit with operational IDs per the logging minimums above.

### Call Chain Layering

The domain function owns the business logic. Adapters own the translation.
Inbound adapters receive from the outside world and pass domain input to
the domain function. Outbound adapters translate domain output into
external service calls. The domain decides what to do; adapters know how
to talk to the outside world.

```
                                                           ┌→ *-adapter-out.ts
api-adapter.ts / sqs-adapter-in.ts → feature domain (.ts) → entity domain (.ts) → entity -db.ts
```

**Rules:**
- **Inbound adapters** (`api-adapter.ts`, `sqs-adapter-in.ts`) ONLY parse input and call the feature domain function. They never import from `@domains/`, `-db.ts`, or `*-adapter-out.ts` files.
- **Feature domain** (`features/[feature]/[feature].ts`) contains feature-specific business logic, calls entity domain functions from `@domains/`, and calls outbound adapters (`*-adapter-out.ts`) when the feature requires external I/O.
- **Outbound adapters** (`*-adapter-out.ts`) own the external service call (EventBridge, OpenAI, IoT, etc.). Only the feature domain function in the same feature directory may call them.
- **Entity domain** (`domains/[entity]/[operation]/[operation].ts`) contains entity-level logic (validation, orchestration) and calls `-db.ts` files.
- **Entity -db** (`domains/[entity]/[operation]/[operation]-db.ts`) exclusively owns DynamoDB access patterns (PK/SK/GSI mapping). No other layer knows about DynamoDB attributes.

**Adapter anti-patterns** — inbound adapters must NEVER:
- Import from `@domains/[entity]/[operation]/[operation]-db.ts` (skips domain layer)
- Import from `@domains/[entity]/[operation]/[operation].ts` (skips feature domain layer)
- Import from `*-adapter-out.ts` files (outbound I/O belongs in the feature domain layer)
- Contain business logic beyond input parsing and validation

**Cross-feature anti-patterns** — features must NEVER import from other features:
- `features/feature-a/` must not import from `features/feature-b/` (creates horizontal coupling)
- Within nested features, `features/parent/sub-a/` must not import from `features/parent/sub-b/`
- Shared functions or types used by multiple features must be extracted to the parent feature level (e.g., `features/parent/shared-util.ts`) or to a shared module

**Cross-operation anti-patterns** — a domain-logic file must NEVER reach into another operation's `-db.ts`, whether that operation lives in the same entity or a different one:
- No `domains/[entity]/[op-a]/[op-a].ts` may import another operation's `-db.ts` — same-entity (`domains/[entity]/[op-b]/[op-b]-db.ts`) or cross-entity (`domains/[other-entity]/[op]/[op]-db.ts`); either skips that operation's domain layer. In source code, a `-db.ts` is imported only by its own operation's domain-logic file. (Test files are exempt — integration/e2e tests may import any `-db.ts` directly to seed or assert DB state, per the no-mocks testing convention.)
- To orchestrate another operation's persistence, call that operation's **domain function**, not its `-db.ts` — e.g. `upsert-organization.ts` calls `addOrgToRegistry` (same-entity, wraps `addOrgToRegistryInDb`); `provision-user.ts` calls `upsertOrganization` (cross-entity). Neither imports a `-db.ts` directly.
- If an operation has only a `-db.ts` and no domain-logic wrapper, add the thin wrapper (mirroring `get-organization.ts`) rather than calling the `-db.ts` from another operation. Every operation exposes its own domain-logic entry point.

### SST v4 Infrastructure Patterns

Always use SST v4 constructs and their built-in properties instead of raw AWS/Pulumi resources. **Exception**: For service integrations not natively supported by SST (e.g., API GW V1 → SQS direct), use raw Pulumi `aws.*` resources. See `infra/previsit-snapshot/features.ts` for the pattern.

**SST resource names must be PascalCase**:

```typescript
// GOOD
export const eventBus = new sst.aws.Bus('CopilotBus');

// BAD — vitest workers strip hyphenated env vars
export const eventBus = new sst.aws.Bus('copilot-bus');
```

Hyphens break `Resource[...]` lookup inside vitest workers — the `SST_RESOURCE_<name>` env var gets stripped during the fork.

**Raw Pulumi resources must set an explicit `name` with app + stage**:

```typescript
// GOOD
new aws.sns.Topic('MonitoringAlarmsTopic', {
  name: `${$app.name}-${$app.stage}-monitoring-alarms`,
});

// BAD — Pulumi auto-names it `MonitoringAlarmsTopic-9ac6465`; stages collide
new aws.sns.Topic('MonitoringAlarmsTopic');
```

Only SST components add the `<app>-<stage>-` prefix. Set the name at creation — renaming replaces the resource.

**Custom API Gateway V1 resources must be registered for deployment**:

SST's V1 deployment snapshot only tracks SST-managed resources. Custom `MethodResponse`/`IntegrationResponse` resources (e.g., for CORS on SQS direct integrations) must be pushed to `corsIntegrationResources` in `infra/api.ts` so the deployment waits for them. The `IntegrationResponse` must also `dependsOn` its `MethodResponse` — API Gateway rejects the mapping if the header isn't declared first.

```typescript
import { corsIntegrationResources } from '../api';

const methodResponse = new aws.apigateway.MethodResponse('MyMethodResponse', {
  restApi: apiV1.nodes.api.id,
  resourceId: sqsIntegration.nodes.integration.resourceId,
  httpMethod: sqsIntegration.nodes.method.apply((m) => m.httpMethod),
  statusCode: '202',
  responseParameters: {
    'method.response.header.Access-Control-Allow-Origin': true,
  },
});

const integrationResponse = new aws.apigateway.IntegrationResponse(
  'MyIntegrationResponse',
  {
    restApi: apiV1.nodes.api.id,
    resourceId: sqsIntegration.nodes.integration.resourceId,
    httpMethod: sqsIntegration.nodes.method.apply((m) => m.httpMethod),
    statusCode: '202',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': "'*'",
    },
    responseTemplates: {
      'application/json': '{"message": "accepted"}',
    },
  },
  { dependsOn: [methodResponse] }
);

corsIntegrationResources.push(methodResponse, integrationResponse);
```

**Feature infrastructure belongs in `infra/<feature-name>/features.ts`**:

Never add feature routes directly to `api.ts`. The `api.ts` file should only create the API and authorizer. Feature-specific routes go in their own infrastructure file.

```typescript
// infra/api.ts - Only API creation and authorizer
import { auth } from './auth';

export const api = new sst.aws.ApiGatewayV2('Api', {
  cors: { /* ... */ },
});

export const authorizer = api.addAuthorizer({
  name: 'auth',
  lambda: {
    function: {
      handler: 'backend/features/authorizer-lambda/handler.main',
      link: [auth],
    },
  },
});
```

```typescript
// infra/my-feature/features.ts - Feature-specific routes (V1)
import { apiV1, authorizerV1 } from '../api';
import { someSecret } from '../secrets';

apiV1.route(
  'GET /my-endpoint',
  {
    handler: 'backend/features/my-feature/api-adapter.mainV1',
    link: [someSecret],
  },
  {
    auth: {
      custom: authorizerV1.id,
    },
  }
);
// V1 requires deployApiV1() after all routes are registered (called in sst.config.ts)
```

Then import in `sst.config.ts`:
```typescript
await import('./infra/api');
await import('./infra/my-feature/features');
```

**Use `permissions` instead of `aws.iam.RolePolicy`**:

```typescript
// GOOD: SST v4 approach
new sst.aws.Function('MyFunction', {
  handler: 'backend/features/my-feature/handler.main',
  permissions: [
    {
      actions: ['kms:Decrypt', 'kms:Encrypt', 'kms:GenerateDataKey'],
      resources: [kmsKey.arn],
    },
  ],
});

// BAD: Verbose raw AWS approach (avoid)
const fn = new sst.aws.Function('MyFunction', { ... });
new aws.iam.RolePolicy('MyFunctionKmsPolicy', {
  role: fn.nodes.function.nodes.role.name,
  policy: kmsKey.arn.apply((arn) => JSON.stringify({ ... })),
});
```

**Use `transform` for underlying resource customization**:

```typescript
new sst.aws.Queue('MyQueue', {
  transform: {
    queue: (args) => {
      args.receiveWaitTimeSeconds = 20;
    },
  },
});

new sst.aws.Dynamo('MyTable', {
  transform: {
    table: (args) => {
      args.serverSideEncryption = { enabled: true, kmsKeyArn: key.arn };
    },
  },
});
```

**Use `link` for automatic resource access**:

```typescript
new sst.aws.Function('MyFunction', {
  handler: 'backend/handler.main',
  link: [bucket, table, secret], // Grants read/write permissions automatically
});
```

**Externalize configuration with `sst.Linkable`**:

Never hardcode configuration values (URLs, feature flags, etc.) in backend code. Use `sst.Linkable` to define configuration in infrastructure and access it via `Resource` in backend code.

```typescript
// infra/my-feature/features.ts - Define configuration
const apiBaseUrl = new sst.Linkable('ApiBaseUrl', {
  properties: {
    value: 'https://api.example.com/v1',
  },
});

apiV1.route(
  'GET /my-endpoint',
  {
    handler: 'backend/features/my-feature/api-adapter.mainV1',
    link: [apiBaseUrl], // Link the configuration to the Lambda
  },
  { auth: { custom: authorizerV1.id } }
);
```

```typescript
// backend/features/my-feature/my-feature.ts - Access configuration
import { Resource } from 'sst';

export function callExternalApi() {
  const url = new URL(Resource.ApiBaseUrl.value); // Access via Resource
  // ...
}
```

For stage-varying configuration (different values per environment), use `env.config.ts`:

```typescript
// infra/env.config.ts - Add new config to EnvironmentConfig interface and environments object
interface EnvironmentConfig {
  externalApiUrl: string; // Add new config property
}

export const environments: Environment = {
  [Stage.local]: {
    externalApiUrl: 'https://sandbox.api.example.com',
  },
  [Stage.dev]: {
    externalApiUrl: 'https://sandbox.api.example.com',
  },
  [Stage.staging]: {
    externalApiUrl: 'https://staging.api.example.com',
  },
  [Stage.prod]: {
    externalApiUrl: 'https://api.example.com',
  },
};

// infra/my-feature/features.ts - Use envConfig() to access stage-specific values
import { envConfig } from '../env.config';

const externalApiUrl = new sst.Linkable('ExternalApiUrl', {
  properties: { value: envConfig().externalApiUrl },
});
```

**Use SST component methods**:

```typescript
// Queue subscriptions
queue.subscribe(
  { handler: '...', link: [bucket] },
  { batch: { partialResponses: true } }
);

// EventBridge subscriptions
defaultBus.subscribeQueue('Subscription', queue, {
  pattern: { source: ['aws.s3'], detailType: ['Object Created'] },
});
```

## Directory Structure

### File Organization

**Backend**:

```
backend/
├── domains/[entity]/           # Core business domains
│   ├── [entity].ts             # Domain types + Zod schemas (source of truth)
│   ├── create-[entity]/        # Create operations
│   │   ├── create-[entity].ts  # Domain logic
│   │   └── create-[entity]-db.ts
│   └── get-[entity]/           # Read operations
│       ├── get-[entity].ts     # Domain logic
│       └── get-[entity]-db.ts
├── features/[feature-name]/    # API endpoints & event handlers
│   ├── [feature-name].ts       # Domain logic (business logic)
│   ├── api-adapter.ts          # API Gateway handler (input validation only)
│   ├── sqs-adapter-in.ts       # SQS event handler
│   ├── lambda-adapter-in.ts    # Generic Lambda handler
│   ├── *-adapter-out.ts        # Outbound adapters (OpenAI, EventBridge, IoT)
│   ├── [feature].unit.test.ts  # Unit tests
│   └── ~e2e.test.ts            # E2E tests
└── utils/                      # Shared utilities
    ├── lambda/                 # Lambda-specific utils
    ├── middy/                  # Middy middleware
    ├── s3/                     # S3 utilities
    └── test/                   # Test utilities
```

Each operation type (create, get, update, delete) gets its own subfolder. Do not mix operations — e.g., a `getSnapshot` function does not belong in `create-snapshot/`.

**Domain separation of concerns**: Domain functions (`[operation].ts`) do NOT know about DynamoDB attributes (PK/SK/GSI). Only `-db.ts` files know how to map domain entities to DynamoDB items.

**Domain entity ownership**: Every domain defines its canonical entity types in
`backend/domains/<entity>/<entity>.ts`. These types are the source of truth for
that domain.

**DB return contracts**: Every `*-db.ts` function must return a known
domain-owned entity or domain-owned DTO. Do not return
`Record<string, unknown>`, feature schema types, or ad hoc temporary row
interfaces as the public function contract.

**DB function naming**: Public `*-db.ts` functions should use explicit DB-layer
names like `getXFromDb`, `listXFromDb`, `createXInDb`, or `updateXInDb`.
Avoid storage-shape names like `Rows` in public DB function names.

**Feature/domain separation**: Domain and DB layers must not import from
`backend/features/**` for types or schemas. Feature schemas define transport
contracts only; they do not own domain entities.

**Nested features** (for related functionality):

```
backend/features/
└── parent-feature/             # Parent grouping folder
    ├── sub-feature-a/          # Sub-feature A
    │   ├── sub-feature-a.ts    # Domain logic
    │   └── api-adapter.ts      # Adapter
    └── sub-feature-b/          # Sub-feature B
        ├── sub-feature-b.ts    # Domain logic
        └── api-adapter.ts      # Adapter
```

**Infrastructure**:

```
infra/
├── api.ts                      # API Gateway + authorizer ONLY
├── auth.ts                     # Auth configuration
├── secrets.ts                  # Secret definitions
├── dynamodb.ts                 # DynamoDB tables
├── s3.ts                       # S3 buckets
├── bus.ts                      # EventBridge buses
└── [feature-name]/             # Feature-specific infrastructure
    └── features.ts             # Routes, queues, etc. for this feature
```

**Frontend**:

```
frontend/src/components/  # Reusable components
frontend/src/routes/      # TanStack Router file-based routes
```

## Environment

- Node.js 22+, pnpm 10.x (see `packageManager` field)
- **Always use pnpm** (not npm or yarn)
- **Before running pnpm**, ensure fnm is initialized:
  ```bash
  eval "$(fnm env --use-on-cd --shell bash)"
  ```

## Common Patterns

**New API Endpoint**:
1. Create domain logic in `backend/features/[feature]/[feature].ts`
2. Create adapter in `backend/features/[feature]/api-adapter.ts` — export only `mainV1` (V1-only; do not add a V2 `main` handler)
3. Create infrastructure in `infra/[feature]/features.ts` — V1 route using `apiV1.route()` with `authorizerV1`
4. Import infrastructure in `sst.config.ts` (before `deployApiV1()` call)

**New Frontend Route**: Create in `frontend/src/routes/` (TanStack Router conventions) → Use Mantine for UI

**New Component**: Create in `frontend/src/components/` with props interface → Named export + optional default export
