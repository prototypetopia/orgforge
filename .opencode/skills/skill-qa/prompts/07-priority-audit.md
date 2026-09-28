# Instruction Priority Test

You are testing whether this skill can resolve conflicting instructions.

## Skill to Review

"""
{{SKILL_CONTENT}}
"""

## Task

Find every place where the skill could produce inconsistent behavior because the instructions are not prioritized.

Look especially for conflicts like:
- Be exhaustive vs. be concise
- Return exactly N items vs. do not invent
- Follow schema vs. explain in prose
- Refactor aggressively vs. preserve existing behavior
- Use best practices vs. make minimal changes
- Fix all issues vs. avoid changing unrelated code

For each conflict:
1. Quote or summarize the conflicting instructions.
2. Explain the risk.
3. Decide which instruction should win.
4. Suggest how to rewrite with explicit priority.

## Required Output Format

### Conflicts Found
For each conflict: the two instructions, the risk, and which should win.

### Recommended Priority Order
Numbered list from highest to lowest priority.

### Suggested Priority Section
Draft an explicit priority section to add to the skill.
