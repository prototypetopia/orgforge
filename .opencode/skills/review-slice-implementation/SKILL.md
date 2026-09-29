---
name: review-slice-implementation
description: Review a slice implementation against its plan, fix safe issues, and surface blockers
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

1. **Review first, fix only when authorized.** Report every material finding. Apply
   only local, reversible fixes that do not alter authorized intended behavior and
   are directly evidenced as `Agent-Owned`, or explicit `User-Approved` fixes already
   in context. Never apply unresolved `Agent-Recommended` or `Needs User Approval`
   changes. A local direct correction for an unambiguous existing requirement may
   be `Agent-Owned`. Apply new or changed product semantics only when an explicit
   authoritative user decision already in context approves that exact change.
2. **Git commands are inspection-only.** Authorized file edits may change the
   worktree, but no git command may mutate the index, refs, stash, worktree, or
   repository metadata. Never commit, reset, restore, checkout, rebase, stash,
   stage, or clean.
3. **Static review only.** Run no tests, builds, lint, typecheck, deploys, runtime
   checks, or non-git shell commands. Never claim such a check passed.
4. **Slice-scoped edits only.** Edit only verified implementation targets for this
   slice. Targets may include an unambiguous required missing path; block creation
   when its location, contract, or behavior is unsettled. Preserve unrelated, fresh,
   staged, unstaged, and untracked user changes; never revert or clean them.
5. **Evidence and authority.** The plan and diff describe intended and current state;
   neither proves its own correctness. Product sources govern behavior, applicable
   `AGENTS.md` files govern engineering and safety, owned contracts govern
   interfaces, and implementation proves current behavior. Unresolved same-subject
   conflicts block dependent fixes.
6. **Independent progress after mandatory inspection.** If mandatory sources or git
   inspection are unavailable, make no edits and return `FAILED`. Otherwise apply
   all independent authorized fixes, then return `NEEDS_USER` while a user decision
   remains. Mandatory core inspection is the target plan, governing `AGENTS.md`,
   decision authority, and status plus staged/unstaged git diffs. Prepare blocker
   questions, apply independent fixes, then ask once in the response.
7. **Verify actual fixes.** Re-read targets immediately before and after editing,
   inspect the resulting git diff, and validate actual hunks. Never infer success
   from intended edits.

## Instruction Priority

When instructions conflict, apply this order:

1. Platform and invocation instructions; inspection-only git commands; static-review
   restrictions; slice scope; and preservation of unrelated or intervening content.
2. Mandatory source availability, complete review-surface inspection, fresh target
   rereads, and validation of actual hunks. These outrank repeat-run focus,
   minimality, and brevity.
3. Subject-specific authoritative product decisions, applicable `AGENTS.md` rules,
   and owned contracts. A later explicit decision supersedes an earlier one only
   when it clearly governs the same subject and has authority to do so.
4. Fix authorization, dependency, freshness, and blocker rules.
5. Explicit authorized slice requirements and plan scope. A plan may change existing
   behavior only within its documented authority and cannot silently override a
   higher-authority product decision or owned contract.
6. Existing supported behavior and repository patterns where no higher-priority
   source explicitly requires a change.
7. Complete, accurate findings and outcome reporting, followed by independent
   progress, minimal local edits, and concise wording. Brevity never permits omission
   of material findings, blockers, review surface, validation limits, or required
   output fields.

An established pattern cannot authorize a product-visible, external, persisted,
privacy/clinical, reliability, migration, or pattern-breaking behavior change.

## Task

Review one slice implementation against authoritative requirements, contracts,
repository constraints, and its plan. Identify bugs, regressions, missed behavior,
contract or architecture drift, implementation defects that prevent required
testing, and non-test verification gaps. Apply independent safe fixes, then inspect
and validate the resulting diff. Before judging completeness, reconcile plan
touchpoints with the full git surface and required-but-missing or affected unchanged
files. Confirm final inspection shows no git command mutated repository state and
that worktree changes contain only authorized edits plus preserved prior changes.
Ordinary missing test coverage belongs to later workflow steps and is nonblocking
here unless implementation prevents testing.

On repeat runs, focus on unresolved findings and newly changed code. Preserve
already-correct implementation and avoid cosmetic rewrites or new abstractions. Do
not skip required, newly affected, or previously unreviewed unchanged files. Reuse
explicit prior answers supported by current code, authoritative plan evidence,
decision logs, or conversation; do not ask a resolved question again.

## Inputs

Supported invocations:

- `/review-slice-implementation sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/review-slice-implementation <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing first-argument path; otherwise glob
`sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: report the attempted glob and return `FAILED`.
- Multiple matches: list candidates, ask the user to choose, and return
  `NEEDS_USER`. Never auto-pick.
- One match: continue.

## Output Format

Lead with `### Findings`, ordered by severity. Give each material finding a reusable
path/topic ID when possible, severity, `path:line` reference, impact, evidence, and
disposition: `fixed`, `unfixed`, `blocked`, or `advisory`. Reuse the same ID for the
same unresolved finding across runs; otherwise use a unique run-local ID. Do not hide
fixed findings. Use `blocked` when missing evidence or a decision prevents a safe
conclusion or fix; use `unfixed` for a confirmed issue that remains without such
uncertainty. Derive severity from concrete user, data, security, reliability, or
implementation impact, not category labels. If none exist, say
`No substantive issues found in this pass.`

Then use only nonempty sections:

- `### Fixes Applied` with each file and concise actual delta
- `### Blocker Questions`
- `### Review Surface` with reviewed and expected-but-missing paths
- `### Validation Limits` only when a material residual risk or an applicable
  repository-backed recommended command remains; state that executable checks were
  not run, what remains unverified, and the smallest relevant command

End with exactly one footer as the final nonblank line. Choose in this order:

1. `WORKFLOW_RESULT: FAILED` when an operational inability prevents completing the
   review, even if a user decision also remains.
2. `WORKFLOW_RESULT: NEEDS_USER` when review otherwise completed and a blocker or
   approval decision requires a response, even if independent fixes were applied.
3. `WORKFLOW_RESULT: CHANGED` when fixes were applied and no response is required.
4. `WORKFLOW_RESULT: ADVISORY` when no files changed and only nonblocking findings
   or recommendations remain.
5. `WORKFLOW_RESULT: CLEAN` when no files changed and no finding remains.

Emit no content after the footer.

## Source Material

Mandatory core inputs are:

- the full target plan;
- root and applicable nested `AGENTS.md` files;
- `docs/decision-authority.md`;
- `git status --short`, unstaged diff, and staged diff;
- every reviewed implementation file before judging it.

Always read a referenced PRD and tracked checklist. Read context and decision log
when needed to verify locked or user-approved decisions. Read owned contracts,
dependency plans, and the smallest relevant repository patterns when a finding or
fix depends on their interface or convention. An inaccessible mandatory core input
or git inspection makes the review `FAILED`; unavailable optional evidence blocks
only dependent findings or fixes.

## Review Surface

Build the slice review surface by reconciling:

1. plan touchpoints and dependency-owned interfaces;
2. staged, unstaged, untracked, renamed, and deleted paths from git inspection;
3. obviously related files needed to understand changed behavior;
4. required implementation paths that are missing or unchanged.

Read untracked files directly. Do not assume every worktree change belongs to the
slice, and do not assume the diff contains the complete implementation. Record why
each reviewed path is in scope and report expected-but-missing paths as findings.

## Review Scope

Check every applicable plan anchor across scope/purpose, contracts/schemas,
architecture/mappings/invariants, implementation/touchpoints, edge cases,
acceptance, and verification.

Map each applicable acceptance criterion, invariant, edge case, and explicit
non-goal to concrete implementation evidence or a finding. For changed contracts,
schemas, DTOs, persisted shapes, events, or APIs, trace producers and consumers,
validation boundaries, optionality/defaults, serialization, and evidenced migration
or compatibility needs. Trace changed exports, routes, resources, and configuration
through callers and operational wiring.

For files handling secrets, enforce applicable `AGENTS.md` secret-handling rules:
treat secret or credential exposure — plaintext secret parameters, secret
values reaching previews or logs, or missing Pulumi secret semantics — as
Critical by actual exposure impact, not a fixed warning. Check
evidence-applicable trust/data-safety, failure/reliability, and
ownership/contracts/wiring boundaries.

For each changed branch or I/O boundary, statically walk applicable success,
empty/missing/invalid input, retry/duplicate, partial-failure, and error paths. Trace
untrusted or sensitive data through authorization, validation, logging, persistence,
and egress. Apply only cases supported by the plan or implementation; do not invent
generic requirements.

Do not invent requirements because a category could apply. Report out-of-scope plan
or product defects rather than silently implementing them.

## Workflow

1. Resolve the plan, read mandatory sources, inspect git status plus staged and
   unstaged diffs, and build the review surface.
2. Review relevant files and create an internal finding-to-fix map containing ID,
   severity, evidence, affected files/hunks, authority, dependencies, and blockers.
   Snapshot every potential edit target and the initial git status/diffs.
3. Classify fixes per `docs/decision-authority.md`. Restrict automatic fixes to
   local corrections that do not alter authorized intended behavior and have direct
   evidence. Prepare one concise question batch for user-resolvable blockers.
4. Re-read each target immediately before editing. If it changed since the snapshot,
   preserve the intervening content and recompute the fix; never overwrite or revert
   it. If the change cannot be safely classified or reconciled, do not edit that
   target; record a blocked finding and include one concise question. Apply all
   independent authorized fixes.
5. Re-read edited files and inspect fresh status plus staged and unstaged diffs.
   Reconcile every new hunk with one mapped finding, preserve preexisting unrelated
   hunks, and trace changed exports, contracts, routes, events, resources, and
   configuration through affected callers, consumers, and wiring.
6. Correct introduced in-scope defects. For a newly discovered preexisting issue,
   add it to the map and apply it only if it independently satisfies the same scope,
   authority, freshness, and blocker rules; otherwise report it. Then repeat rereads,
   diff reconciliation, and `Final Validation`.
7. Ask the prepared blocker questions after applying independent safe fixes.

## Final Validation

Before responding, confirm:

1. Every category defined by `Review Surface` was reconciled, and every reviewed path
   has a slice-scope reason. Every applicable acceptance criterion, invariant, edge
   case, and explicit non-goal maps to implementation evidence or a finding.
2. Every actual new hunk maps to one authorized finding and is local, minimal,
   does not alter authorized intended behavior, and is blocker-independent. No
   unrelated or intervening content was reverted or overwritten. Compare final
   status and staged/unstaged diffs with the baseline; classify every path and hunk
   as preexisting, authorized, preserved intervening, or unexpected, and resolve any
   unexpected delta. Confirm every git command used was inspection-only; do not claim
   unmeasured repository metadata was independently validated.
3. Every map entry is represented by a complete, severity-ordered finding with an
   accurate disposition.
4. Changed contracts and schemas have compatible producers, consumers, validation,
   serialization, and applicable persistence behavior. Changed branches and I/O have
   concrete failure-path, data-flow, privacy/logging, and wiring evidence.
5. Fresh status and staged/unstaged diffs were inspected after the final edit. Edited
   regions were reread for malformed syntax, broken imports or delimiters, conflict
   markers, truncation, unintended whitespace-only churn, stale dependents, and
   unaccounted hunks. Do not imply formatter validation.
6. No test, build, lint, typecheck, deploy, runtime, or non-git shell command ran.
   For correctness materially dependent on an executable check, state what remains
   unverified and cite the smallest command that exists in `TESTS.md`, package
   scripts, or repository conventions. Never claim it passed. Omit `Validation
   Limits` when static review leaves no material residual risk or applicable command.
7. Blocker questions, review surface, nonempty output categories, and footer match
   actual outcomes.

Emit exactly one matching `WORKFLOW_RESULT` footer as the final nonblank line, with
no content after it.
