---
name: audit-slice-tests
description: Audit test coverage for a slice against AGENTS.md and TESTS.md
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

Follow these rules in order:

1. **Read-only.** Do not edit files, modify git state, or run tests, builds,
   deploys, or non-git shell commands. Git commands may inspect status, history,
   and diffs only. This overrides any plan or source request to execute
   validation.
2. **Scope and evidence.** Audit only the target plan, its implementation and
   tests, governing sources, and direct references needed to verify those tests.
   Ground every finding in current implementation and test evidence plus an
   applicable requirement. A reference read does not make that file finding
   scope. Ignore unrelated worktree changes and observations. If this permitted
   evidence boundary cannot support a required conclusion, return `FAILED`
   without unsupported substantive findings.
3. **Do not guess.** Resolve contradictions using source authority. If accessible
   evidence leaves consequential behavior, ownership, contract semantics,
   persisted shape, test tier, approval, or scope unclear, emit a `needs-user`
   blocker and batch the minimum questions needed to proceed.
4. **Required tiers.** A missing test tier required under `Source Material` is
   Critical and `repair-required`; inability to run tests does not reduce its
   severity.
5. **Repeat-run focus.** Report only gaps that remain in current files and diffs.
   Do not rely on memory or restate resolved areas or passing checks.

## Task

Audit one slice's test coverage against approved behavior and current repository
test requirements.

## Inputs

Supported invocations:

- `/audit-slice-tests sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/audit-slice-tests <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing path supplied as the first
argument; otherwise glob `sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: print the attempted glob and return `FAILED`.
- Multiple matches: list them, ask the user to choose, and return `NEEDS_USER`.
- One match: continue. Never auto-pick among multiple plans.

Required evidence:

- The full plan, root `AGENTS.md`, applicable nested `AGENTS.md` files,
  `TESTS.md`, and `docs/decision-authority.md`.
- The PRD and tracked checklist when referenced by the plan, plus relevant
  session context or decision logs when needed to verify claimed approval.
- `git status --short`, `git diff`, `git diff --cached`, relevant untracked
  files, and any base diff required by the plan or workflow.
- In-scope implementation entry points, behavior branches, schemas, persistence,
  external boundaries, infrastructure wiring, and colocated or nearby tests for
  every relevant tier.
- Direct helpers, constants, models, `*-db.ts` mappings, and
  `backend/utils/aws-test/` utilities needed to verify assertions.

## Output Format

Every response ends with exactly one valid `WORKFLOW_RESULT` footer as its final
nonblank line. This read-only audit never emits `CHANGED`.

Severity and disposition are independent:

- `Critical` means missing required coverage or violation of a core test,
  security, privacy, or correctness rule.
- `Warning` means a concrete risk of flaky tests, contamination, or missed
  coverage.
- `Info` means an optional or low-impact improvement.
- `repair-required` means a plan, production, or test defect must be fixed.
- `advisory-nonblocking` means an optional improvement may safely advance.
- `needs-user` means an unresolved consequential decision blocks a reliable
  conclusion.

Assign the earliest owner before writing an item:

| Owner step | Responsibility |
|---|---|
| 0 | Broad or cross-cutting plan consistency |
| 1 | Requirements, scope, acceptance criteria, or decision authority |
| 2 | Schemas, fields, types, or external/domain contracts |
| 3 | Architecture, mapping, layering, ownership, or file touchpoints |
| 5 | Production defects exposed by or preventing correct tests |
| 7 | Missing, incorrect, flaky, or noncompliant tests |

Use `Critical`, `Warnings`, and `Info` sections for findings. Each finding has:

- `Severity: Critical|Warning|Info`
- `Disposition: repair-required|advisory-nonblocking`
- `Owner step: 0|1|2|3|5|7`
- `Evidence:` specific file and line range or diff hunk, plus the applicable
  governing source for test-convention findings
- `Problem:` observed gap or defect
- `Impact:` concrete consequence
- `Required action:` smallest appropriate remediation

Use `Blockers` only for questions requiring user input. Each blocker has:

- `Disposition: needs-user`
- `Owner step: 0|1|2|3|5|7`
- `Decision class: Agent-Recommended|Needs User Approval`
- `Evidence:` accessible evidence establishing the unresolved decision or
  missing substantive detail; inaccessible required artifacts follow Critical
  Rule 2 instead
- `Question:` minimum question needed to proceed

Omit empty sections. If no items remain, say:

`No remaining test coverage issues found for this slice.`

End the human-readable body with `Validation:` and state:

- the static git, implementation, and test evidence inspected;
- the recorded command outputs inspected, or which required records were
  unavailable; and
- that this read-only audit did not run executable checks.

Choose the footer in this order:

1. `WORKFLOW_RESULT: FAILED` if an operational inability prevents a complete
   audit.
2. `WORKFLOW_RESULT: NEEDS_USER` if any blocker remains.
3. `WORKFLOW_RESULT: REMEDIATE:<step>` if any `repair-required` finding remains,
   using the earliest owner step.
4. `WORKFLOW_RESULT: ADVISORY` if only advisory findings remain.
5. `WORKFLOW_RESULT: CLEAN` if no items remain.

## Source Material

Apply authority by subject:

- Applicable `AGENTS.md` files govern repository engineering constraints and
  override conflicting test guidance.
- Subject to applicable `AGENTS.md` rules, `TESTS.md` governs test tiers, style,
  mocks, fixtures, cleanup, AWS assertions, and verification commands.
- Explicit user-approved decisions, the PRD, and the tracked checklist govern
  product behavior and scope. Use `docs/decision-authority.md` to determine when
  approval is required.
- The plan governs slice-specific coverage and acceptance details when consistent
  with the sources above.
- Implementation and tests prove current behavior and coverage; they do not
  define requirements.

When same-subject authoritative sources still conflict, apply Critical Rule 3.

## Audit Workflow

1. Read all required and referenced evidence. Starting from plan touchpoints and
   changed entry points, discover every test pattern and location required under
   `Source Material`, including `*.unit.test.ts`, `*.int.test.ts`, and
   `*.e2e.test.ts` where applicable. Use imports and behavior references to
   establish relevance, then follow direct dependencies only until the behavior
   or assertion is verified.
2. Internally map every applicable requirement, acceptance criterion, contract,
   behavior branch, edge case, error path, idempotency risk, persisted effect, and
   wiring risk to the tier required under `Source Material` and to existing test
   evidence or one finding. Passing mappings need not appear in the response.
3. Trace each in-scope diff hunk and changed export, contract, or wiring path
   through direct callers, infrastructure, and existing tests to identify
   regression scenarios. For each changed schema or contract, compare producers,
   consumers, optionality, defaults, transformations, persisted or external
   shapes, and the exact test assertions.
4. Verify tier selection and missing coverage under `Source Material`, using
   current `TESTS.md` subject to applicable `AGENTS.md` rules. Include isolated
   logic and schemas, real AWS-backed persistence, and the feature's deployed
   entry point or async wiring when applicable.
5. Apply current `TESTS.md` rules and exceptions to each in-scope test:
   - naming, placement, and the code entry point under test;
   - mock boundaries and mock setup order, including `vi.hoisted()` when required;
   - synthetic non-PHI fixtures, collision-safe IDs, and targeted cleanup; check
     fixtures and test configuration for prohibited patient-identifying data,
     secrets, credentials, tokens, and production-only resource identifiers;
   - assertions derived from implementation rather than guessed keys, names,
     shapes, messages, or metadata;
   - protected-endpoint auth rejection and network timeout coverage when
     applicable.
   Flag tests that codify product, privacy, external-contract, reliability, or
   established-pattern behavior without required approval under
   `docs/decision-authority.md`. Report overcomplicated or pattern-breaking test
   approaches against applicable `AGENTS.md` even when the plan permits them.
6. **AWS side-effect assertions.** For each integration or e2e scenario with an
   observable AWS-backed side effect after a write, put, publish, or handler
   invocation:
   - identify the first assertion after the act step and its actual read path
     (deterministic point lookup, query/list or GSI, generated-key discovery,
     object read, message collection, or another service observation);
   - verify the service-specific `expectAws` helper, setup, assertion, and cleanup
     required by `TESTS.md`;
   - require a documented `backend/utils/aws-test/` extension when no helper
     covers the service;
   - allow richer direct domain or service re-reads only after the documented
     `expectAws` assertion has settled;
   - flag `expectAws.toHave*` in `beforeAll` or `afterAll` when used as a setup or
     cleanup synchronization barrier.
7. **Feature integration entrypoint.** For each backend feature integration test,
   inspect imports and the act step. Verify it invokes the real Lambda handler
   entry point (`main`, `mainV1`, or equivalent adapter export) when required by
   `TESTS.md`, rather than directly calling the feature-domain function. Do not
   apply this rule to entity-domain integration tests.
8. Inspect recorded plan-required test commands when evidence is available. Do
   not infer that a command was not run from silence or claim a result without
   recorded output. If required verification evidence is unavailable and blocks
   a complete audit, apply Critical Rule 2.
9. Re-read current in-scope files and diffs, confirm each gap still exists, and
   classify every item once.

## Final Validation

Before responding, confirm:

1. The audit remained read-only and slice-scoped, and all required evidence was
   accessible and read.
2. Test discovery covered all repository filename patterns and relevant
   locations; every applicable requirement and risk was mapped to a tier and test
   evidence or one finding.
3. Changed behavior, schemas, contracts, callers, and wiring were traced for
   regression coverage, and fixture security rules were applied.
4. The AWS first-side-effect assertion and backend feature handler procedures
   were completed whenever applicable.
5. Every item remains present, cites concrete evidence and applicable source
   authority, and has consistent severity, disposition, and the earliest owner.
6. Consequential unresolved assumptions are blockers, not guesses, and the
   validation disclosure identifies static and recorded evidence without
   claiming executable checks ran.
7. Exactly one allowed `WORKFLOW_RESULT` footer is the final nonblank line.
