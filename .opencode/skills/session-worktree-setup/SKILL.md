---
name: session-worktree-setup
description: Worktree, branch, remote session setup. Use when starting or resuming a required workstream slug in a dedicated git worktree and session/<slug> branch.
argument-hint: <workstream-slug>
---

Set up a named workstream in a dedicated git worktree and branch so the user can
start work from the correct directory and session state.

## Definitions

- **slug** — the required `<workstream-slug>` argument; valid form
  `^[a-z0-9]+(-[a-z0-9]+)*$`.
- **branch name** — `session/<slug>`.
- **worktree path** — sibling directory `../provider-copilot-<slug>`.
- **selected base** — the base branch used throughout: `origin/main` when it
  exists, otherwise local `main`.

## Critical Rules

1. **Slug is required.** If missing or invalid, ask for a valid slug and stop.
2. **This skill may add a git worktree.** Before `git worktree add` it may run
   only the commands in the Allowed Shell Commands list — the authoritative,
   exhaustive allowlist in Inputs and Reference below. Any command not on that
   list is forbidden.
3. **Never run destructive git or filesystem commands.** No overwrite, reset,
   delete, rebase, force-push, clean, destructive prune, directory removal, or
   project-file edits — the only file tree this skill may create is the checkout
   produced by `git worktree add`. `git fetch --prune` is permitted only as a
   remote ref refresh. **This is the canonical safety rule; other sections point
   here rather than restate it.**
4. **Do not act on ambiguity.** Ask before creating a worktree when branch
   ownership, merge state, path state, or session state is unclear.
5. **Respect existing worktrees.** If `session/<slug>` is already checked out in
   another worktree, reuse it; never create a duplicate.
6. **Branch state decides behavior; Branch Decision Rules are authoritative.** A
   merged remote branch is stale by default — ask before reusing the name.
7. **Squash/rebase merges may look divergent.** Merge detection uses the local
   commit graph, so a squash-merged or rebased remote branch may not be an
   ancestor of the base even though its PR is merged. **This is the canonical
   ambiguity rule:** treat that state as ambiguous and ask before creating.
8. **Do not permanently claim the shell changed directories.** The agent may use
   the selected path as `workdir` for future tool calls, but the user's running
   CLI/session process may need to be restarted from that directory.

## Instruction Priority

When rules appear to conflict, resolve in this order (higher wins):

1. Slug must be present and valid before ANY git command runs.
2. Never run a destructive command or edit project files (Critical Rule 3).
3. A triggered branch-state Confirmation Gate blocks worktree creation — STOP and
   ask, even if Branch Decision Rules conclude "create from base."
4. The session-readiness gate is informational and fires on create AND
   select/reuse: surface the status and ask "resume anyway?" It does not by itself
   block non-mutating selection. Evaluate this gate from the branch-authoritative
   session files defined below, not stale files from the source checkout.
5. Otherwise, Branch Decision Rules decide select / reuse / create / ask.
6. Selecting or reusing an existing worktree (no mutation) proceeds WITHOUT
   asking — except the session-readiness gate (item 4). Branch-state gates apply
   only to creating a new worktree and to ambiguous branch states.

Creating a worktree requires ALL of: a valid slug, completed preflight, a
resolved non-ambiguous branch decision, a validated path, and zero active gates.

## Branch Decision Rules

Single source of truth for branch-state behavior. Apply in order, then proceed
to Worktree Path Rules before any `git worktree add`:

1. If `session/<slug>` is already checked out in any worktree, select that
   worktree and do not create a new one. Still run Post-Merge Resync Detection
   (read-only) on it and report any recommended resync command.
2. If local `session/<slug>` exists and is not checked out elsewhere:
   - If it is an ancestor of the selected base, it is stale/merged. Ask before
     reusing it at its current tip. Do not move it to base automatically; if the
     user wants a fresh branch from base, stop and explain this skill must not
     reset or overwrite the existing branch (Critical Rule 3).
   - If the selected base is an ancestor of it, reuse it (then validate the path
     before creating).
   - Otherwise it is divergent — ask before creating a worktree.
3. If remote `origin/session/<slug>` exists and the local branch does not:
   - If the remote is an ancestor of the selected base, it is already merged.
     Ask whether to recreate/reuse `session/<slug>` from the current base;
     recommend reusing the `session/<slug>` name to preserve the convention.
   - If the selected base is an ancestor of the remote, treat the remote as
     active/unmerged and current with base. Ask before tracking it. If confirmed,
     create with `--track` from `origin/session/<slug>`. Do not create from base
     without confirmation.
   - Otherwise the remote branch is divergent from the selected base. Run
     `git diff --quiet <selected-base> origin/session/<slug>` before asking:
     - If the diff is empty, treat it as possibly squash/rebase merged or
       content-equivalent. Ask before tracking or reusing the name; do not call
       it active solely from session files.
     - If the diff is non-empty, treat it as active/diverged: it may contain
       unmerged work but is also behind/stale compared with current base. Ask
       before tracking it. If confirmed, create with `--track` from the remote
       branch and report that a post-creation merge from the selected base is
       likely needed. Do not create from base without confirmation.
4. If neither local nor remote branch exists, create `session/<slug>` from the
   selected base — only if no Confirmation Gate is active.

This skill only creates or selects worktrees — it never switches, tracks via
`git branch`, checks out, resets, or pulls (Critical Rule 3).

## Post-Merge Resync Detection (read-only)

This skill never resyncs a branch (Critical Rule 3). Whenever a local
`session/<slug>` branch exists that it selects, reuses, creates from a remote
tracking branch, or evaluates for reuse (including one already checked out via
Branch Decision Rule 1, and the divergent "ask" case of Rule 2), it CLASSIFIES
that branch against the selected base and REPORTS a recommended resync command
for the user to run separately. It reuses the same two
`git merge-base --is-ancestor` checks already run for Branch Decision Rules (plus
`git diff --quiet <selected-base> session/<slug>` for the squash case) — one
inspection, two readouts. When only a remote branch exists before worktree
creation, Rule 3 performs the analogous remote-ref diff only to decide what to
ask; after confirmed `--track` creation, run this local-branch detection on the
new worktree branch for the final report.

**Guard:** every recommended command is EMITTED to the user inside a fenced code
block, never executed. `reset`, `push`, and `merge` are absent from the Allowed
Shell Commands list, which is the hard stop — the skill cannot run them.

Let `A` = "is the selected base an ancestor of the branch?" and `B` = "is the
branch an ancestor of the selected base?". Classify and report (do not run):

1. **Up to date or ahead** (`A` true) — the branch already contains every base
   commit (it may also carry its own unmerged work — the normal active state).
   Resync: none needed.
2. **Behind base** (`A` false, `B` true) — base has commits the branch lacks.
   Recommend: `git merge origin/main`.
3. **Squash/rebase-merged** (`A` false, `B` false, AND `git diff --quiet
   <selected-base> session/<slug>` reports no difference) — diverged on the graph
   but content is already in base (stale already-merged commits). Recommend,
   after confirming a clean working tree:
   `git fetch origin && git reset --hard origin/main && git push --force-with-lease origin session/<slug>`.
4. **Diverged with unmerged work** (`A` false, `B` false, AND the diff is
   non-empty) — do NOT recommend reset; it would discard unmerged work.
   Recommend reviewing, then `git merge origin/main` (or a rebase).

For remote-only Rule 3, use the same diff interpretation against
`origin/session/<slug>` before creation. A non-empty diff is not a reason to
create from base; it means the remote branch likely has unmerged work and also
needs a merge from the selected base after checkout. An empty diff means content
is already equivalent to base, so do not treat remote session files alone as proof
the workstream is still active.

The recommended commands assume the default `origin/main` base and a branch
pushed to `origin`. If the selected base is local `main` (no `origin/main`),
substitute `main` for `origin/main` and drop the `git fetch origin` /
`git push --force-with-lease origin …` steps.

Note: case 3 matches only while the base has not advanced past the squash. Once
the base gains further commits, `git diff --quiet` turns non-empty and the branch
reclassifies as case 4 (merge, not reset). This is intentional — the skill never
recommends a reset it cannot prove safe from the read-only checks alone.

Report the classification and the exact command (or "none needed"); running it
is a separate manual step.

## Confirmation Gates

Ask before creating a worktree when any of these is true (branch-state detail
lives in Branch Decision Rules):

- Slug is missing or invalid.
- Branch-authoritative `sessions/<slug>/context.md` is missing.
- `git fetch --prune` failed and remote state affects the decision.
- A branch-state rule resolves to "ask" (merged, unmerged remote, divergent, or
  squash/rebase/content-equivalent ambiguity per Critical Rule 7).
- Target path exists but is not the expected worktree.
- Session state signals the workstream is done or not ready: an explicit
  complete / closed / blocked marker in `latest.md` or `<slug>-next-steps.md`
  (e.g. a status line, "DONE", "BLOCKED", or "merged"). This gate is
  informational and applies on select/reuse as well as creation — surface the
  status and ask "resume anyway?"; bias toward asking when the signal is unclear.
  It does not by itself block non-mutating selection. Branch-authoritative session
  files can identify the current task, but they do not override graph evidence
  that a remote branch is already merged/content-equivalent.

When asking, include the recommended default and the exact command that would run
if confirmed.

## Evaluation Order

Run no `git worktree add` until all prior steps pass:

1. Resolve and validate the slug.
2. Preflight inspection (session files + git state).
3. Branch selection (Branch Decision Rules).
4. Path validation (Worktree Path Rules).
5. Worktree creation.

Post-Merge Resync Detection is read-only and runs at branch selection / reporting
time (step 3 onward); it never gates or alters worktree creation.

## Inputs and Reference

**Input — required argument `<workstream-slug>`** (see Definitions for valid
form). If no slug is provided, stop and ask. Do not infer a slug from session
overview, and do not create a worktree without explicit slug confirmation. If the
input is not a valid slug, ask for a corrected slug and stop before any git
command. The slug regex is also the command-injection guard: it excludes every
shell metacharacter, and every `<slug>` interpolation into a command relies on
it — never loosen the regex without re-checking command construction.

**Required session files** — read these when they exist:

- `sessions/<slug>/context.md`
- `sessions/<slug>/latest.md`
- `sessions/<slug>/decision-log.md`
- `sessions/<slug>/<slug>-next-steps.md`

If branch-authoritative `sessions/<slug>/context.md` is missing, stop and ask
whether to initialize the session first with `/session-init <slug>`. Do not
create a worktree for a missing session unless the user explicitly confirms.
During initial preflight, a missing source-checkout `context.md` is tentative
when an existing remote/session branch may contain the file.

**Session file authority** — session files are branch-scoped:

- Files read from the current checkout during preflight are only source-checkout
  context until branch selection proves they belong to the selected branch.
- If `session/<slug>` is already checked out in a worktree, read the session files
  from that worktree before applying the session-readiness gate or reporting the
  current state.
- If local `session/<slug>` exists but is not checked out in a worktree, attempt
  to read the session files from the local branch ref with `git show` before
  applying the session-readiness gate. These local-ref files are authoritative
  until the worktree is created.
- If remote `origin/session/<slug>` exists and local `session/<slug>` does not,
  attempt to read the session files from the remote ref with `git show` before
  applying the session-readiness gate. These remote-ref files are authoritative
  until the worktree is created. A missing optional file is reported as missing;
  only missing branch-authoritative `context.md` triggers the missing-session
  gate.
- After creating or selecting any worktree, re-read the session files from the
  selected worktree path. The final `Current state & next task` MUST come from
  these selected-worktree files.
- If source-checkout files say closed/done/no open tasks but the local ref,
  remote ref, or selected worktree files say active, report the source checkout
  as stale and use the branch-authoritative active state, unless graph/diff
  evidence proves the branch is merged or content-equivalent to base.
- Treat a missing `context.md` in the branch-authoritative source (selected
  worktree, local ref, or remote ref for the remote-only case) as the
  missing-session gate. A missing source-checkout `context.md` does not block an
  existing branch ref that contains `sessions/<slug>/context.md`.

**Allowed Shell Commands** — this list is the hard stop; the skill cannot run
commands outside it. Use Read/Glob/Grep for file inspection.
Use the shell only for:

```bash
git fetch --prune
git status --short --branch
git worktree list --porcelain
git branch --all --format='%(refname:short)'
# Existence of base, local branch, remote branch (substitute the validated slug):
git rev-parse --verify --quiet origin/main
git rev-parse --verify --quiet main
git rev-parse --verify --quiet session/<slug>
git rev-parse --verify --quiet origin/session/<slug>
# Branch session file inspection before a worktree exists (substitute slug):
git show session/<slug>:sessions/<slug>/context.md
git show session/<slug>:sessions/<slug>/latest.md
git show session/<slug>:sessions/<slug>/decision-log.md
git show session/<slug>:sessions/<slug>/<slug>-next-steps.md
git show origin/session/<slug>:sessions/<slug>/context.md
git show origin/session/<slug>:sessions/<slug>/latest.md
git show origin/session/<slug>:sessions/<slug>/decision-log.md
git show origin/session/<slug>:sessions/<slug>/<slug>-next-steps.md
# Ancestry: compare the session branch (local or remote) against the selected
# base, in BOTH directions, to classify merged / active / divergent:
git merge-base --is-ancestor <session-or-remote-branch> <selected-base>
git merge-base --is-ancestor <selected-base> <session-or-remote-branch>
# Resync detection (read-only): is the branch's content already in base?
# exit-0 / no output = squash- or rebase-merged (stale already-merged commits);
# the skill REPORTS a resync command but never runs it:
git diff --quiet <selected-base> session/<slug>
git diff --quiet <selected-base> origin/session/<slug>
# Path existence / inspection (also used as post-creation read-back):
test -e ../provider-copilot-<slug>
git -C ../provider-copilot-<slug> rev-parse --is-inside-work-tree
git -C ../provider-copilot-<slug> status --short --branch
# Worktree creation (one of these, only after all checks pass):
git worktree add ../provider-copilot-<slug> session/<slug>
# --no-track: first push creates origin/session/<slug> (see Worktree Creation):
git worktree add -b session/<slug> --no-track ../provider-copilot-<slug> <selected-base>
git worktree add --track -b session/<slug> ../provider-copilot-<slug> origin/session/<slug>
```

Only substitute `<slug>` with the validated slug and `<selected-base>` with
`origin/main` or `main` per Definitions. Quote paths containing spaces.

## Steps

**Preflight:**

1. Resolve and validate `<slug>`.
2. Read available session files listed above from the current checkout as
   source-checkout context only. Do not treat those files as final authority until
   branch selection confirms the selected branch is the current checkout.
3. Run `git fetch --prune` so remote branch and merge-state checks are current.
   If fetch fails because the environment is offline, continue with local state
   only, state that remote freshness could not be verified, and ask before
   creating any worktree that depends on remote branch absence.
4. Run the inspection commands: `git status --short --branch`,
   `git worktree list --porcelain`, `git branch --all`.
5. Determine the selected base (`origin/main` else `main`).
6. Determine whether `session/<slug>` exists locally and whether
   `origin/session/<slug>` exists remotely.
7. If local `session/<slug>` exists but is not already checked out, attempt to
   read the four session files from the local branch ref with `git show`. Use the
   local-ref files found for the session-readiness gate and current-state summary
   until a worktree exists, then re-read from the worktree after creation.
8. If remote `origin/session/<slug>` exists and local `session/<slug>` does not,
   attempt to read the four session files from the remote ref with `git show`.
   Use the remote-ref files found for the session-readiness gate and
   current-state summary until a worktree exists, then re-read from the worktree
   after creation.
9. For local-ref or remote-ref session-file inspection, missing optional files are
   normal; missing branch-authoritative `context.md` triggers the missing-session
   gate.
10. Determine whether the target path exists.

**Worktree Path Rules** — evaluate after branch selection and before any
`git worktree add`:

1. Default to `../provider-copilot-<slug>`.
2. The path must resolve outside the repository root (the default
   `../provider-copilot-<slug>` sibling and the `-2` alternate qualify). Reject
   any path nested inside the current work tree — creating a worktree inside the
   repo is not allowed; ask for a path outside the repo.
3. If the path does not exist, it is available.
4. If the path exists and is already a git worktree for `session/<slug>`, select
   it and do not create another worktree.
5. If the path exists but is not the expected worktree, stop and ask for a new
   path. Recommend `../provider-copilot-<slug>-2`.
6. Never remove or overwrite an existing directory (Critical Rule 3).

**Worktree Creation** — only after all checks pass and no confirmation gate is
pending. Base-branch creation reads directly from the selected base ref and is
unaffected by the current working tree's state (dirty or detached HEAD), so no
working-tree cleanup is needed or permitted (Critical Rule 3).

- Existing safe local branch:
  `git worktree add ../provider-copilot-<slug> session/<slug>`
- New branch from the selected base (`--no-track` so it does not inherit the
  base's `origin/main` upstream; the first push then creates
  `origin/session/<slug>` and sets it as upstream):
  `git worktree add -b session/<slug> --no-track ../provider-copilot-<slug> <selected-base>`
- Confirmed remote branch tracking:
  `git worktree add --track -b session/<slug> ../provider-copilot-<slug> origin/session/<slug>`

After creation (or when selecting an existing worktree), **read back the
result**: run `git -C <worktree-path> status --short --branch` and confirm the
branch is `session/<slug>`. Then re-read the session files from
`<worktree-path>/sessions/<slug>/...`; these selected-worktree files are the
final authority for the output's current state, next task, and session-readiness
status. Then, by case:

- **Newly created branch** — confirm HEAD matches the selected base ref and the
  tree is clean.
- **Reused worktree** — branch-name match is the pass condition; a dirty tree is
  normal in-progress work, so report it but do not treat it as a failure.
- **`--track` creation from a remote branch** — confirm the branch header shows
  upstream `origin/session/<slug>`.

If the read-back does not match (wrong branch, or new-branch HEAD ≠ base), report
the discrepancy and do not claim success. If creation fails, report the exact
failure, do not attempt cleanup (Critical Rule 3), and report whether
`git worktree list` now shows a partial or locked entry for the path so the user
knows what to inspect.

## Output Format

After selecting or creating a worktree, report these fields:

- **Slug** — the validated slug.
- **Worktree path** — selected/created path.
- **Branch** — `session/<slug>`.
- **Reused vs. created** — which path was taken.
- **Base branch** — selected base used (only if a branch was created).
- **Remote branch state** — absent, active/unmerged-current,
  active/diverged-behind-base, merged/stale, content-equivalent,
  divergent-ambiguous, or not verified.
- **Session files read** — which of the four were found and read, and from which
  source: source checkout, branch ref, or selected worktree.
- **Current state & next task** — from `latest.md` / `<slug>-next-steps.md`.
  Use the selected-worktree files after creation/selection; before creation, use
  branch-ref files read with `git show session/<slug>:...` or
  `git show origin/session/<slug>:...`. If these disagree with source-checkout
  files, call out the source-checkout files as stale and do not report their
  stale state as current.
- **Resync recommendation** — the Post-Merge Resync Detection classification plus
  the exact command (or "none needed"), noting the skill did not run it.
- **Next command** — usually `/session-resume <slug>` or `/session-plan <slug>`.
- **Commands run / failed / skipped** — which git commands actually ran, and any
  that failed or were skipped (e.g. an offline `git fetch`).

Do not claim a state was verified if the corresponding command did not run.

When the selected worktree path differs from the current process directory, end
with:

```text
For a true session-root switch, restart your CLI/session from: <worktree-path>
```

## Final Validation

- [ ] Slug matched the slug regex and was validated before any git command ran
      (the regex also serves as the command-injection guard for `<slug>`).
- [ ] Available source-checkout session files (`context.md`, `latest.md`,
      `decision-log.md`, `<slug>-next-steps.md`) that exist were read before the
      branch/worktree decision, but were not treated as final authority unless
      the selected branch is the current checkout.
- [ ] For existing local or remote-only `session/<slug>` branches without a
      selected worktree yet, branch-ref session files were attempted with
      `git show` and used for the session-readiness gate before creating the
      worktree; missing optional files were reported as missing, not treated as
      blockers.
- [ ] `git fetch --prune` was attempted; if it failed, remote-dependent
      decisions were gated behind a confirmation.
- [ ] Existing worktrees were listed and an existing `session/<slug>` worktree
      was reused, not duplicated.
- [ ] Branch state was classified by running `git merge-base --is-ancestor`
      (both directions) before deciding merged / active / divergent; squash/
      rebase/content-equivalent ambiguity was treated as a confirmation gate.
- [ ] Remote-only divergent branches were further checked with
      `git diff --quiet <selected-base> origin/session/<slug>` before deciding
      content-equivalent vs active/diverged-behind-base.
- [ ] For an existing local branch that was selected, reused, or evaluated for
      reuse, Post-Merge Resync Detection ran (read-only) and any recommended
      resync command was reported, not executed.
- [ ] Path was validated as resolving outside the repo root (not nested in the
      work tree), and no Confirmation Gate was active at the moment of creation.
- [ ] Post-creation read-back (`git -C <path> status --short --branch`) confirmed
      the `session/<slug>` branch; for a new branch HEAD matched the selected base
      on a clean tree; for a reused worktree any dirty state was reported (not
      failed); for a `--track` creation upstream was `origin/session/<slug>`.
- [ ] After creation/selection, session files were re-read from the selected
      worktree and used for the final current-state / next-task report.
- [ ] On any creation failure: the exact error was reported, no cleanup was
      attempted, and whether a partial/locked worktree entry was left was stated.
- [ ] **Every command run came from the Allowed Shell Commands allowlist — that
      list is exhaustive — and no destructive git or filesystem command ran, and
      no project file was edited outside the `git worktree add` checkout.**
- [ ] Output includes path, branch, reused-vs-created, remote state, session
      files read, current state/next task, next command, and the commands run /
      skipped.

On any failed safety or precondition check, do not report success — stop and ask,
or report the exact blocker. Never attempt cleanup.
