---
name: refine-plan-architecture
description: Refine a slice plan's architecture and update it directly when safe
argument-hint: <plan-path> | <workstream-slug> <NN>
---

## Critical Rules

Follow these rules in order:

1. **Architecture mode only.** Edit structural ownership, placement, boundaries,
   orchestration, failure topology, retries, idempotency, sequencing, and file
   touchpoints. Do not change product requirements or field-level schemas.
   Structural failure mechanics must preserve authorized user-visible error,
   retry, partial-success, and data-retention semantics.
2. **Authorized edits only.** Apply only evidence-backed `Agent-Owned` decisions or
   explicit `User-Approved` decisions already present in context. Never apply an
   unresolved `Agent-Recommended` or `Needs User Approval` choice. Preserve every
   approved decision's `User-Approved` label; never reclassify it as Agent-Owned.
3. **Target safety.** Edit only the target plan and, when materially required, its
   referenced tracked checklist. Never edit the PRD, context, decision log,
   dependency plans, code, or unrelated plan content.
4. **Evidence, not plan assertions.** The plan proves its current text, not the
   truth of unsupported claims. Ground each locked architecture decision in a
   source read in this run. Use the plan's traceability convention or cite one
   source path plus section or symbol per decision. If authoritative sources
   conflict on the same subject, do not edit dependent text.
5. **Independent progress only.** A blocker forbids every edit that directly or
   indirectly depends on it. Map decisions to proposed edits, apply only clearly
   independent authorized edits, then return `NEEDS_USER` while any blocker
   remains.
6. **Verify applied content.** Re-read each target immediately before editing and
   after every edit set. Validate the final text under `Final Validation`; never
   infer success from the intended edit.

## Instruction Priority

When instructions conflict, apply this order:

1. Architecture-mode, allowed-target, and fresh-content safety.
2. Mandatory source access, post-edit verification, and applicable repository
   safety constraints.
3. The latest unambiguous explicit user decision, within priorities 1-2.
4. Evidence grounding and decision authority.
5. Blocker independence before edits.
6. Existing authorized behavior, settled content, and unrelated user changes.
7. Slice architecture completeness and applicable serverless checks.
8. Minimal edits, return format, and brevity.

An explicit approval never authorizes out-of-mode or external-file edits. If a
new user statement does not clearly supersede a prior approval, ask before
changing it.

## Task

Directly refine one slice plan's architecture while preserving requirements,
field-level schemas, and settled supported content. Apply all blocker-independent
authorized edits, then re-read and validate actual results. Align the referenced
checklist only when architecture, dependency, or validation expectations materially
change. On repeat runs, focus on new gaps and contradictions, avoid cosmetic churn,
and reuse prior explicit answers. When serverless resources are in scope, apply the
trigger-specific checks under `Review Scope`.

## Inputs

Supported invocations:

- `/refine-plan-architecture sessions/<slug>/<slug>-<NN>-<slice-title>.md`
- `/refine-plan-architecture <workstream-slug> <NN>`

Normalize `<NN>` to two digits. Use an existing first-argument path; otherwise
glob `sessions/<slug>/<slug>-<NNpad>-*.md`.

- No match: report the attempted glob and return `FAILED`.
- Multiple matches: list candidates, ask the user to choose, and return
  `NEEDS_USER`. Never auto-pick.
- One match: continue.

## Output Format

Return a terse delta report using only nonempty sections:

- `### Changes Applied` with each edited file and a one-line delta
- `### Suggested Architecture Changes Not Applied`
- `### Evidence Gaps`
- `### Decisions` for `Agent-Recommended` or `Needs User Approval`
- `### Blocker Questions`
- `### Remaining Architecture Gaps`

If nothing material changed, say `No substantive changes needed in this mode.`

Report out-of-mode concerns only as brief routing notes; do not refine their
requirements or schema content.

Ask current blockers in `Blocker Questions`; never persist them as future `Open
Questions`. Edit `Open Questions` only for nonblocking future architecture follow-up.

## Source Material

Always read the full plan, root and applicable nested `AGENTS.md` files, and
`docs/decision-authority.md`. A mandatory source that is operationally
inaccessible returns `FAILED`; do not continue with reduced authority.

Read when applicable:

- The referenced PRD and tracked checklist.
- Target context and decision log when needed to verify architecture or approval.
- Every named dependency plan relevant to a proposed architecture decision.
- The smallest relevant implementation and plan patterns before locking placement,
  ownership, statuses, retries, sequencing, or integration boundaries.
- `TESTS.md`, package scripts, and repository command conventions before changing
  verification expectations or commands.

Apply authority by subject:

- Applicable `AGENTS.md` files govern engineering and safety constraints,
  including KISS/YAGNI, layering, ownership, placement, logging, and infrastructure
  patterns.
- Explicit user decisions, the PRD, checklist, context, and decision log govern
  approved product behavior and scope.
- Dependency plans govern their locked interfaces.
- Implementation proves current patterns and behavior but does not authorize
  product changes.
- `docs/decision-authority.md` classifies unresolved choices.

If same-subject sources still conflict, do not edit the dependent text; classify
and report the conflict.

Discover all nested constraints applicable to proposed touchpoints, while keeping
implementation-pattern reads to the smallest representative set.

## Review Scope

Review the entire plan for architecture consistency, focusing on:

- Primary sections: `System Components (Slice View)`, `System Flow (Slice Flow)`,
  `Dependencies`, `Risks / Unknowns`, `Architecture Decisions For This Slice`,
  `Likely File Touchpoints`, `Implementation Plan`, `Implementation Notes`, and
  `Verification`.
- Secondary sections: `Contracts / Decisions Locked For This Slice`, `Mapping
  Boundaries`, `Invariants`, `Compatibility / Migration Notes`, and `Open
  Questions`.

Update a secondary or other section when it contains a material architecture gap
or an authorized edit makes it stale or contradictory. Preserve section structure
unless a heading is clearly wrong or stale.

### Serverless Architecture Checks

When relevant to AWS serverless resources, derive each decision from the actual
trigger, integration, repository pattern, and requirements:

- Prefer asynchronous queues or events when latency, decoupling, or non-user-facing
  work justifies them; do not convert short request/response work by default.
- Define trigger-specific failure handling: SQS source-queue redrive and applicable
  partial-batch behavior; EventBridge target retries and DLQ where required; Lambda
  asynchronous retry, event-age, and failure destination for supported async
  invocation paths. Do not treat SQS polling as Lambda async invocation.
- Make idempotency explicit where retries or duplicate delivery are possible.
- Avoid ad hoc chained Lambda invocations. Use Step Functions only when durable
  state, branching, retries, visibility, or long-lived coordination justifies it.
- Scope SST permissions to required actions and resources; avoid broad wildcards.
- Prefer supported direct service integrations over a Lambda that only forwards
  when repository patterns and required validation permit it.
- Size timeout and memory from expected work and platform constraints; do not lock
  defaults without evidence.

Skip irrelevant checks. These checks do not authorize product semantics or a
pattern-breaking design. Repository constraints and authorized requirements win;
then actual trigger and integration evidence; then minimality.

## Workflow

1. Resolve the plan and read all mandatory and applicable source material.
2. Build an internal decision-to-edit map containing each proposed edit, source,
   authority class, mode scope, affected sections, and blocker dependencies.
   Capture an internal pre-edit snapshot of each allowed target.
   Classify established pattern-following decisions when Agent-Owned; report
   meaningful no-pattern tradeoffs as `Agent-Recommended` and pattern-breaking,
   broad-precedent, or reliability-semantic changes as `Needs User Approval`.
   Keep explicit approvals classified as `User-Approved` in the map and final plan.
3. Exclude every map entry disallowed by Critical Rules 1-5. Correct agent-fixable
   draft issues and ask one concise batch for user-resolvable blockers.
4. Re-read each target. If it differs from the captured snapshot, preserve the
   intervening change and recompute affected map entries; never overwrite or
   revert it. Apply independent safe edits and update the checklist only when
   architecture, dependency, or validation expectations materially changed.
   Re-read every edited target, compare it to the snapshot, reconcile the final
   delta with the map, and run `Final Validation`. Correct only in-scope defects
   introduced by this edit set, then re-read and recheck the corrected delta.
5. Stop when no material architecture improvement or contradiction remains.

## Final Validation

Before responding, confirm:

1. Mandatory and applicable sources were read, including nested `AGENTS.md` files
   for proposed touchpoints. Every final changed block maps to one authorized,
   evidence-backed decision-to-edit entry; every unapplied entry is reported with
   a reason.
2. Final edits comply with Critical Rules 1, 3, and 5: they are target-safe,
   architecture-only, slice-scoped, minimal, and blocker-independent. No product
   requirement, field-level schema, user-visible failure semantic, unrelated
   content, or settled supported decision changed unintentionally.
3. Cross-section traceability is complete: components map to owners and
   touchpoints; flow edges identify direction and boundaries; dependencies map to
   interfaces or sequencing; failure, retry, and idempotency choices map to
   triggers and outcomes; changed risks map to verification.
4. Each materially changed architecture decision has an outcome-focused
   architecture verification scenario. Existing acceptance criteria remain
   consistent; missing or changed product acceptance criteria are routed to
   requirements mode without editing. Every changed command exactly matches
   `TESTS.md`, package scripts, or repository conventions; no code command is
   claimed executed.
5. Applicable serverless decisions cite actual trigger/integration and repository
   evidence and cover failure/retry behavior, idempotency, IAM, orchestration,
   timeout/memory, and deployed wiring verification as relevant. Applicable trust,
   authorization, tenant, PHI/logging, encryption/resource, external-contract, and
   failure-data boundaries are addressed without inventing requirements.
6. If the checklist changed, only actual or authorized checklist fields changed;
   its dependencies, stage, validation outcome, and acceptance scope remain
   consistent with the final plan.
7. Final comparison with each pre-edit snapshot accounts for every changed block,
   preserves intervening and unrelated content, and confirms affected edits were
   recomputed. Each target was re-read after the final edit without formatting
   damage or stale dependent text. Every remaining blocker or operational
   verification failure is reported, and the footer reflects actual results.

## Result Footer

End with exactly one footer as the final nonblank line. Choose in this order:

1. `WORKFLOW_RESULT: NEEDS_USER` when a blocker, ambiguous plan selection, or
   relevant `Needs User Approval` decision requires a response, even if independent
   safe edits were applied.
2. `WORKFLOW_RESULT: FAILED` when an operational failure or inaccessible mandatory
   source prevents completion.
3. `WORKFLOW_RESULT: CHANGED` when substantive edits were applied and no response
   is required.
4. `WORKFLOW_RESULT: ADVISORY` when no edits were applied and only nonblocking
   Agent-Recommended guidance remains.
5. `WORKFLOW_RESULT: CLEAN` when no substantive edit, blocker, or recommendation
   remains.

Never emit `PATCH_READY` or content after the footer.
