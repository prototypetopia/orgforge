---
name: pr
description: Create a pull request with conventional commit title and optionally squash merge it
argument-hint: [merge]
disable-model-invocation: true
---

Create a pull request for the current branch against `main`, with an optional squash merge.

## Critical Rules

1. **No destructive git operations.** Do not force-push or rewrite branch history (no amend, rebase, or reset).
2. **Stop on errors.** If any `git` or `gh` command fails, stop and report the error to the user. Do not proceed to the next step.
3. **One PR per branch.** If a PR already exists and the user did not request `merge`, print the existing PR URL and stop.

## Context

- Current branch: !`git branch --show-current`
- Commits since main: !`git log main..HEAD --oneline 2>/dev/null || echo "(no commits ahead of main)"`
- Changed files: !`git diff main...HEAD --stat 2>/dev/null || echo "(no diff)"`

## Steps

1. **Guard.** Verify the branch is not `main`. If it is, stop and tell the user. Also check if the branch has commits ahead of main — if not, warn the user the PR will be empty and stop.
2. **Push.** Check if the branch has a remote tracking branch. If not, push with `git push -u origin HEAD`.
3. **Check existing PR.** Run `gh pr view --json number,url 2>/dev/null`. If a PR exists:
   - If the user invoked `/pr merge`, skip to step 5.
   - Otherwise, print the existing PR URL and stop.
4. **Create PR.** Using the commit and diff context above:
   - **Title**: Conventional commit format (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `ci:`, `perf:`). Under 70 characters.
   - **Body**: Summary bullets should describe the WHY, not just the WHAT. Test plan should list verifiable actions.
   ```
   gh pr create --title "<title>" --body "$(cat <<'EOF'
   ## Summary
   <1-3 bullet points describing why these changes were made>

   ## Test plan
   <bulleted checklist of verifiable actions>
   EOF
   )"
   ```
5. **Merge (if requested).** If the user invoked `/pr merge`, squash merge:
   ```
   gh pr merge --squash
   ```
6. **Verify.** Run `gh pr view --json url,state`. Confirm the URL is valid and the state matches expectations (open for create, merged for merge). If verification fails, report the error — do not assume the PR was created or merged. Print the PR URL and state to the user.
