# Repair Priority Findings

You are repairing a coding-agent skill based on an Instruction Priority audit.

## Current Revised Skill

"""
{{CURRENT_REVISION}}
"""

## Instruction Priority Audit Results

"""
{{AUDIT_RESULTS}}
"""

## Task

Repair the skill so conflicts are resolved by explicit priority rules.

## Rules

1. Identify conflicting instructions from the audit.
2. Add or revise the instruction priority section.
3. Make clear which instruction wins when rules conflict.
4. Preserve the user's explicit request as highest priority unless safety or correctness requires otherwise.
5. Preserve existing behavior unless the user asks to change it.
6. Make scope, validation, and safety rules higher priority than style preferences.
7. Do not add redundant priority rules.
8. Do not make the prompt longer than needed.

Default priority order for coding agents:
1. User's explicit request
2. Safety, security, and correctness
3. Existing behavior and public APIs
4. Existing tests and type definitions
5. Existing project patterns
6. Minimal focused changes
7. Style and brevity

## Required Output Format

### Priority Repairs Made
List the conflicts fixed and the priority changes made.

### Revised Skill Prompt
Provide the full revised skill prompt. This must be complete and standalone.

### Remaining Concerns
List anything not fully fixed, or say "None."
