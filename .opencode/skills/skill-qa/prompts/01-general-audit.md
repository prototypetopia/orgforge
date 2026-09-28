# General Skill Audit

You are reviewing a coding-agent skill for prompt quality and reliability.

## Skill to Review

"""
{{SKILL_CONTENT}}
"""

## Task

Evaluate whether this skill follows strong prompting best practices.

Focus on:
1. Clear task definition
2. Instruction priority
3. Avoiding instruction dilution
4. Avoiding "lost in the middle"
5. Handling ambiguity
6. Separating source material from instructions
7. Avoiding hidden assumptions
8. Using structured outputs when needed
9. Having explicit validation steps
10. Producing reliable, testable behavior

## Required Output Format

### Summary
Briefly describe what this skill does and whether the prompt is reliable.

### Issues Found
List specific problems. For each issue include:
- **Problem**: what is wrong
- **Why it matters**: the concrete risk
- **Where it appears**: quote or reference the section
- **Recommended fix**: specific actionable change

### Best Practices Check
Return a table:

| Best Practice | Pass / Fail / Partial | Notes |
|---|---|---|
| Clear task definition | | |
| Instruction priority | | |
| No instruction dilution | | |
| No lost-in-the-middle risk | | |
| Ambiguity handling | | |
| Source/instruction separation | | |
| No hidden assumptions | | |
| Structured outputs | | |
| Explicit validation | | |
| Reliable testable behavior | | |

### Suggested Improvements
List the top 3-5 most impactful changes to make, ordered by importance.
