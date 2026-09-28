# Final Regression Repair

You are applying final regression fixes to a coding-agent skill.

## Original Skill

"""
{{ORIGINAL_SKILL}}
"""

## Current Revised Skill

"""
{{CURRENT_REVISION}}
"""

## Regression Test Results

"""
{{REGRESSION_RESULTS}}
"""

## Task

Apply only the necessary fixes from the regression results.

## Rules

1. Preserve improvements already made during the audit-repair pipeline.
2. Restore useful original instructions that were accidentally removed.
3. Remove any new conflicts introduced during repair.
4. Remove unnecessary bloat added during repair.
5. Keep the prompt practical and specific to this skill's purpose.
6. Do not rewrite the whole skill unless regression shows major issues.
7. If the regression recommendation is "Use original version", restore the original and apply only the most critical improvements from the pipeline.

## Required Output Format

### Final Repairs Made
List final changes from the regression fix.

### Revised Skill Prompt
Provide the full final skill prompt. This must be complete and standalone — everything that goes below the YAML frontmatter.

### Version Note
One paragraph: what changed from the original and why.

### Known Failure Modes
List remaining risks or edge cases to watch. Say "None identified" if clean.
