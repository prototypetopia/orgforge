---
name: session-init
description: Initialize named context files for a workstream and provide a bootstrap prompt
argument-hint: <workstream-slug> | <free-form context> | <workstream-slug> <free-form context>
---

## Critical Rules

1. **Only run this bash command:**
   ```bash
   eval "$(fnm env --use-on-cd --shell bash)" && pnpm context:new -- <slug>
   ```
   Use dedicated tools for reads, greps, globs, and section edits.
2. **Create new sessions only.** If `sessions/<slug>/context.md` already exists, stop before commands or edits and recommend `/session-resume <slug>`.
3. **Only edit files under the newly created `sessions/<slug>/`.** Do not modify pre-existing session files.
4. **Do not edit `decision-log.md` after creation.** This skill does not record decisions.
5. **Do not invent progress or validation.** Seeded status must remain initialization-only and validation must stay `not run`.

## Instruction Priority

When instructions appear to conflict, apply this order:

1. Safety and scope boundaries win: never modify pre-existing session files, and stop if `sessions/<slug>/context.md` already exists.
2. Shell boundary wins: the only shell command allowed is `eval "$(fnm env --use-on-cd --shell bash)" && pnpm context:new -- <slug>`.
3. Input resolution happens before tool use. Invalid or ambiguous input stops the skill.
4. `decision-log.md` is creation-only in this skill. Do not edit it after `pnpm context:new` creates it.
5. No context means no post-create seeding edits. Context present means seed only the listed sections in new `context.md` and `latest.md`.
6. Initialization facts are allowed; implementation progress and validation results must not be invented.
7. Related-plan discovery is best-effort and evidence-based. Reporting `none confidently related` is better than forcing weak matches.
8. Output clarity wins over completeness: report the final slug, created files, seeding status, related-plan status, bootstrap prompt, and `/prd <slug>` recommendation.

## Task

Initialize a new named session context set under `sessions/<slug>/`:

- `context.md`
- `decision-log.md`
- `latest.md`

If free-form context is provided, seed only the new `context.md` and `latest.md` with initialization-safe context. If input is slug-only, leave the initialized templates unchanged after creation.

## Input Resolution

The body rules are authoritative if they differ from an abbreviated argument hint. Slug-plus-context input requires the `--` delimiter.

Required input is one of:

1. `<workstream-slug>`
2. `<free-form context>`
3. `<workstream-slug> -- <free-form context>`

Resolve the input before running any command:

1. If the entire input is a single kebab-case token, use it as the explicit slug and do not perform post-create seeding.
2. If the input contains ` -- ` and the text before it is a single kebab-case token, use the text before `--` as the explicit slug and the text after `--` as free-form context.
3. If `--` is present but the text before it is not a valid slug, stop and ask for either a valid slug or context-only input.
4. Otherwise, treat the full input as free-form context and derive the slug.

Slug rules:

- Valid slugs match `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Derived slugs must be concise and no more than 5 words.
- To derive a slug, lowercase the context, remove punctuation, drop non-essential filler words, prefer concrete nouns/actions, and convert to kebab-case.
- If the derived slug is vague, empty, or invalid, stop and ask for clearer context or an explicit slug.

Examples:

- `add a care insights sidebar to the encounter page` -> `care-insights-sidebar`
- `care-insights-sidebar -- add a care insights sidebar to the encounter page` -> slug `care-insights-sidebar`, context `add a care insights sidebar to the encounter page`

## Preflight

1. Resolve `slug`, optional `context`, and `slugSource` (`user-provided` or `derived`).
2. Validate `slug` matches `^[a-z0-9]+(-[a-z0-9]+)*$`; if derived, validate it is no more than 5 words.
3. If `--` was used, validate the input matched `<valid-slug> -- <context>`; otherwise stop before tool use.
4. If `sessions/<slug>/context.md` already exists, stop before running commands or editing files and recommend `/session-resume <slug>`.
5. If the slug was derived and already exists, also list 2 to 3 alternate concise slug candidates for a new session. These are informational only; do not create a different session unless the user asks.

## Workflow

1. Run the allowed bash command:
   ```bash
   eval "$(fnm env --use-on-cd --shell bash)" && pnpm context:new -- <slug>
   ```
   If the command fails, report the error and stop.
2. Verify these files exist, and stop if any are missing:
   - `sessions/<slug>/context.md`
   - `sessions/<slug>/decision-log.md`
   - `sessions/<slug>/latest.md`
3. If context was provided, seed only the listed sections in `context.md` and `latest.md` using the section templates below.
4. If context was not provided, make no post-create edits to the initialized templates.
5. Validate the result using the checklist below.
6. Discover related plans best-effort after validation:
   - prefer direct paths matching `sessions/<slug>/<slug>-prd.md`, `sessions/<slug>/<slug>-next-steps.md`, and `sessions/<slug>/<slug>-[0-9][0-9]-*.md`
   - if no direct match exists, inspect existing session names and PRD content only when there is clear overlap with the slug or context
   - for each non-direct related plan, record a short evidence reason
   - report `none confidently related` when there is no evidence-based match
7. Print the required output and recommend `/prd <slug>`.

## Section Replacement Templates

When context is provided, replace only these listed sections. Leave all other sections unchanged.

`sessions/<slug>/context.md`:

```markdown
## Objective
- <one concise sentence based on the provided context>

## Scope
- In: <short conservative summary from the context, or `TBD from initial objective`>
- Out: TBD

## Implementation Status
- Done: session scaffolding created
- In progress: objective and scope refinement
- Not started: implementation

## Risks / Gaps
- <specific ambiguity from the user context, or `Scope and acceptance criteria still need refinement.`>

## Related Docs
- `sessions/<slug>/latest.md`
- `sessions/<slug>/decision-log.md`
- `sessions/<slug>/<slug>-prd.md`
```

`sessions/<slug>/latest.md`:

```markdown
## Summary of What Changed
- Workstream initialized under `sessions/<slug>/`.
- Slug was <user-provided|derived from context>.
- Initial objective seeded from the provided context.

## Current State
- Completed: session scaffolding created
- In progress: objective and scope refinement
- Blocked: none

## Next 3 Tasks
1. Review and confirm the seeded objective and scope in `sessions/<slug>/context.md`.
2. Run `/prd <slug>`.
3. Run `/refine-prd <slug>` after the PRD draft exists.

## Validation State
- Lint: not run
- Typecheck: not run
- Tests: not run
- Notes: not run; initialization-only change

## Open Questions
- <specific ambiguity from the user context, or `Detailed scope and acceptance criteria still need confirmation.`>

## Important File References
- `sessions/<slug>/context.md`
- `sessions/<slug>/latest.md`
- `sessions/<slug>/decision-log.md`
```

If the user context clearly contains a blocker, replace `Blocked: none` with that blocker. Otherwise do not invent blockers.

## Final Validation

- [ ] Input was resolved before tool use into `slug`, optional `context`, and `slugSource`.
- [ ] `slug` matches `^[a-z0-9]+(-[a-z0-9]+)*$`; if derived, it is no more than 5 words.
- [ ] If `--` was used, input matched `<valid-slug> -- <context>`; invalid delimiter usage stopped before tool use.
- [ ] If `sessions/<slug>/context.md` already existed, no bash command ran, no files were edited, `/session-resume <slug>` was recommended, and any alternate slugs were informational only.
- [ ] The only bash command run was `eval "$(fnm env --use-on-cd --shell bash)" && pnpm context:new -- <slug>`.
- [ ] `sessions/<slug>/context.md`, `sessions/<slug>/decision-log.md`, and `sessions/<slug>/latest.md` exist after creation.
- [ ] Slug-only input made no post-create seeding edits.
- [ ] Context input edited only the listed sections in new `context.md` and `latest.md`.
- [ ] `decision-log.md` was not edited after creation.
- [ ] For context input, seeded sections contain required initialization facts and no stale generic placeholders such as `<...>` in replaced sections; for slug-only input, initialized templates may remain unchanged.
- [ ] `latest.md` validation fields remain `not run`.
- [ ] Seeded content records initialization facts only and does not claim implementation progress.
- [ ] Related plans are direct matches or include a short evidence reason; otherwise related plans are reported as `none confidently related`.
- [ ] Bootstrap prompt includes only existing related-plan paths and omits related-plan lines when none exist.
- [ ] Final output includes slug/source, created files, seeding status, related-plan status, bootstrap prompt, and `/prd <slug>` recommendation.

If any check fails, fix the issue before proceeding.

## Output

- Confirm the final slug and whether it was user-provided or derived.
- Confirm created files.
- Summarize seeded sections, or state that no seeding was performed for slug-only input.
- Show detected related plans with evidence reasons, or state `none confidently related`.
- Provide a ready-to-paste bootstrap prompt:

```text
Please read:
1) sessions/<slug>/context.md
2) sessions/<slug>/latest.md
3) sessions/<slug>/decision-log.md
<include related plan lines only when related paths exist>

Then summarize:
- current status
- locked decisions
- next task to execute
- key risks

Do not implement yet.
```

- Recommend the next command: `/prd <slug>`.
