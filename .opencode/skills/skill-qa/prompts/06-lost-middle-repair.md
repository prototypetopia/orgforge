# Repair Lost-in-the-Middle Findings

You are repairing a coding-agent skill based on a Lost-in-the-Middle audit.

## Current Revised Skill

"""
{{CURRENT_REVISION}}
"""

## Lost-in-the-Middle Audit Results

"""
{{AUDIT_RESULTS}}
"""

## Task

Repair the skill so critical instructions are not buried.

## Rules

1. Move critical rules near the top.
2. Keep the task definition close to the top.
3. Move source-of-truth rules before implementation details.
4. Move validation near the end.
5. Add a short final validation reminder if useful.
6. Do not duplicate long rules.
7. Do not make the prompt longer unless necessary.
8. Preserve domain-specific instructions.
9. Keep the final structure easy to scan.

Preferred structure (adapt to skill's purpose):
- TASK / PURPOSE
- CRITICAL RULES
- INSTRUCTION PRIORITY
- SOURCE OF TRUTH
- INPUTS / CONTEXT STRATEGY
- STEPS / IMPLEMENTATION
- VALIDATION
- OUTPUT FORMAT

## Required Output Format

### Structure Repairs Made
List what was moved or reorganized.

### Revised Skill Prompt
Provide the full revised skill prompt. This must be complete and standalone.

### Remaining Concerns
List anything not fully fixed, or say "None."
