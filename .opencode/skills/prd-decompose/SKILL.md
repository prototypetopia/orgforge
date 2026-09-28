---
name: prd-decompose
description: Decompose a large project-level PRD into complete capability-scoped workstreams and template-compliant child PRDs
argument-hint: <source-prd-path>
---

Decompose one large project-level PRD into independently valuable child
workstreams. This is the upstream step before running `/refine-prd` and
`/prd-breakdown` on each child.

## Input

- Required argument: `<source-prd-path>`.
- The source may have any filename. Derive names from its title and content,
  never from the filename alone.

## Critical Rules

1. **Documentation only.** Do not implement code, create task checklists, or
   create implementation slice plans.
2. **Original source is read-only.** Never edit, move, or rename the supplied
   PRD. Create a verbatim repository-local snapshot for durable evidence.
3. **Preflight or verified recovery before writing.** Determine every output
   path before a fresh run writes anything. Existing outputs are allowed only
   in recovery mode when an `In Progress` decomposition index proves they
   belong to the same source and manifest. Otherwise stop and report every
   collision.
4. **No scope loss.** Map every substantive source requirement, decision, or
   other independently normative item to a primary child, shared constraint,
   deferred scope, or non-goal in the decomposition index. A broad heading is
   not sufficient coverage for heterogeneous items beneath it.
5. **No invented scope.** Child requirements and decisions must be traceable
   to the source PRD. Preserve unsupported or ambiguous details as `TBD` or
   open questions.
6. **Capability boundaries.** Split by cohesive, independently valuable
   outcomes. Do not default to frontend/backend/infra layers, source heading
   count, or delivery phases.
7. **No silent decision promotion.** Explicit source requirements and locked
   decisions may remain locked. Recommendations, suggestions, future ideas,
   and unresolved alternatives remain proposed, deferred, or open.
8. **Complete workstreams.** Every child gets `context.md`, `decision-log.md`,
   `latest.md`, and a PRD that exactly follows
   `docs/templates/prd-template.md`.
9. **Constrained shell use.** The shell may only run `sha256sum -- <path>`,
   `cp -- <source> <snapshot>`, and `cmp -s -- <source> <snapshot>` for source
   snapshot integrity. Quote paths safely. Do not run any other command.

## Instruction Priority

When instructions conflict, follow this order:

1. Critical Rules
2. Source coverage and traceability
3. Decision classification
4. Capability cohesion and independent acceptance
5. Smallest useful number of child workstreams
6. Output conventions

## Output Conventions

Derive a concise `<parent-slug>` from the source PRD's H1/title and central
product outcome. Remove generic words such as `prd`, `project`, and version
labels when they do not distinguish the product.

- Valid slugs match `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Parent slugs must not exceed 48 characters or 6 kebab-case words.
- Child slugs use `<parent-slug>-<capability-slug>` unless that repeats words.
- Child slugs must not exceed 64 characters or 8 kebab-case words. Shorten the
  parent stem while preserving its distinguishing terms when needed.
- Names must remain understandable without opening the source PRD.
- Child slugs must be unique.

Create:

- Index: `sessions/<parent-slug>-prd-decomposition.md`
- Source snapshot: `sessions/<parent-slug>-source-prd.md`
- Child context: `sessions/<child-slug>/context.md`
- Child decision log: `sessions/<child-slug>/decision-log.md`
- Child handoff: `sessions/<child-slug>/latest.md`
- Child PRD: `sessions/<child-slug>/<child-slug>-prd.md`

## Workflow

### 1. Validate and read inputs

- If `<source-prd-path>` is missing, stop and ask for it.
- If the source cannot be read, stop and report the path.
- Compute its SHA-256 with the allowed `sha256sum` command and retain it as
  source identity evidence.
- Read the complete source PRD in bounded chunks when needed. Maintain a compact
  heading outline first; do not rely on a single truncated read.
- Read these files when present:
  1. `AGENTS.md`
  2. `docs/decision-authority.md`
  3. `docs/templates/prd-template.md` (required)
  4. `docs/templates/context-master-template.md` (required)
  5. `docs/templates/decision-log-template.md` (required)
  6. `docs/templates/session-handoff-template.md` (required)
  7. `docs/templates/prd-decomposition-template.md` (required)
- If any required template is missing, stop before writing.

### 2. Build a source outline

Before selecting children, build a compact source outline by heading or another
stable locator. Use it to identify capability areas, cross-cutting constraints,
deferred areas, and broad dependency signals. Do not attempt to retain the
complete requirement inventory only in conversational memory.

After the run index exists, build the detailed inventory in bounded source
chunks and persist each completed batch to the index. Create a separate
traceability unit for each independently normative requirement, decision,
acceptance check, or deferred commitment. For each unit, record:

- product outcome or requirement;
- explicit decisions and their wording strength;
- contracts, data, architecture, and state behavior;
- security, privacy, reliability, operations, and lifecycle constraints;
- acceptance criteria and tests;
- rollout, dependencies, and sequencing;
- non-goals, future work, spikes, and unresolved questions.

Treat examples as supporting detail, not separate scope. Split heterogeneous
lists and broad definition-of-done or agent-rule sections into item-level units.
If the source repeats a requirement, keep one primary mapping and note the
duplicate source locators.

### 3. Design capability boundaries

Choose the smallest useful set of child workstreams that satisfies all of the
following:

- Each child has one coherent user, operator, or platform outcome.
- Each child can define meaningful goals and acceptance criteria.
- Dependencies on siblings are explicit and acyclic.
- A child does not own only a generic technical layer when that layer has no
  independently useful contract or outcome.
- Shared foundational models may be their own child when they provide a stable,
  independently testable contract required by multiple capabilities.
- Cross-cutting safety, security, provider, and operational constraints are
  copied into every affected child and have one primary owner in the index.
- Clearly deferred or post-V1 ideas do not become implementation workstreams.
  Keep them in index deferred scope and in the owning child's non-goals or open
  questions. An explicitly committed technical/design spike may be a child.
- When one source topic commits a design spike but defers implementation, map
  the spike and implementation as separate traceability units. The spike may
  be a child while implementation remains `Deferred` and approval-gated.

Do not use an arbitrary target count. Merge boundaries whose acceptance cannot
be evaluated independently. Split boundaries that contain multiple outcomes
with weak cohesion.

If the source is too ambiguous or internally contradictory to establish safe
boundaries, stop before writing and ask only the questions needed to resolve
that blocker. Otherwise choose the boundaries and create immediately.

### 4. Classify decisions

Use `docs/decision-authority.md` when present.

- Preserve explicit `must`, `shall`, `do not`, approved, final, or locked source
  decisions in `Decisions Locked`, citing the source heading or locator.
- Preserve `should`, recommended, suggested, possible, target, or alternative
  choices in `Decisions Proposed (Pending Approval)` when they carry a real
  tradeoff. Keep nonessential speculation as `TBD` or an open question.
- Do not transform an illustrative example into a required contract.
- Do not infer a child-wide decision from a statement scoped to one source
  feature.
- If the source's status or wording conflicts with an individual statement,
  use the more conservative classification and record the ambiguity.
- New decomposition-only choices, such as primary ownership and dependency
  ordering, may be `Agent-Owned` when they only organize unchanged source
  scope. They must not alter product behavior.

### 5. Build and validate the decomposition manifest

Create the complete output manifest before any fresh-run write:

1. Parent slug and source identity: original path, title, and SHA-256.
2. Ordered children with names, slugs, outcomes, scope, and dependencies.
3. Preliminary shared-constraint ownership.
4. Every output path, including the source snapshot.

The detailed source coverage map, deferred scope, and unresolved questions are
checkpointed after the index is created. They do not need to remain entirely
in memory.

Validate the manifest:

- [ ] Every child has a distinct outcome and independently meaningful
      acceptance criteria.
- [ ] All sibling dependencies resolve and contain no cycles.
- [ ] Every slug is valid and unique.
- [ ] The parent slug is at most 48 characters and 6 words.
- [ ] Every child slug is at most 64 characters and 8 words.
- [ ] Every child PRD can use the exact PRD template heading structure.

Fix validation failures before continuing. Stop if fixing one requires a
product or architecture decision not present in the source.

### 6. Determine fresh or recovery mode

Check the index, source snapshot, and every proposed child directory.

**Fresh mode:** The index, snapshot, child directories, and files are all
absent. If any proposed output exists, stop before writing anything and report
all collisions.

**Recovery mode:** The index exists and declares `Status: In Progress`. Before
editing or writing anything, verify all of the following:

- the index's original source path, parent slug, and complete artifact manifest
  match this invocation;
- the current source SHA-256 matches the index;
- every existing output is declared in that manifest;
- no undeclared file exists in a child directory;
- the source snapshot, when present, passes the allowed `cmp -s` comparison
  against the currently supplied source and its SHA-256 matches the index;
- completed artifact entries point to files that exist and still pass their
  template, manifest, mapped-scope, and cross-document consistency checks. A
  missing, modified, or invalid completed artifact is a hard recovery blocker;
  report it for explicit resolution and never overwrite it;
- the decomposition-index row is a control-record exception: it remains
  `In Progress` and may be edited for checkpoints until atomic finalization;
- an existing artifact marked `In Progress` is owned by this unfinished
  manifest. If it is complete and consistent, mark it complete without
  rewriting it. If it is partial or inconsistent, regenerate only that
  declared in-progress artifact from the snapshot and index, then validate it.
  An existing artifact marked `Not started` is a mismatch. Never overwrite an
  artifact already marked `Complete`;
- the index does not declare `Status: Complete`.

Resume from the first incomplete inventory batch or artifact. Never overwrite a
completed artifact during recovery. If any recovery check fails, stop and
report every mismatch without writing.

Any completed index or unrelated existing output is a collision:

- write nothing;
- report all colliding paths together;
- recommend choosing a different source/parent name or explicitly resolving
  the existing workstreams first.

This skill does not merge or replace existing workstreams. Recovery only
finishes artifacts owned by the same incomplete decomposition manifest.

### 7. Initialize the index and source snapshot

Create `sessions/<parent-slug>-prd-decomposition.md` from
`docs/templates/prd-decomposition-template.md`.

- Create the complete base index in one Write operation and immediately read it
  back before producing any other output. It must already contain source
  identity, every child, and every artifact path. If that write or verification
  fails, stop.
- Set `Status: In Progress`, `Inventory status: Not started`, and initialize the
  inventory cursor and completed-artifact count.
- List every child, the source snapshot, and all generated paths before writing
  any other output.
- Copy the supplied PRD verbatim to `sessions/<parent-slug>-source-prd.md` with
  the allowed `cp` command after marking its manifest row `In Progress`. Verify
  it with both allowed `cmp -s` and `sha256sum` commands before marking it
  complete in the manifest.

### 8. Persist and validate source coverage

Process the source snapshot in bounded chunks. After each chunk:

- append its traceability rows to `Source Coverage`;
- update the inventory cursor to the last fully processed source locator;
- persist newly discovered shared constraints, deferred scope, non-goals, and
  open questions;
- do not create duplicate rows when resuming.

Use source headings, section numbers, or quoted labels as stable locators. Use
item-level locators such as `Section 119, rule 24` when one source section
contains multiple independently normative items.

Each coverage row records source force (`Required`, `Proposed`, `Example`,
`Deferred`, or `Non-Goal`) and resulting classification (`Locked`, `Pending`,
`Context Only`, `Deferred`, or `Non-Goal`) in addition to ownership.

After the final batch, validate:

- [ ] Every inventoried traceability unit has exactly one primary disposition.
- [ ] Shared constraints identify every affected child.
- [ ] Deferred and non-goal units did not become child requirements.
- [ ] Source force and resulting classification obey step 4.

Set `Inventory status: Complete` only after these checks pass.

- Record child dependencies and recommended execution order without turning
  them into implementation slices. Dependency arrows point from prerequisite
  to dependent: `prerequisite -> dependent`.
- Include complete source coverage, shared constraints, deferred scope,
  non-goals, and unresolved questions.

### 9. Write each child workstream

Create the following for every child.

Before writing each file, mark its manifest row `In Progress`. Mark it
`Complete` only after reading and validating the finished file.

#### `context.md`

Follow `docs/templates/context-master-template.md`. Populate:

- the child outcome and scoped In/Out boundaries;
- an additional exact section in this form:

  ```markdown
  ## Source PRD
  - Parent snapshot: `sessions/<parent-slug>-source-prd.md`
  - Decomposition index: `sessions/<parent-slug>-prd-decomposition.md`
  - Child mapping: `<child-slug>`
  - Evidence scope: Parent content is evidence only for index rows mapped to
    this child.
  ```

- source-backed architecture and constraints relevant to the child;
- source-backed locked decisions with source locators;
- initialization-only implementation status;
- risks, sibling dependencies, and open gaps;
- Related Docs containing the canonical source snapshot, decomposition index,
  child PRD, decision log, and handoff.

Do not claim implementation or validation progress.

#### `decision-log.md`

Follow `docs/templates/decision-log-template.md` and use sequential `DEC-NNN`
entries for explicit, material, source-backed decisions owned by the child.
Use the decomposition index and source locator in `Related files/plans`.

For decision dates:

- use an explicit source decision date when one exists;
- otherwise write `Unknown (recorded YYYY-MM-DD)` in decision-log `Date`;
- in PRD decision bullets, use
  `YYYY-MM-DD Recorded from source; original decision date unknown: <decision>`;
- for newly proposed decisions, use the decomposition date because that is the
  date the proposal was recorded.

If no material decision qualifies, write the title followed by
`No decisions recorded yet.` Do not create placeholder decisions.

#### `latest.md`

Follow `docs/templates/session-handoff-template.md`. Record only generation
facts. Set lint, typecheck, and tests to `not run`. Set the next tasks to:

1. Review the child PRD and sibling dependencies.
2. Run `/refine-prd <child-slug>` until clean and apply approved changes.
3. Run `/prd-breakdown <child-slug>` when the PRD is approved.

#### `<child-slug>-prd.md`

Use the exact heading order and names from `docs/templates/prd-template.md`.
Populate every section with child-scoped source content.

- Cite source locators inline for material requirements and decisions.
- Put sibling inputs/outputs in architecture, contracts, requirements, and
  rollout where relevant without importing sibling implementation scope.
- Make acceptance criteria observable and specific to this child.
- Use `Not applicable` for a template section that genuinely does not apply.
- Use `TBD` only for a relevant unknown.
- Keep project-wide non-goals that constrain this child and add scope assigned
  to siblings as child non-goals.
- Metrics must come from the source or remain `TBD`; do not invent targets.

After validating each new child file, mark only that artifact complete in the
index. This checkpoint enables recovery without overwriting finished files.

### 10. Validate and complete the run

Read all generated files and verify:

- [ ] The index and every planned child file exist.
- [ ] Every child PRD has all template headings in exact order.
- [ ] Context, PRD, decision log, and index agree on scope and decisions.
- [ ] Child dependencies match the index and are acyclic.
- [ ] Every source traceability unit remains covered after writing.
- [ ] Every child claim is supported by an index row mapped to that child.
- [ ] Every row with disposition `Child` or `Shared` and classification
      `Locked` or `Pending` is represented in each mapped child's PRD and, when
      it is a durable constraint or accepted decision, context or decision log.
      Shared rows appear in every mapped child.
- [ ] Source force and final decision classification agree; recommendations and
      examples were not silently locked.
- [ ] Parent snapshot, index, context, decision log, and child PRD contain no
      unresolved contradictions.
- [ ] No generated handoff claims tests, validation, or implementation ran.
- [ ] No checklist, slice plan, or code file was created.
- [ ] No path outside the declared outputs was modified.

If a file created or marked `In Progress` during this invocation fails
validation, correct it and rerun the complete validation before reporting. A
pre-existing artifact marked `Complete` was already handled as a blocker in
step 6 and must not be corrected automatically.

After every check passes, use one atomic Edit operation to mark all validation
checkboxes complete, mark the decomposition-index manifest row complete, set
the completed-artifact count to the manifest total, and set `Status: Complete`.
Do not mark the index row complete in an earlier checkpoint.

## Output

End with:

1. **Source and parent slug.** Original source path, repository-local snapshot,
   and derived parent slug.
2. **Decomposition.** Ordered child workstreams with outcome and dependencies.
3. **Files created.** Index and all child files.
4. **Coverage.** Count of mapped source traceability units and any
   repeated/shared mappings.
5. **Deferred and unresolved.** Deferred scope, non-goals, and questions that
   remain open.
6. **Next commands.** Recommend `/refine-prd <child-slug>` for the first
   dependency-ready children. Do not run it automatically.
