# Repair General Audit Findings

You are repairing a coding-agent skill based on a General Skill Audit.

## Original Skill

"""
{{ORIGINAL_SKILL}}
"""

## General Audit Results

"""
{{AUDIT_RESULTS}}
"""

## Task

Repair the skill based on the audit findings.

## Rules

1. Fix the issues found in the audit.
2. Do not merely explain the issues. Produce a revised skill prompt.
3. Preserve useful existing instructions.
4. Remove redundant or conflicting instructions.
5. Add instruction priority if missing.
6. Add source-of-truth rules if missing.
7. Add ambiguity-handling rules if missing.
8. Add explicit validation steps if missing.
9. Add a clear output format if missing.
10. Keep the revised skill concise and practical.
11. Do not add examples unless they directly prevent a known failure mode.
12. Do not turn the skill into a generic coding agent if it has a specific purpose.

## Required Output Format

### Repairs Made
List the audit findings addressed and how they were fixed.

### Revised Skill Prompt
Provide the full revised skill prompt. This must be complete and standalone — everything that goes below the YAML frontmatter in SKILL.md.

### Remaining Concerns
List anything not fully fixed, or say "None."
