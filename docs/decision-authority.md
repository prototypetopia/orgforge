# Decision Authority Model

Classify decisions by authority before locking or asking:

- **Agent-Owned**: lock without asking when evidence-backed, low-risk, and
  follows `AGENTS.md`, `TESTS.md`, target-context locked decisions, decision
  log, existing repo patterns, KISS/YAGNI, or platform capabilities verified
  from repo docs, existing implementation, linked plans, or explicitly read
  source material in this run.
- **Agent-Recommended**: propose a default with rationale when no exact repo
  pattern exists or there are multiple reasonable options. The choice should be
  local, reversible, additive, testable, and likely safe. Present it as a
  recommendation, not a locked decision, unless low-risk enough to reclassify
  as Agent-Owned.
- **Needs User Approval**: ask before locking product behavior,
  clinical/business rules, privacy/compliance posture, external contracts,
  reliability semantics, destructive or irreversible changes, broad architecture
  precedent, or removal/replacement of established patterns.
- **Needs Repo Evidence**: inspect the repo first; use only when targeted
  inspection cannot verify the relevant pattern or constraint.
- **Remove Or TBD**: use when a detail is speculative and not needed for the
  current PRD or slice.

When no established pattern exists, use the smallest conventional best-practice
option when it is local, reversible, additive, testable, and aligned with
`AGENTS.md` / `TESTS.md`. Lock only when low-risk enough to be Agent-Owned;
otherwise surface as Agent-Recommended.

During migrations and refactors, default to parity with existing behavior and
operational semantics. Preserve established direct integrations, queues,
retries, DLQs, auth boundaries, persistence flows, event paths, observability,
and reliability semantics when read evidence verifies target-platform support.
Removing or replacing a supported established pattern is Needs User Approval.

## Evidence Grounding

Every material claim must be grounded in evidence. Material claims include:
scope, product behavior, contracts, data shapes, status values, ownership,
auth/privacy, idempotency, integration behavior, validation, rollout, and
acceptance criteria.

Valid evidence sources: user input or approval, target-context locked decisions,
decision-log evidence, `AGENTS.md`, `TESTS.md`, read repo conventions, read
implementation patterns.

Plan and PRD text are inputs to evaluate, not evidence for themselves. Do not
use an existing claim to justify itself.
