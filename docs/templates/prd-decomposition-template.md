# PRD Decomposition: <Project Name>

## Source

- Status: In Progress | Complete
- Original PRD: `<source-prd-path>`
- Canonical snapshot: `sessions/<parent-slug>-source-prd.md`
- Source SHA-256: `<sha256>`
- Parent slug: `<parent-slug>`
- Generated: `<YYYY-MM-DD>`
- Strategy: capability-scoped workstreams with independently meaningful
  outcomes

---

## Progress

- Snapshot status: Not started | Complete
- Inventory status: Not started | In progress | Complete
- Inventory cursor: <last fully processed source locator or `None`>
- Artifacts complete: <completed>/<total>

---

## Child Workstreams

| Order | Workstream | Outcome | Depends on | PRD |
| --- | --- | --- | --- | --- |
| 1 | `<child-slug>` | <independent outcome> | None | `sessions/<child-slug>/<child-slug>-prd.md` |

---

## Artifact Manifest

Statuses: `Not started`, `In Progress`, `Complete`.

| Artifact | Path | Status |
| --- | --- | --- |
| Decomposition index | `sessions/<parent-slug>-prd-decomposition.md` | In Progress |
| Source snapshot | `sessions/<parent-slug>-source-prd.md` | Not started |
| `<child-slug>` context | `sessions/<child-slug>/context.md` | Not started |
| `<child-slug>` decision log | `sessions/<child-slug>/decision-log.md` | Not started |
| `<child-slug>` handoff | `sessions/<child-slug>/latest.md` | Not started |
| `<child-slug>` PRD | `sessions/<child-slug>/<child-slug>-prd.md` | Not started |

---

## Dependency Graph

- Arrow direction: `prerequisite -> dependent`.
- `<child-slug> -> <dependent-child-slug>`
- No dependency cycles detected.

---

## Shared Constraints And Ownership

| Constraint | Primary owner | Applies to | Source locator |
| --- | --- | --- | --- |
| <constraint> | `<child-slug>` | `<child-slug>`, `<child-slug>` | <heading or section> |

---

## Source Coverage

Every independently normative source requirement, decision, acceptance check,
or deferred commitment has one primary disposition. Broad heterogeneous
sections use item-level locators. Secondary workstreams are listed only when a
traceability unit materially constrains them.

| Source locator | Summary | Source force | Disposition | Classification | Primary owner | Secondary workstreams |
| --- | --- | --- | --- | --- | --- | --- |
| <section/item> | <scope or decision> | Required \| Proposed \| Example \| Deferred \| Non-Goal | Child \| Shared \| Deferred \| Non-Goal | Locked \| Pending \| Context Only \| Deferred \| Non-Goal | `<child-slug>` or N/A | `<child-slug>` or None |

---

## Deferred Scope

- <future capability or explicitly deferred design spike, with source locator>

---

## Non-Goals

- <source non-goal, with source locator>

---

## Open Questions

1. <unresolved source or decomposition question>

---

## Validation

- [ ] Every inventoried source traceability unit has exactly one primary
      disposition.
- [ ] Every child has a distinct outcome and independently meaningful
      acceptance criteria.
- [ ] Child dependencies resolve and contain no cycles.
- [ ] Shared constraints appear in every affected child PRD.
- [ ] Deferred scope and non-goals did not become child requirements.
- [ ] Every child claim has a coverage row mapped to that child.
- [ ] Every `Child` or `Shared` row classified `Locked` or `Pending` appears in
      every mapped child's PRD.
- [ ] Source force and decision classification agree; proposed and example
      content was not silently locked.
- [ ] Parent snapshot, index, contexts, decision logs, and child PRDs contain no
      unresolved contradictions.
- [ ] The source snapshot is verbatim-identical to the supplied source PRD.
- [ ] Every child PRD follows `docs/templates/prd-template.md`.
