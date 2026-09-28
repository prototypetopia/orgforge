---
name: audit-slice-implementation
description: Audit a slice implementation against its plan and report remaining issues
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

Follow these rules in order:

1. **Read-only.** Do not edit files, modify git state, or run tests, builds,
   deploys, or non-git shell commands. Git commands may inspect status, history,
   and diffs only.
2. **Complete evidence.** Ground every finding in current implementation evidence
   and an applicable requirement or repository rule. If a required artifact
   cannot be accessed and that prevents a complete audit, return `FAILED`
   without unsupported substantive findings.
3. **Slice scope.** Audit only the target plan, its implementation, and direct
   dependencies needed to verify that implementation. Ignore unrelated worktree
   changes.
4. **Do not guess.** When source authority resolves a contradiction, report a
   finding against the lower-authority source. When accessible evidence
   establishes that a consequential conflict or required approval remains
   unresolved, emit a `needs-user` blocker and batch the minimum questions
   needed to proceed. This substantive gap is not an operational evidence
   failure under Rule 2.
5. **Repeat-run focus.** Report only findings that remain in the current files
   and diff. Do not rely on memory or restate resolved areas or passing checks.
6. **Exclude test coverage.** Do not report ordinary missing, incomplete, or
   incorrect tests. Steps 7 and 8 own tests. Report production defects that
   prevent required tests from being written or run normally.

## Task

Audit one slice implementation against its plan and applicable source material.
Check correctness, regressions, requirements, acceptance criteria, contracts,
schemas, architecture, mapping, layering, ownership, file placement, decision
authority, complexity, and non-test verification. For relevant serverless code,
also check operations, logging, and PHI safety; PHI logged above `debug` is a
Warning.

## Inputs

Supported invocations:

- `/audit-slice-implementation sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/audit-slice-implementation <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing path supplied as the first
argument; otherwise glob `sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: print the attempted glob and return `FAILED`.
- Multiple matches: list them, ask the user to choose, and return `NEEDS_USER`.
- One match: continue. Never auto-pick among multiple plans.

Required evidence:

- The full plan, root `AGENTS.md`, applicable nested `AGENTS.md` files, and
  `docs/decision-authority.md`.
- The PRD and tracked checklist when referenced by the plan. Read relevant
  session context or decision logs when referenced or needed to verify a claimed
  locked or user-approved decision.
- `git status --short`, `git diff`, `git diff --cached`, relevant untracked
  files, and every in-scope implementation file needed to verify behavior.
- A branch or base diff only when the plan or workflow identifies that baseline.

## Output Format

Every response ends with exactly one valid `WORKFLOW_RESULT` footer as its final
nonblank line. This read-only audit never emits `CHANGED`.

Each item appears once. Severity does not determine disposition:

- `Critical` means an immediate correctness, security, contract, or behavior
  break.
- `Warning` means a concrete non-immediate risk or repository violation.
- `Info` means an optional or low-impact improvement.
- `repair-required` means correctness, a contract, or a repository requirement
  must be fixed.
- `advisory-nonblocking` means an optional improvement may safely advance.
- `needs-user` means a consequential unresolved decision blocks a reliable
  conclusion.

Assign the earliest owner step before writing each item:

| Owner step | Responsibility |
|---|---|
| 0 | Broad or cross-cutting plan consistency |
| 1 | Requirements, scope, acceptance criteria, or decision authority |
| 2 | Schemas, fields, types, or external/domain contracts |
| 3 | Architecture, mapping, layering, ownership, or file touchpoints |
| 5 | Production implementation or non-test verification |
| 7-8 | Tests; do not emit these findings in this audit |

Do not default plan defects to step 3. Production defects route to step 5.

Use `Critical`, `Warnings`, and `Info` sections for findings. Every finding
includes:

- `Severity: Critical|Warning|Info`
- `Disposition: repair-required|advisory-nonblocking`
- `Owner step: 0|1|2|3|5`
- `Evidence:` specific file and line range or diff hunk
- `Problem:` observed defect
- `Impact:` concrete consequence
- `Required action:` smallest appropriate remediation

Use `Blockers` only for questions requiring user input. Every blocker includes:

- `Disposition: needs-user`
- `Owner step: 0|1|2|3|5`
- `Decision class: Agent-Recommended|Needs User Approval`
- `Evidence:` conflicting files, lines, or diff hunks
- `Question:` minimum question needed to proceed

Omit empty sections. End the human-readable body with:

`Validation: read-only static audit; executable checks were not run.`

Executable checks include tests, builds, lint, type checks, and runtime commands.
If plan-required recorded verification was inspected, name that evidence without
implying this audit ran it. If a required conclusion depends on unavailable
runtime evidence, return `FAILED`.

If no items remain, the body before the validation line is:

`No remaining issues found for this slice.`

Choose the footer in this order:

1. `WORKFLOW_RESULT: FAILED` if an operational inability prevents a complete
   audit.
2. `WORKFLOW_RESULT: NEEDS_USER` if any blocker remains.
3. `WORKFLOW_RESULT: REMEDIATE:<step>` if any `repair-required` finding remains,
   using the earliest owner step among those findings.
4. `WORKFLOW_RESULT: ADVISORY` if only advisory findings remain.
5. `WORKFLOW_RESULT: CLEAN` if no items remain.

## Source Material

Apply authority by subject:

- Applicable `AGENTS.md` files govern repository engineering constraints.
- Explicit user-approved decisions, the PRD, and the tracked checklist govern
  product behavior and tracked scope. Use `docs/decision-authority.md` to decide
  when approval is required.
- The plan governs slice-specific implementation and acceptance details when it
  is consistent with the applicable sources above.
- The implementation and diff prove current behavior; they do not define the
  requirement.

When same-subject authoritative sources conflict, required approval is absent,
or expected behavior, ownership, contract semantics, or scope remains unclear,
apply Critical Rule 4.

## Audit Steps

1. Read all required and referenced evidence.
2. Inspect status, staged and unstaged diffs, relevant untracked files, and any
   required base diff. Map each in-scope hunk to the slice. Starting from changed
   entry points, follow direct imports, callers, configuration, and infrastructure
   until behavior reaches an unchanged or external boundary; do not follow
   unrelated dependencies.
3. Internally map every plan requirement and acceptance criterion to current-file
   evidence or one finding. Passing checks need not appear in the response.
4. Statically trace success paths, major decisions, failure paths, I/O, and state
   transitions. Check applicable malformed or missing input, empty results,
   retries, duplicates, and partial failures.
5. For each changed contract or schema, compare producers and consumers,
   optionality, defaults, transformations, and persisted or external shapes.
6. Trace changed exports, contracts, and behavior through direct callers and
   infrastructure to identify regressions against governing requirements and
   unchanged expected behavior.
7. For in-scope serverless resources, apply only checks relevant to the service
   and invocation mode, honoring documented exceptions:
    - **Security:** Hardcoded secrets are Critical. Broad IAM permissions are a
      Warning when narrower service-supported scope exists without justification.
    - **Reliability:** Check service-appropriate failure handling and idempotency
      for duplicate-capable delivery. When an asynchronous invocation requires
      terminal failure handling, absence of a DLQ, `onFailure` destination, or
      documented service-appropriate equivalent is a Warning. Flag synchronous
      long-running work or chained Lambda orchestration when durable async
      execution, state, retries, or failure handling are required. Treat
      unnecessary intermediary Lambdas and unsuitable default timeouts as Info.
    - **Observability:** Apply the layer-specific logging and PHI rules in
      `AGENTS.md`.
8. Inspect recorded plan-required verification when available, but do not run or
   claim to have run executable checks. If a required conclusion depends on
   unavailable runtime evidence, apply Critical Rule 2.
9. Re-read the current in-scope diff. Confirm each finding still exists, then
   classify it once and derive the footer from its disposition and earliest
   owner.

## Final Validation

Before responding, confirm:

1. The audit remained read-only and slice-scoped.
2. All required artifacts were accessible and read; if inaccessible evidence
   prevented a complete audit, return `FAILED` without unsupported findings.
3. Every requirement and acceptance criterion was mapped internally to evidence
   or a finding, and applicable behavior, boundary, schema, and regression checks
   were completed.
4. Every item remains present in the final diff review and has concrete evidence,
   consistent disposition, and the earliest owner; severity was not substituted
   for disposition.
5. Consequential unresolved assumptions are blockers, not guesses.
6. Ordinary test findings were excluded, and applicable security, logging, and
   PHI checks covered all changed I/O and log sites.
7. The validation disclosure states that executable checks were not run and does
   not claim recorded verification was executed by this audit.
8. Exactly one allowed machine footer is the final nonblank line, with no text
   after it.
