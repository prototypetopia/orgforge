---
name: implement-slice-tests
description: Implement missing tests for a slice according to AGENTS.md and TESTS.md
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

Follow these rules in order:

1. **Slice safety.** Change only tests for the target slice and eligible tiny
   production fixes. This skill never commits, even when requested in the same
   invocation. Do not update plan or checklist status without an explicit
   request, modify unrelated files, or revert user changes.
2. **Evidence, not assumptions.** Derive every test scenario, value, assertion,
   cleanup target, and expected result from governing sources and current code.
   Never invent keys, resource names, shapes, fields, errors, or behavior. If
   accessible evidence leaves a consequential decision unresolved, ask the
   minimum set of related blocker questions in one concise round instead of
   guessing. If a required artifact is operationally inaccessible and prevents
   safe completion, return `FAILED` without unsupported changes.
3. **Production authority.** Apply a production fix only when it is local,
   evidence-proven, slice-scoped, and conforms implementation to
   already-authoritative behavior without changing contracts, schemas, ownership,
   or approved semantics. Route larger Agent-Owned defects to step 5; ask only
   when authority, ownership, expected behavior, or the repair is genuinely
   unclear or approval-gated. Preserve explicit approvals as `User-Approved`
   evidence.
4. **Source compliance.** Apply test tiers, mocks, shape, fixtures, cleanup, AWS
   assertions, and validation required under `Source Material`, honoring
   documented exceptions. Embedded examples do not override governing sources.
   Unavailable local validation never permits omission of a required test tier or
   file. Implement safe required tests first; successful required validation still
   controls `CHANGED` and `CLEAN`, and an operational blocker returns `FAILED`.
5. **Repeat-run focus.** Preserve already-correct tests and prior approved
   decisions reflected in code or conversation. Avoid cosmetic churn, broad
   rewrites, and duplicate questions.

## Task

Implement every test required for one slice, verify it, and route any production
defect or user decision without broadening scope. Among complete test sets, choose
the smallest without duplicate coverage.

## Inputs

Supported invocations:

- `/implement-slice-tests sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/implement-slice-tests <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing path supplied as the first
argument; otherwise glob `sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: print the attempted glob and return `FAILED`.
- Multiple matches: list them, ask the user to choose, and return `NEEDS_USER`.
- One match: continue. Never auto-pick among multiple plans.

Required evidence:

- The full plan, root `AGENTS.md`, applicable nested `AGENTS.md` files,
  `TESTS.md`, and `docs/decision-authority.md`.
- The PRD and tracked checklist when referenced by the plan, plus relevant
  session context or decision logs when needed to verify approval.
- `git status --short`, `git diff`, `git diff --cached`, relevant untracked
  files, and any base diff required by the plan or workflow.
- In-scope implementation entrypoints, behavior branches, schemas, constants,
  persistence mappings, external boundaries, infrastructure, helpers, and tests
  for every relevant tier.
- `backend/utils/aws-test/` utilities when integration or e2e assertions observe
  AWS resources.

## Output Format

Return a terse delta report. Omit empty sections.

### Tests Changed

List each added or modified test file with one-line coverage detail.

### Validation

List every command run with pass/fail, exit status, and a concise result or
diagnostic summary. For each applicable command not run, state the exact blocker
and next command. State why typecheck, lint, build, or broader regression checks
were not applicable when they would ordinarily be expected from the changed file
types or boundaries. Never claim success for a command that did not run.

### Production Fixes

Production Fixes and Production Findings both include:

- `Disposition: repair-required`
- `Owner step: 5`
- `Evidence:` current file and applicable requirement
- `Required action:` smallest production remediation

For each eligible production change, also include:

- `Status: applied; step 5 review required`

`REMEDIATE:5` after an applied fix routes production ownership and review; it
does not mean the same edit remains undone. For an applied fix,
`repair-required` means step 5 review is required; `Status: applied` means the
edit is complete and must not be repeated.

### Production Findings

List evidence-backed Agent-Owned production defects not edited because they
exceed tiny-fix authority. Include the shared production fields and
`Status: not applied`.

### Blockers

Use only for user input required before the next safe change. Each blocker has:

- `Disposition: needs-user`
- `Owner step: 0|1|2|3|5|7`
- `Decision class: Agent-Recommended|Needs User Approval`
- `Evidence:` accessible conflicting or incomplete authority
- `Question:` minimum question needed to proceed

End every response with exactly one footer as the final nonblank line. Never emit
`ADVISORY`. Choose in this order:

1. `WORKFLOW_RESULT: NEEDS_USER` if any blocker remains. If production code was
   also fixed, include its production-fix fields so the workflow can resume at
   step 5 after the decision.
2. `WORKFLOW_RESULT: FAILED` if an unresolvable environment, command,
   credentials, or operationally inaccessible required artifact prevents
   completion or validation. Do not use it for a fixable test failure or user
   decision established by accessible evidence.
3. `WORKFLOW_RESULT: REMEDIATE:5` if no blocker or operational failure remains
   and a production fix or Agent-Owned production finding exists.
4. `WORKFLOW_RESULT: CHANGED` if only tests changed and all required validation
   succeeded.
5. `WORKFLOW_RESULT: CLEAN` if no files changed and all required validation
   succeeded.

## Source Material

Apply authority by subject:

- Applicable `AGENTS.md` files govern repository engineering and safety
  constraints and override conflicting test guidance.
- Subject to applicable `AGENTS.md`, current `TESTS.md` governs test tiers, style,
  mocks, fixtures, cleanup, AWS assertions, and verification commands.
- Explicit user-approved decisions, the PRD, and the tracked checklist govern
  product behavior and scope. Use `docs/decision-authority.md` to determine
  whether a decision is Agent-Owned, Agent-Recommended, Needs User Approval, or
  User-Approved.
- The plan governs slice-specific acceptance and verification details when
  consistent with the sources above.
- Implementation and existing tests prove current behavior and local style; they
  do not define requirements.

Local style applies only where governing sources do not mandate a pattern. If
same-subject authoritative sources still conflict, apply Critical Rule 2.

## Implementation Workflow

1. **Discover evidence.** Read all required evidence before editing. Discover
   every test pattern and location required under `Source Material`, using
   imports and behavior references to identify relevant nearby tests and helpers.
   Prefer colocated tests and existing local helpers over new abstractions where
   governing sources permit.
2. **Coverage map and tiers.** Build an internal coverage map from every
   applicable acceptance criterion, contract, branch, schema case, error path,
   edge case, idempotency risk, persisted effect, security requirement, and
   wiring risk to its authoritative tier and one planned or existing scenario.
   Derive applicable required, optional, malformed, unknown, and boundary-value
   schema cases from the actual contract. Derive applicable authorization,
   ownership-isolation, PHI-safety, and external-call security cases from current
   authority and touched behavior. Satisfy every authoritative entry and tier
   before applying minimality; then avoid duplicate scenarios already covered at
   the correct tier.
3. Select every required tier under `Source Material`. In particular, do not
   substitute mocked unit coverage for required real-I/O integration coverage,
   invoke the real Lambda handler in backend feature integration tests when
   required, and cover deployed infrastructure wiring with e2e tests when the
   authoritative risk model requires it. Do not add redundant low-value unit
   tests for a Lambda adapter that only validates input, delegates once, and
   returns a result when integration and e2e are the authoritative fit.
4. **Implement tests.** Implement the smallest complete set using current
   governing rules and local style where unconstrained:
   - use Vitest, required naming and placement, repository import style, and
     required scenario structure;
   - apply permitted mock boundaries and setup order, including `vi.hoisted()`
     before `vi.mock()` and imports when required;
   - derive keys, indexes, resource names, object paths, shapes, cleanup keys,
     error types/messages, metadata, and throw/no-op/update behavior from code;
   - use unique synthetic non-PHI data, collision-safe IDs, required auth
     rejection scenarios, and network timeouts;
   - target cleanup to every persisted resource created by the test, including
     resources created before a setup or scenario partially fails.
   If correct testing requires many mocks or an unsupported seam, stop forcing
   the test. Never refactor the seam unless it meets Critical Rule 3; otherwise
   emit a Production Finding or Blocker as appropriate.
5. **AWS side effects.** For each integration or e2e scenario with an observable
   AWS-backed side effect after a write, put, publish, or handler invocation:
   - identify the first assertion and actual read path;
   - use the service-specific `expectAws` setup, matcher, and cleanup required by
     current authority;
   - extend `backend/utils/aws-test/` under its documented pattern when no helper
     covers the service;
   - perform richer direct re-reads only after the authoritative matcher settles;
   - never use eventual-consistency matchers in `beforeAll` or `afterAll` as
     setup or cleanup synchronization barriers.
6. **Production defects.** If tests expose a production defect, classify it
   before editing:
   - apply only an eligible tiny fix under Critical Rule 3;
   - report a clear larger Agent-Owned defect as a Production Finding;
   - emit a Blocker only for a genuinely unresolved or approval-gated decision.
   Report plan-permitted overcomplicated or pattern-breaking test approaches
   against applicable `AGENTS.md` rather than treating the plan as authority.
7. **Validation matrix.** Before running commands, determine whether targeted
   tests, broader regressions, typecheck, lint, build or infrastructure synthesis,
   schema/security scenarios, and runtime or AWS checks apply. Record internally
   the governing source and exact command for each applicable check and the reason
   for excluding any check normally implied by the changed files or boundary. Do
   not add unnecessary checks to isolated test-only changes.
8. **Diff review.** Review staged, unstaged, and relevant untracked changes,
   inspecting production edits separately from test edits. Confirm every edit is
   slice-scoped, every assertion and cleanup target is evidence-derived, all
   coverage-map scenarios are implemented, and unrelated user changes remain
   untouched. Remove only in-scope accidental focused or skipped tests, stale
   snapshots, debug output, generated artifacts, and dependency changes.
9. **Verify.** Run the smallest targeted test command for each changed test file
   plus every applicable command identified in the validation matrix. When
   production code changes, run tests exercising the affected behavior and the
   applicable typecheck and lint; add broader regressions when shared helpers,
   fixtures, AWS matchers, or test utilities changed. Run a build or
   infrastructure synthesis check only when a touched build-time boundary or
   governing source requires it. Classify failures as assertion, collection,
   compilation, infrastructure, credentials, timeout, or cleanup failures. Fix
   slice-scoped causes and rerun the same command until successful or
   operationally blocked.

## Verification Commands

Initialize fnm before any `pnpm` command:

`eval "$(fnm env --use-on-cd --shell bash)"`

- Backend single-file test from `backend`:
  `LOG_LEVEL=SILENT sst shell -- vitest run <path>`
- Frontend single-file test from `frontend`: `pnpm vitest run <path>`

If required validation cannot run, preserve completed safe changes and report the
exact command, failure or blocker, and next action. Environment constraints do
not justify omitting required test files.

## Final Validation

Before responding, confirm:

1. Required evidence was read and every coverage-map scenario and required test
   file is implemented at its authoritative tier, including applicable schema,
   runtime, edge, regression, security, and partial-failure cleanup cases,
   regardless of local validation availability.
2. Changed tests satisfy Critical Rules 2 and 4, including applicable real-I/O,
   AWS assertion, handler-entrypoint, wiring, and complete cleanup procedures.
3. The validation matrix accounts for targeted tests, broader regressions,
   typecheck, lint, build or synthesis, schema/security scenarios, and runtime or
   AWS checks without imposing irrelevant commands.
4. Explicit approvals remain `User-Approved`; unsupported seams and production
   defects obey Critical Rule 3; the final diff preserves unrelated changes and
   contains no in-scope focused or skipped tests, stale snapshots, debug output,
   generated artifacts, or accidental dependency edits.
5. Fnm initialization and the correct backend or frontend working directory were
   used. Every applicable command is reported with pass/fail, exit status, and a
   concise result, or with its exact blocker and next command; no unrun check is
   claimed successful.
6. Exactly one allowed footer is the final nonblank line and matches the ordered
   result rules.
