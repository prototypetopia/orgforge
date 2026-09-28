---
name: skill-qa
description: Run iterative QA audit-repair loop on project skills. One step per invocation — use with /loop to automate.
---

Run exactly ONE step of the skill QA audit-repair pipeline per invocation.

## CRITICAL RULES

1. Execute exactly ONE step per invocation. Do not combine or skip steps.
2. Always preserve the YAML frontmatter from the original SKILL.md when writing the final version back.
3. The "Revised Skill Prompt" in repair outputs is the full skill body (everything below the YAML frontmatter). It must be a complete, standalone skill — not a diff or partial.
4. Save all outputs before updating progress.json.
5. Do not modify the original SKILL.md until step 12 completes.

## State

Progress file: `.opencode/skills-audit/progress.json`

```json
{
  "skills": ["skill-name-1", ...],
  "current_skill_index": 0,
  "current_step": 1
}
```

Per-skill outputs: `.opencode/skills-audit/<skill-name>/`

## Execution Steps

1. Read `.opencode/skills-audit/progress.json`.
2. If `current_skill_index >= skills.length`, report "All skills audited" and stop.
3. Determine current skill name and step number.
4. Read the prompt template: `.opencode/skills/skill-qa/prompts/<step-file>.md`
5. Read required inputs (see Input Map).
6. Execute the audit or repair following the prompt template exactly.
7. Save the full output (see Output Map).
8. For repair steps (2,4,6,8,10,12): also extract the "Revised Skill Prompt" section and save it to `.opencode/skills-audit/<skill>/current-revision.md`.
9. Update progress.json: increment `current_step`. If step was 12, set `current_step` to 1 and increment `current_skill_index`.
10. Report: what was done, which skill, which step, and what's next.

## Step Definitions

| Step | Type   | Template File             | Name                        |
|------|--------|---------------------------|-----------------------------|
| 1    | Audit  | 01-general-audit.md       | General Skill Audit         |
| 2    | Repair | 02-general-repair.md      | Repair General Findings     |
| 3    | Audit  | 03-dilution-audit.md      | Dilution Test               |
| 4    | Repair | 04-dilution-repair.md     | Repair Dilution Findings    |
| 5    | Audit  | 05-lost-middle-audit.md   | Lost-in-the-Middle Test     |
| 6    | Repair | 06-lost-middle-repair.md  | Repair Structure Issues     |
| 7    | Audit  | 07-priority-audit.md      | Instruction Priority Test   |
| 8    | Repair | 08-priority-repair.md     | Repair Priority Conflicts   |
| 9    | Audit  | 09-validation-audit.md    | Validation Self-Check Test  |
| 10   | Repair | 10-validation-repair.md   | Repair Validation Gaps      |
| 11   | Audit  | 11-regression-audit.md    | Regression Test             |
| 12   | Repair | 12-final-repair.md        | Final Repair + Apply        |

## Input Map

| Step | Reads                                                              |
|------|--------------------------------------------------------------------|
| 1    | `.opencode/skills/<skill>/SKILL.md` → also copy to `original.md`  |
| 2    | `original.md` + `step-01-general-audit.md`                        |
| 3    | `current-revision.md`                                              |
| 4    | `current-revision.md` + `step-03-dilution-audit.md`               |
| 5    | `current-revision.md`                                              |
| 6    | `current-revision.md` + `step-05-lost-middle-audit.md`            |
| 7    | `current-revision.md`                                              |
| 8    | `current-revision.md` + `step-07-priority-audit.md`               |
| 9    | `current-revision.md`                                              |
| 10   | `current-revision.md` + `step-09-validation-audit.md`             |
| 11   | `original.md` + `current-revision.md`                             |
| 12   | `original.md` + `current-revision.md` + `step-11-regression-audit.md` |

All input paths are relative to `.opencode/skills-audit/<skill-name>/`.

## Output Map

| Step | Writes                                                              |
|------|---------------------------------------------------------------------|
| 1    | `step-01-general-audit.md`                                          |
| 2    | `step-02-general-repair.md` + `current-revision.md`                |
| 3    | `step-03-dilution-audit.md`                                         |
| 4    | `step-04-dilution-repair.md` + `current-revision.md`               |
| 5    | `step-05-lost-middle-audit.md`                                      |
| 6    | `step-06-lost-middle-repair.md` + `current-revision.md`            |
| 7    | `step-07-priority-audit.md`                                         |
| 8    | `step-08-priority-repair.md` + `current-revision.md`               |
| 9    | `step-09-validation-audit.md`                                       |
| 10   | `step-10-validation-repair.md` + `current-revision.md`             |
| 11   | `step-11-regression-audit.md`                                       |
| 12   | `step-12-final-repair.md` + `current-revision.md` + overwrite `.opencode/skills/<skill>/SKILL.md` |

All output paths are relative to `.opencode/skills-audit/<skill-name>/`.

## Step 12 Special: Apply Final Version

When writing the final SKILL.md:
1. Read the original SKILL.md to extract the YAML frontmatter block (everything between the opening `---` and closing `---`).
2. Take the final revised skill body from the repair output.
3. Combine: frontmatter + blank line + revised body.
4. Write to `.opencode/skills/<skill>/SKILL.md`.

## Output Format

End each invocation with:

```
---
SKILL QA PROGRESS
Skill: <name> (<index+1>/<total>)
Step completed: <step> of 12 — <step name>
Next: <next step name> (or "Next skill: <name>" or "All done")
---
```
