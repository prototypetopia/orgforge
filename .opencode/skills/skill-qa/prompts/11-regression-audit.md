# Skill Regression Test

Compare the original and revised versions of this skill.

## Original Skill

"""
{{ORIGINAL_SKILL}}
"""

## Revised Skill

"""
{{REVISED_SKILL}}
"""

## Task

Determine whether the revised version improves reliability without introducing new problems.

Check:
1. Is the task clearer?
2. Are critical rules moved to the top?
3. Are priorities explicit?
4. Is the prompt shorter where possible?
5. Are validation steps specific?
6. Are ambiguity rules better?
7. Did the new version remove useful constraints?
8. Did the new version add unnecessary complexity?
9. Did the new version change the skill's core purpose?
10. Did the new version lose domain-specific instructions?

## Required Output Format

### Improvements
List what got better and why.

### Regressions
List what got worse or was accidentally removed.

### Remaining Issues
List problems present in both versions.

### Recommendation
Choose one:
- **Use revised version** — if improvements outweigh any regressions
- **Use original version** — if regressions are severe
- **Use hybrid** — if specific regressions need fixing

### Hybrid Fixes (if applicable)
List the specific changes to make to the revised version to fix regressions.
