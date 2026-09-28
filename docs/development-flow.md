# Development Flow: Project PRD -> Workstreams -> Plans -> Stepwise Build

Use this flow to decompose a project design when needed, define workstream
features, break them into small tasks, and execute the work incrementally
across sessions.

## File conventions

Each workstream lives in a self-contained folder under `sessions/<slug>/`:

- Context: `sessions/<slug>/context.md`
- Decision log: `sessions/<slug>/decision-log.md`
- Session handoff: `sessions/<slug>/latest.md`
- PRD: `sessions/<slug>/<slug>-prd.md`
- Canonical checklist: `sessions/<slug>/<slug>-next-steps.md`
- Slice plans: `sessions/<slug>/<slug>-<NN>-<slice-title>.md`

When a project-level PRD is decomposed into multiple workstreams, its coverage
index lives at `sessions/<parent-slug>-prd-decomposition.md`. It is not itself a
workstream and therefore has no `context.md`. Its durable source snapshot lives
at `sessions/<parent-slug>-source-prd.md`.

## Optional project-level decomposition

If one PRD describes a whole project with multiple independently valuable
capabilities, run this before the normal per-workstream setup:

1. Decompose the source PRD into complete child workstreams:
   - `/prd-decompose <source-prd-path>`
2. Confirm the index reports `Status: Complete`, then review it for source
   coverage, child boundaries, shared constraints, and dependencies.
3. Continue the normal flow below for each dependency-ready child, beginning
   with `/refine-prd <child-slug>` because decomposition already created its
   context, decision log, handoff, and PRD.

`/prd-decompose` splits project scope into workstream PRDs. `/prd-breakdown`
later splits one approved workstream PRD into implementation slices. They are
not interchangeable.

Parent provenance is optional. Workstreams created directly with
`/session-init`, `/session-init-from-project`, or existing manual context keep
working without a `## Source PRD` section.

A decomposed child's `## Source PRD` section records its parent snapshot,
decomposition index, and child mapping. PRD skills require a complete index and
matching snapshot SHA-256, and use parent evidence only through coverage rows
mapped to that child.

## Command loop

A workstream has a **one-time setup**, then a **repeating per-slice working
loop**. Don't re-run setup for an existing session.

### One-time workstream setup

1. Initialize context — **only when the session does not exist yet**
   - `/session-init <slug>`
   - or `/session-init-from-project <slug>` when the new workstream should
     start from all canonical project workstreams
   - Continuing an existing workstream? Skip setup entirely and go straight to
     the main loop below (it starts with `/session-plan`).
2. Generate/update PRD
   - `/prd <slug>`
3. Refine PRD before implementation (recommended)
   - `/refine-prd <slug>`
   - Answer questions and apply the proposed patch, then **run it again** —
     repeat until the agent reports it found nothing else significant. A single
     pass misses things. The agent will often say it's "ready to implement" after
     the first run; do not trust that until repeated runs come back clean.
4. Break PRD into small implementation slices + task checklist
   - `/prd-breakdown <slug>`

### Per-slice working loop (the main loop)

Once the PRD and breakdown exist, this is the loop you repeat for each slice
(`<NN>` is the slice number from the checklist). Start with `/session-plan` — it
already loads the context it needs, so `/session-resume` is not part of this
loop. (Use `/session-resume <slug>` separately when you're *not* working a slice
and just want to review where the workstream stands — see the decision tree.)

1. Plan the next slice
   - `/session-plan <slug>`
2. Run the automated slice pipeline (refine -> implement -> review -> tests ->
   docs)
   - `/loop /slice-workflow <slug> <NN>`
   - OpenCode optional controls: `--interval 60s` and `--max-iterations 100`
     before the skill target. Claude Code uses its native
     `/loop [interval] <prompt>` syntax; omit the interval for dynamic pacing.
   - Let it complete. It applies bounded authorized plan patches (`Agent-Owned`
     and any decisions you explicitly approved), reruns clean verification
     passes, and routes repair-required audit findings to their owning step. It
     pauses only for targeted questions or unresolved `Needs User Approval`;
     operational failures stop the loop and require an explicit rerun.
3. Verify the slice yourself
   - Run `sst dev` and the relevant tests (`pnpm test:unit` / `test:int` /
     `test:e2e`).
   - Use the TUI (`pnpm tui`) for local testing.
4. Save the session once satisfied
   - `/session-save <slug>`

Repeat for the next slice. When the workstream is ready for review:

- Optional quality gates: `/simplify` (reuse/quality/efficiency) and
  `/security-review` (security audit of pending changes).
- Open the PR: `/pr`.

## New workstream bootstrap options

- Use `/session-worktree-setup <slug>` first when you want the workstream to live
  in its own git worktree (`../provider-copilot-<slug>`) on a `session/<slug>`
  branch; then run `/session-init` or `/session-resume` from that worktree.
- Use `/session-init <slug>` for a blank new workstream scaffold.
- Use `/session-init-from-project <slug>` when you want the new workstream to
  start from all existing canonical workstreams in the repo.
- `session-init-from-project` discovers workstreams only from
  `sessions/*/context.md` and ignores legacy/non-canonical leftovers.
- The seeded context adds project-oriented sections such as:
  - `Source Workstreams`
  - `Reusable Context`
  - `Candidate Inherited Decisions`
  - `Cross-Workstream Risks / Gaps`
  - `Open Questions For PRD`
- Candidate inherited decisions are inputs for PRD drafting and refinement; they
  do not become locked decisions automatically.

## Mental model

This workflow intentionally separates "what we're building" from "how we're
building it":

- Context docs (`sessions/*/`) capture long-lived truth + constraints +
  decisions.
- PRD (`sessions/<slug>/<slug>-prd.md`) is the requirements/contract for the feature.
- Next-steps (`sessions/<slug>/<slug>-next-steps.md`) is the canonical task-state board
  (Now/Next/Later/Done) and should include per-item stage metadata
  (`Stub|Refined|In Progress|Done`).
- Slice plans (`sessions/<slug>/<slug>-<NN>-<slice-title>.md`) are the implementation
  details for a single small task slice. They now follow a two-stage model:
  Stage 1 slice stubs from `/prd-breakdown`, then Stage 2 implementation-grade
  specs from `/refine-plan`.
- Session handoff (`sessions/<slug>/latest.md`) is the rolling
  "where we left off + what to do next".

Rule of thumb:

- If you're deciding "what/why": update PRD/context/decision log.
- If you're deciding "how/steps": update slice plans / next-steps.
- If you're deciding "what to do right now": use `/session-plan`.

## Decision authority model

The concise reference for this model is at `docs/decision-authority.md` — all
skills read it on every run. The full explanation follows below.

Use this model across PRDs, slice plans, implementation reviews, and handoffs.
The goal is to let the AI agent handle routine engineering decisions while
keeping major product, architecture, reliability, and pattern-breaking decisions
visible for approval.

- `Agent-Owned`: the agent may lock the decision without asking when it is
  evidence-backed, low-risk, and follows `AGENTS.md`, `TESTS.md`, target-context
  locked decisions, decision log, existing repo patterns, KISS/YAGNI, or platform
  capabilities verified from repo docs, existing implementation, linked plans, or
  explicitly read source material in this run.
- `Agent-Recommended`: the agent should propose a default with rationale when no
  exact repo pattern exists or there are multiple reasonable options. Use this
  for choices that are likely safe but have meaningful tradeoffs. Do not record
  it as locked unless it is low-risk enough to reclassify as `Agent-Owned`.
- `Needs User Approval`: ask before locking product behavior,
  clinical/business rules, privacy/compliance posture, external contracts,
  reliability semantics, destructive or irreversible changes, broad architecture
  precedent, or removal/replacement of established patterns.
- `Needs Repo Evidence`: inspect the repo first; use this only when targeted
  repo inspection cannot verify the relevant pattern or constraint.
- `Remove Or TBD`: use when a detail is speculative and not needed for the
  current PRD or slice.

When no established pattern exists, do not block immediately. Use the smallest
conventional best-practice option when it is local, reversible, additive,
testable, and aligned with `AGENTS.md` / `TESTS.md`. Lock it only when it is
low-risk enough to be `Agent-Owned`; otherwise surface it as
`Agent-Recommended`. Do not introduce a new reusable abstraction, framework, or
broad project precedent unless evidence shows the local/simple approach is
insufficient.

During migrations and refactors, default to parity with existing behavior and
operational semantics. Preserve established direct integrations, queues,
retries, DLQs, auth boundaries, persistence flows, event paths, observability,
and reliability semantics when read evidence verifies target-platform support.
Removing or replacing a supported established pattern is `Needs User Approval`.

## Skill reference (what it does / when to use / reads-writes)

- `/session-init <slug>`
  - Use when: starting a brand new workstream (or when context files do not
    exist yet).
  - Creates: `sessions/<slug>/context.md`,
    `sessions/<slug>/decision-log.md`,
    `sessions/<slug>/latest.md`
  - Output: a bootstrap prompt you can paste to start work.
  - Does not: write PRDs or plans.

- `/session-init-from-project <slug>`
  - Use when: starting a brand new workstream and you want to seed its context
    from all existing canonical workstreams in the project.
  - Reads: all canonical workstreams rooted at `sessions/*/context.md`
    along with their canonical PRD and plan files when present.
  - Creates: `sessions/<slug>/context.md`,
    `sessions/<slug>/decision-log.md`,
    `sessions/<slug>/latest.md`
  - Output: a project-seeded context set ready for `/prd <slug>`.
  - Does not: write PRDs or plans.

- `/session-worktree-setup <slug>`
  - Use when: starting or resuming a workstream in a dedicated git worktree and
    `session/<slug>` branch, isolated from your main checkout.
  - Creates: a git worktree at the sibling path `../provider-copilot-<slug>` on
    branch `session/<slug>`, based on `origin/main` (or local `main`).
  - Reads: `sessions/<slug>/context.md`, `latest.md`, `decision-log.md`, and
    `<slug>-next-steps.md` (from the branch ref or worktree when they live there)
    to report the workstream's current state.
  - Output: the worktree path, branch, reused-vs-created, remote branch state, a
    read-only resync recommendation, and the next command to run (usually
    `/session-resume <slug>` or `/session-plan <slug>`).
  - Safety: only adds a worktree — it never resets, deletes, force-pushes,
    switches, pulls, or edits files. It reuses an existing `session/<slug>`
    worktree instead of duplicating, and asks before creating when branch or
    session state is ambiguous (merged, divergent, or squash/rebase-merged).
  - Does not: implement code, or run the resync commands it recommends.

- `/session-resume <slug>`
  - Use when: you want to review where an existing workstream stands — typically
    when you're not actively working a slice. Not needed before `/session-plan`,
    which loads its own context.
  - Reads: `sessions/<slug>/context.md`,
    `sessions/<slug>/decision-log.md`,
    `sessions/<slug>/latest.md`, the PRD, next-steps file, and numbered slice
    plans when present.
  - Output: current status, locked decisions, next task to do now, key risks,
    validation state, and pending `Agent-Recommended` / `Needs User Approval`
    decisions.
  - Does not: implement or edit files.

- `/session-overview`
  - Use when: you want a concise cross-workstream summary before deciding what
    to continue next.
  - Discovers: canonical workstreams from `sessions/*/context.md`.
  - Reads: primarily each workstream's `latest.md`, plus
    `sessions/<slug>/<slug>-next-steps.md` and `context.md` when needed for
    progress or status clarification.
  - Output: a portfolio snapshot, the top 1-3 recommended workstreams to
    continue, a compact one-line matrix for all workstreams, and one
    recommended immediate action.
  - Does not: implement or edit files.

- `/prd-decompose <source-prd-path>`
  - Use when: one large PRD describes a whole project that should become
    multiple independently valuable workstreams.
  - Reads: the complete source PRD, decision-authority guidance, and the PRD,
    context, decision-log, handoff, and decomposition templates.
  - Writes:
    - `sessions/<parent-slug>-prd-decomposition.md` (source coverage,
      ownership, dependencies, deferred scope, and generated manifest)
    - `sessions/<parent-slug>-source-prd.md` (verbatim repository-local source
      snapshot verified by SHA-256 and byte comparison)
    - `sessions/<child-slug>/context.md`
    - `sessions/<child-slug>/decision-log.md`
    - `sessions/<child-slug>/latest.md`
    - `sessions/<child-slug>/<child-slug>-prd.md`
  - Behavior:
    - derives parent and child names from PRD content rather than relying on
      the source filename
    - splits by cohesive capabilities, not technical layers or phase headings
    - maps every independently normative source item to a child, shared
      constraint, deferred item, or non-goal
    - checkpoints inventory and artifact progress in an `In Progress` index so
      an interrupted matching run can safely resume
    - rejects completed indexes, unrelated files, undeclared files, and
      recovery state that does not match the source and manifest
  - Does not: edit the original source PRD, merge existing workstreams, create
    task checklists, create slice plans, or implement code.

- `/prd <slug>`
  - Use when: you want a PRD created/updated at `sessions/<slug>/<slug>-prd.md`.
  - Reads: `sessions/<slug>/context.md` (required), decision log/handoff if
    present, PRD/next-steps/numbered slice plans when present, and targeted repo
    patterns when needed. For decomposed workstreams, also reads the complete
    decomposition index and parent snapshot listed under the context's
    `## Source PRD` heading.
  - If the target context includes `Source Workstreams`, also reads canonical
    files for those workstreams as supporting context.
  - Writes: `sessions/<slug>/<slug>-prd.md` (and may append it to "Related Docs" in
    `sessions/<slug>/context.md` when first created).
  - Behavior:
    - uses source workstreams to identify candidate requirements, architecture
      considerations, constraints, and open questions
    - does not silently import another workstream's scope
    - does not treat candidate inherited decisions as locked unless the new PRD
      explicitly adopts them
    - classifies material decisions as `Agent-Owned`, `Agent-Recommended`, or
      `Needs User Approval`
  - Does not: create task plans/checklists (that's `/prd-breakdown`).

- `/prd-breakdown <slug>`
  - Use when: the PRD is ready and you want it turned into small, ordered build
    steps.
  - Reads: `AGENTS.md`, the implementation-plan template,
    `sessions/<slug>/<slug>-prd.md` (required), plus context/decision log/plans
    if present for alignment and any complete decomposition index and parent
    snapshot listed under `## Source PRD`.
  - Writes:
    - `sessions/<slug>/<slug>-next-steps.md` (canonical checklist)
    - `sessions/<slug>/<slug>-<NN>-<slice-title>.md` (one plan per small slice)
  - Behavior:
    - Derives slices from PRD API contracts + architecture steps first (thin
      vertical slices).
    - Creates Stage 1 slice stubs with slice-scoped `System Components (Slice
      View)`, `System Flow (Slice Flow)`, and `Implementation Plan` sections.
    - Creates or maintains checklist items with `Stage`, `Scope`, `Depends on`,
      `Acceptance`, `Validation`, and `Links` fields.
    - Preserves unknowns explicitly instead of inventing precise implementation
      details too early.
    - Keeps unsupported assumptions as `TBD`, open questions, or refinement
      notes instead of turning them into locked slice requirements.
    - Preserves migration/refactor parity unless a supported source requires a
      behavior or operational semantics change.
    - Merge-safe on reruns: keeps Done intact; adds "newly discovered" items
      when needed.
    - Calls out contradictions between PRD "Decisions Locked",
      target-context locked decisions, and decision log as blockers (no silent
      choices).
  - Does not: implement code.

- `/task-propose <slug> "<task title>" [now|next|later]`
  - Use when: you want to add a new task yourself while staying in the
    Refine -> Apply workflow.
  - Reads: `AGENTS.md`, `sessions/<slug>/<slug>-next-steps.md`, existing slice
    plans, and PRD/context/decision log when present.
  - Output: a single proposed patch labeled "NOT APPLIED" that adds one
    checklist item plus one new slice plan file.
  - Behavior: creates a Stage 1 stub and preserves meaningful tradeoffs as
    `Agent-Recommended` or `Needs User Approval` refinement notes.
  - Does not: edit files.

- `/task-add <slug> "<task title>" [now|next|later]`
  - Use when: you want to add a new task yourself and create the matching plan
    file immediately.
  - Writes: one new checklist item plus one new slice plan file.
  - Behavior: creates a Stage 1 stub; it must not lock major product,
    architecture, schema, external-contract, reliability, or pattern-breaking
    decisions.
  - Follow-up: run `/refine-plan <slug> <NN>` to expand the plan before
    implementing.

- `/refine-prd <slug>`
  - Use when: you want to improve/expand a PRD before implementation.
  - Reads: `sessions/<slug>/<slug>-prd.md` plus related context/decision log/plans.
  - If the target context includes `Source PRD`, reads the complete
    decomposition index and parent snapshot as direct evidence only for rows
    mapped into this workstream.
  - If the target context includes `Source Workstreams`, also reads canonical
    files for those workstreams as supporting context.
  - Output: findings, open questions, and a proposed patch labeled
    "NOT APPLIED".
  - Review focus includes:
    - unsupported material claims and evidence gaps
    - missing requirements compared with similar workstreams
    - contradictions against candidate inherited decisions
    - missing non-functional expectations or validation coverage
    - decision authority (`Agent-Owned`, `Agent-Recommended`,
      `Needs User Approval`)
  - Does not: edit files (read-only refinement).

- `/refine-plan <plan-path> | <slug> <NN>`
  - Use when: you want to improve a single slice plan before implementation.
  - Reads: the target plan, `AGENTS.md`, linked PRD/checklist when available,
    context/decision log when needed, targeted repo patterns, and validation
    command sources when needed.
  - Output: findings, open questions, and a proposed patch labeled
    "NOT APPLIED".
  - Behavior:
    - upgrades a Stage 1 slice stub into a Stage 2 implementation-grade spec
    - fills locked decisions, likely file touchpoints, verification,
      edge cases, and exact acceptance criteria
    - audits unsupported implementation assumptions and classifies decisions by
      authority
    - should align the checklist item toward `Stage: Refined` when the slice is
      ready to implement
  - Resolution behavior: if `<slug> <NN>` matches multiple files, it asks you to
    choose.
  - Does not: edit files (read-only refinement).

- `/refine-plan-architecture <plan-path> | <slug> <NN>`,
  `/refine-plan-requirements <plan-path> | <slug> <NN>`, and
  `/refine-plan-schemas <plan-path> | <slug> <NN>`
  - Use when: one refinement dimension needs direct, focused updates.
  - Writes: the target plan and, when needed, its tracked checklist.
  - Behavior: directly edits safe `Agent-Owned` decisions and decisions already
    explicitly approved by the user (preserved as `User-Approved`). It should
    surface `Agent-Recommended` decisions with rationale and leave unresolved
    `Needs User Approval` decisions open.

- `/slice-workflow <slug> <NN>`
  - Use when: you want to automate the full slice lifecycle — from plan
    refinement through implementation, review, tests, auditing, and docs.
  - Runs the following pipeline in order, one skill per invocation:
    0. `refine-plan` (iterative)
    1. `refine-plan-requirements` (iterative)
    2. `refine-plan-schemas` (iterative)
    3. `refine-plan-architecture` (iterative)
    4. `implement-slice` (reads the refined plan, implements code)
    5. `review-slice-implementation` (iterative)
    6. `audit-slice-implementation` (iterative, owner-routed remediation)
    7. `implement-slice-tests` (iterative when remediation requires it)
    8. `audit-slice-tests` (iterative)
    9. `update-slice-docs` (iterative)
  - State: `sessions/<slug>/<slug>-<NN>-workflow.json` (one per slice,
    co-located with session files). Supports multiple slices concurrently.
  - Advance rules:
    - **patch-clean** (step 0): validates and applies a bounded Agent-Owned
      patch, then reruns until clean.
    - **verify-clean** (steps 1-3, 5, 9): edits require another clean pass.
    - **audit** (steps 6 and 8): clean/advisory results advance; required repairs
      route to the owning step.
    - **simple-done** (step 7): validated test edits advance; production fixes
      route back through implementation review.
    - **implement** (step 4): reads the plan, implements, verifies, and advances.
  - Auto-applies `refine-plan` patches only when they contain bounded,
    authorized plan/checklist edits (`Agent-Owned` and/or explicitly
    `User-Approved`) and no unresolved approval dependency.
  - Routes audit findings by disposition and owner: plan defects return to
    refinement, production defects to implementation review, and test defects to
    test implementation. Severity alone does not determine routing.
  - Pauses only for targeted questions and `Needs User Approval` items.
    Operational failures stop and require an explicit rerun.
  - Safety cap: 10 attempts per step within a bounded attempt window, including
    remediation cycles. An explicit rerun after failure starts a new window for
    that step while preserving history.
  - Loop integration: use `/loop /slice-workflow <slug> <NN>` for dynamic
    pacing in either client. OpenCode additionally accepts `--interval
    <duration>` and `--max-iterations <count>` before the skill target, with a
    default limit of 100. Claude Code uses its native leading interval syntax,
    for example `/loop 1m /slice-workflow <slug> <NN>`.
  - Commands:
    - `status` — list all workflows, including terminal ones
    - `status <slug> <NN>` — show one slice's position
    - `advance <slug> <NN>` — skip to next step and stop after one command
    - `back <slug> <NN>` — go back one step and stop after one command
    - `reset <slug> <NN>` — delete workflow state

- `/session-plan <slug>`
  - Use when: you're ready to implement the next step(s).
  - Reads: `AGENTS.md`, `TESTS.md`, context, latest handoff,
    `sessions/<slug>/<slug>-next-steps.md`, and related plan docs.
  - Output: an implementation-ready execution chunk (1-3 tasks) with:
    - scope, likely files to change, acceptance criteria, and verification
      commands.
    - any `Agent-Recommended` or `Needs User Approval` decisions to resolve
      before implementation.
  - Does not: implement or edit files.

- `/review-slice-implementation <plan-path> | <slug> <NN>`
  - Use when: a slice is implemented and you want safe issues fixed against the
    refined plan and repo patterns.
  - Reads: the target plan, linked PRD/checklist, `AGENTS.md`, context/decision
    log when needed, and the current slice diff.
  - Writes: safe slice-scoped fixes only.
  - Behavior: catches implementation drift, unsupported assumptions,
    overcomplication, and pattern-breaking changes, including migration/refactor
    parity violations.

- `/audit-slice-implementation <plan-path> | <slug> <NN>`
  - Use when: you want a read-only implementation audit for a slice.
  - Reads: the target plan, linked PRD/checklist, `AGENTS.md`, context/decision
    log when needed, and the current slice diff.
  - Output: findings for bugs, drift, missing requirements, unsupported
    assumptions, non-test verification gaps, and unapproved pattern-breaking
    changes. Ordinary test coverage is owned by steps 7-8.
  - Does not: edit files.

- `/implement-slice-tests <plan-path> | <slug> <NN>`
  - Use when: a slice is implemented but still needs test coverage aligned with
    `AGENTS.md`, `TESTS.md`, and the slice plan.
  - Reads: the target plan, linked PRD/checklist, `AGENTS.md`, `TESTS.md`,
    implementation files, nearby tests, setup helpers, schemas/constants, and
    persistence files needed to derive accurate assertions and cleanup.
  - Writes: minimal colocated test files for the target slice, and only tiny
    slice-scoped production fixes when tests expose an obvious bug.
  - Runs: the smallest relevant targeted test command when feasible.

- `/audit-slice-tests <plan-path> | <slug> <NN>`
  - Use when: you want a read-only coverage and test-quality review for a slice.
  - Reads: the target plan, linked PRD/checklist, `AGENTS.md`, `TESTS.md`,
    implementation files, nearby tests, setup helpers, schemas/constants, and
    persistence files relevant to the slice.
  - Output: findings for missing tiers, incorrect mocks, guessed assertions,
    missing cleanup, missing e2e auth rejection, and validation gaps.
  - Does not: edit files or run tests.

- `/update-slice-docs <plan-path> | <slug> <NN>`
  - Use when: a slice is implemented, tested, and audited, and project
    documentation may need to be brought back in sync with the changes.
  - Reads: the target plan, the slice's working-tree changes (`git status` /
    `git diff`), and candidate docs before editing them.
  - Writes (Tier 1, auto-update): per-feature and per-domain READMEs,
    `docs/architecture.md`, and the SDK `README.md` / `SDK_REFERENCE.md`.
  - Approval-gated (Tier 2): surfaces — but never auto-edits —
    `docs/development-flow.md` and `docs/decision-authority.md`.
  - Never touches: `AGENTS.md`, `TESTS.md`, `CLAUDE.md`, PRDs/ADRs,
    `docs/templates/`, and session docs under `sessions/`.

- `/session-save <slug>`
  - Use when: ending a session (or after completing a meaningful slice).
  - Updates: `sessions/<slug>/latest.md` (handoff) and reconciles
    plan drift/statuses against the canonical
    `sessions/<slug>/<slug>-next-steps.md`.
  - May update: related plan `Status` headers
    (`Planned|In Progress|Implemented`) when evidence is clear.
  - Does not: claim validation was run if it was not.

- `/simplify` (built-in)
  - Use when: implementation is complete and you want a quality pass before PR.
  - Reviews changed code for reuse, quality, and efficiency; may apply fixes.

- `/security-review` (built-in)
  - Use when: you want a security audit of pending changes before PR.
  - Reviews the current branch diff for security vulnerabilities.

- `/pr` (optionally `/pr merge` if you use the merge variant)
  - Use when: your branch is ready for review.
  - Creates: a PR against `main` (pushes branch if needed).
  - Does not: modify code; it only uses git/gh operations.

## Refine -> Apply (recommended)

Use this when creating or updating a PRD or when starting a slice.

Refine phase (no edits):

- Run `/refine-prd <slug>` or `/refine-plan <...>`
- Answer targeted blocker / `Needs User Approval` questions. The agent should
  not ask for low-risk `Agent-Owned` decisions.
- Rerun the refine command to regenerate the proposed patch
- **Refine iteratively, not once.** Keep re-running after each applied patch
  until the agent reports nothing else significant. One pass routinely misses
  requirements, and the agent tends to declare the PRD "ready to implement" after
  the first run — treat that as unreliable until repeated runs come back clean.

Two-stage slice rule:

- `/prd-breakdown` creates a slice-scoped Stage 1 stub.
- `/refine-plan` expands that stub into a Stage 2 implementation-grade spec.
- Implementation should generally start only after the slice has locked
  decisions, likely file touchpoints, verification, and acceptance criteria.
- `## Now` should usually contain `Refined` or `In Progress` items; keep `Stub`
  items in `## Next`/`## Later` unless the next action is refinement.

Apply phase (edits happen):

- Say: "Apply the proposed patch"
- Then the patch is applied and you proceed to implementation

The manual refine/apply flow above remains review-gated. Inside
`/slice-workflow`, `refine-plan` emits a separately bounded authorized patch;
the orchestrator validates its targets and authority (`Agent-Owned` and/or
explicitly `User-Approved`), applies it, and reruns refinement. Any question,
unresolved approval-gated decision, unauthorized hunk, or invalid target stops
automatic application.

Prompt pattern (works well for PRDs and plans):

"I'd like you to implement the plan in <file>. Let's refine and expand it
first and review if we are missing any requirements. Update the plan as needed.
Ask targeted questions only for blockers or decisions that need user approval."

For a new project-seeded workstream, a good prompt pattern is:

"Start a new workstream with `/session-init-from-project <slug>`, then run
`/prd <slug>`. After that, run `/refine-prd <slug>` and use the discovered
source workstreams to identify missing requirements, reusable constraints, and
open questions before we break it into implementation slices."

## Decision tree (what do I run next?)

- I have one large project PRD that contains multiple capabilities
  - `/prd-decompose <source-prd-path>` -> confirm the decomposition index is
    complete and review it ->
    `/refine-prd <child-slug>` -> apply approved patches ->
    `/prd-breakdown <child-slug>` -> `/session-plan <child-slug>`

- I want an isolated git worktree + branch for a workstream (new or existing)
  - `/session-worktree-setup <slug>` -> then, from the new worktree,
    `/session-init <slug>` for a new workstream or `/session-resume <slug>` to
    continue an existing one

- I have a new feature idea (no workstream yet)
  - `/session-init <slug>` -> `/prd <slug>` -> `/prd-breakdown <slug>` ->
    `/session-plan <slug>`

- I have a new feature idea and want to use all existing workstreams as source
  context
  - `/session-init-from-project <slug>` -> `/prd <slug>` ->
    `/refine-prd <slug>` -> apply patch -> `/prd-breakdown <slug>` ->
    `/session-plan <slug>`

- I'm continuing an existing feature today (PRD + breakdown already done)
  - `/session-plan <slug>` -> `/loop /slice-workflow <slug> <NN>` -> verify
    (`sst dev`, tests, `pnpm tui`) -> `/session-save <slug>`

- I'm not working a slice and just want to see where one workstream stands
  - `/session-resume <slug>` — reports current status, next task, key risks,
    validation state, and pending decisions (read-only; does not start work)

- I want a quick overview of all workstreams before choosing one
  - `/session-overview` -> `/session-resume <slug>` -> `/session-plan <slug>`

- I want to automate a full slice (refine -> implement -> review -> test)
  - `/slice-workflow <slug> <NN>` (manual, one step at a time)
  - or `/loop /slice-workflow <slug> <NN>` (auto-paced, repairs Agent-Owned
    findings, pauses when your input is needed)

- The PRD changed materially mid-stream (new requirements/decisions)
  - update PRD (manual edit or `/prd <slug>` if context is current) ->
    `/prd-breakdown <slug>` (merge) -> `/session-plan <slug>`

- I finished a slice
  - check it off in `sessions/<slug>/<slug>-next-steps.md` (move to Done) ->
    `/session-save <slug>`

## How slice planning works

- Slices are derived from the PRD itself (not fixed backend/frontend/infra
  buckets).
- Priority order:
  1. PRD API contracts
  2. PRD architecture flow steps
  3. PRD functional requirements not yet represented
  4. PRD acceptance criteria to fill verification gaps
- Slices should be as small as possible while still independently testable.

## Example: early slices for in-visit chunked transcription

A good "step 1 / step 2" progression should look like:

1. `POST /recording/start` (mint `sessionId`, enforce one-active-session)
2. `POST /recording/presign-chunk` (generate key + write sidecar metadata)
3. `S3 ObjectCreated -> EventBridge -> pipeline start` (wiring to kick off
   processing)
4. Chunk intake validation + idempotency key enforcement
5. Transcribe/translate/cleanup/persist steps as independent slices

Each item above maps to exactly one `sessions/<slug>/<slug>-<NN>-<slice-title>.md`.

## Operating rules

- `sessions/<slug>/<slug>-next-steps.md` is canonical for task state
  (Now/Next/Later/Done).
- Recommended checklist item fields:
  - `Stage`
  - `Scope`
  - `Depends on`
  - `Acceptance`
  - `Validation`
  - `Links`
- Keep slices small and executable in order; prefer thin vertical slices over
  broad refactors.
- Record major decisions in `sessions/<slug>/decision-log.md`
  (append-only).
