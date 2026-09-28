# Lost-in-the-Middle Test

Review this prompt for "lost in the middle" risk.

Lost-in-the-middle risk means important instructions or facts are buried inside a long block where the model may underweight them.

## Skill to Review

"""
{{SKILL_CONTENT}}
"""

## Task

1. Identify critical instructions that are buried too deeply.
2. Identify information that should move to the top.
3. Identify information that should be repeated near the end as a final check.
4. Suggest a better structure.

Use this target structure for the revised prompt:

```
CRITICAL RULES:
TASK:
INPUTS:
OUTPUT FORMAT:
SOURCE MATERIAL:
FINAL VALIDATION:
```

## Required Output Format

### Lost-in-the-Middle Risks
List each buried critical instruction with its current position.

### Critical Instructions to Move Up
List what should be near the top and why.

### Final Reminder to Add
List what should be reinforced near the end.

### Suggested Structure
Propose a reorganized outline showing where each section should go.
