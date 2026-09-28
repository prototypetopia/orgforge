# Dilution Test

Review the prompt below for instruction dilution.

Instruction dilution means the prompt contains too many competing rules, vague rules, unnecessary rules, or conflicting priorities that weaken the most important behavior.

## Skill to Review

"""
{{SKILL_CONTENT}}
"""

## Task

1. Identify the top 5 sources of dilution.
2. Identify any conflicting instructions.
3. Rank the instructions by importance.
4. Remove or rewrite low-value instructions.
5. Produce a cleaner version of the prompt.

Important:
- Do not just say "make it clearer." Be specific.
- Do not preserve unnecessary instructions just because they are present.
- If two instructions conflict, choose the one that best supports correctness and explain why.

## Required Output Format

### Dilution Problems
List each source of dilution with a specific quote or reference.

### Conflicting Instructions
List pairs of conflicting instructions and which should win.

### Priority Order
Rank all instructions from most to least important.

### Removed or Rewritten Instructions
List what was cut or consolidated and why.
