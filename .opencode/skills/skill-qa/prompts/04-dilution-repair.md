# Repair Dilution Findings

You are repairing a coding-agent skill based on a Dilution Test.

## Current Revised Skill

"""
{{CURRENT_REVISION}}
"""

## Dilution Test Results

"""
{{AUDIT_RESULTS}}
"""

## Task

Repair the skill to reduce instruction dilution.

## Rules

1. Remove redundant instructions.
2. Consolidate overlapping rules.
3. Resolve conflicting instructions.
4. Preserve critical safety and correctness rules.
5. Do not remove useful domain-specific instructions.
6. Do not make the prompt longer unless needed.
7. Prefer one strong rule over several repeated rules.
8. Keep hard rules only for correctness, safety, scope control, and validation.
9. Convert style preferences into softer guidance.
10. Keep the skill practical for real coding work.

## Required Output Format

### Dilution Repairs Made
List what was removed, consolidated, or rewritten.

### Revised Skill Prompt
Provide the full revised skill prompt. This must be complete and standalone.

### Remaining Concerns
List anything not fully fixed, or say "None."
