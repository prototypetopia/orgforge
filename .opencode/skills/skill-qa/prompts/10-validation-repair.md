# Repair Validation Findings

You are repairing a coding-agent skill based on a Validation and Self-Check audit.

## Current Revised Skill

"""
{{CURRENT_REVISION}}
"""

## Validation Audit Results

"""
{{AUDIT_RESULTS}}
"""

## Task

Repair the skill so validation is concrete, honest, and testable.

## Rules

1. Replace vague validation like "make sure it works" with concrete checks.
2. Include relevant tests, type checks, lint checks, build checks, and diff review where appropriate.
3. Require the agent to state what was actually run.
4. Require the agent to state what could not be run.
5. Do not allow the agent to claim tests passed unless they were run.
6. Keep validation realistic for a coding agent.
7. Do not require unnecessary checks for every small change.
8. Preserve domain-specific validation steps.

## Required Output Format

### Validation Repairs Made
List what changed.

### Revised Skill Prompt
Provide the full revised skill prompt. This must be complete and standalone.

### Remaining Concerns
List anything not fully fixed, or say "None."
