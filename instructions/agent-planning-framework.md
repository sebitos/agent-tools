# Agent Planning Framework
**For:** AI assistant (GitHub Copilot / Claude Sonnet 4.6)  
**Updated:** 2026-02-28

---

# Core Rule (Non-Negotiable)
No code, no edits to non-plan files, and no terminal commands until a plan file exists and is complete.

**Exception:**  
Creating and editing the plan file itself is always allowed in Phase 0.

---

# Plan File Location & Naming
All plans must be stored in: `/.github/plan/<taskname>.plan.md`


### Rules
- If `/.github/plan` does not exist, create it
- Task name must be:
  - lowercase
  - hyphenated
  - ≤ 4 words

### Example
User: "add OAuth login"  
Plan file: `/.github/plan/oauth-login.plan.md`

---

# Plan Authority Rule
The plan is the **single source of truth**.
If implementation needs to change:
  1. Update the plan first
  2. Then proceed with implementation

Never implement undocumented behavior.

---

# Autonomy Rules
The agent runs continuously until the Deployment Target is reached.
It must not stop between milestones unless a valid stop condition occurs.

## Valid Stop Conditions (ONLY these)

| Condition | Action |
|----------|--------|
| Permission denied / sudo required and cannot be bypassed | Stop and report exact command + error |
| Missing secret / credential / API key | Stop and specify exact variable or file needed |
| Irreversible destructive action on production data | Stop and request explicit approval |
| Milestone marked `HUMAN-GATE` | Stop and describe required approval |
| Major schema/data model or cost-impacting change | Require HUMAN-GATE unless pre-approved |


For all other issues:
- Build errors
- Test failures
- Missing dependencies
- Misconfigurations

→ Fix and continue without asking

---

# Failure Recovery Rule
If a verify command fails:
- Retry and fix immediately

If it fails 3 times consecutively:
1. Re-read relevant files
2. Re-evaluate approach
3. Log a new decision
4. Try an alternative solution

If it still fails after 5 attempts total:
- Stop and report:
  - What failed
  - What was attempted
  - Suggested next action

---

# Phase 0 — Plan Creation
Before touching any code:
Create: `/.github/plan/<taskname>.plan.md`  
Use template: `/.github/plan/taskplan_TEMPLATE.md`

---

## Phase 0 Exit Checklist
- Architecture overview written (ASCII diagram allowed)
- All milestones defined:
  - scope
  - affected files
  - acceptance criteria
  - verify commands
- Risk register includes ≥ 3 risks with mitigation
- Decision log includes at least one non-obvious decision
- Plan is self-contained and understandable without prior context

Only proceed when the plan is coherent and complete.

---

# Phase 1 — Milestone Execution Loop
Repeat for each milestone:
1. Update milestone status → `in-progress`
2. Implement only the defined scope
3. Run all verify commands
4. Fix failures (do not proceed while failing)
5. Update milestone status → `done`
6. Append decision-log entry (for any tradeoffs)
7. Commit: `git commit -m "<taskname>: M<N> <description>"`
8. Move to next milestone

---

## Scope Discipline
If something is tempting but outside current scope:
- Do NOT implement it
- Add it as a future milestone in the plan

---

# Phase 2 — Deployment & Completion
The task is complete only when:
- All milestones are marked `done`
- All verify commands pass
- Deployment Target is reached
- Decision log reflects key decisions
- Plan file status is updated to: `COMPLETE`

Only then report back.

---

# Resume Protocol (Context Limit Handling)
If context window is near limit:
1. Commit current progress
2. Add at top of plan:

    ## RESUME HERE
    - Current milestone:
    - Last completed step:
    - Next exact action:
    - Files involved:

3. Stop cleanly

---

# Efficiency Rules

| Rule | Reason |
|------|--------|
| Read files before editing | Avoid stale context |
| Batch file reads | Reduce tool calls |
| Prefer targeted reads (grep) | Preserve context window |
| One commit per milestone | Reviewable diffs |
| No refactor + feature together | Prevent mixed diffs |
| Document decisions in plan | Persistence across sessions |

---

# Verify Command Standards
Verify commands must:
- Be executable
- Return non-zero on failure
- Validate the main success path of the milestone

---

# Risk Register Guidance
Each risk must include:
- Likelihood: High / Medium / Low
- Impact: High / Medium / Low
- Mitigation strategy

Always consider:
- Correctness / determinism
- State or data loss
- External dependencies (APIs, FS, network)
- Scope creep
- Context window overflow

---

# Naming Conventions
| Artifact | Pattern |
|----------|--------|
| Plan file | `/.github/plan/<taskname>.plan.md` |
| Commit | `<taskname>: M<N> <desc>` |
| Branch (optional) | `<taskname>-impl` |
| Test file | `test_<taskname>.py` or `<taskname>.test.ts` |

---

# Anti-Patterns (STRICTLY AVOID)
- Writing code before the plan
- Creating the plan after implementation
- Giant commits ("implemented everything")
- Milestones without verify commands
- Ignoring the decision log
- Mixing unrelated changes in one milestone
- Allowing plan and implementation to drift

---

# Final Principle
Plan → Execute → Verify → Log → Repeat
Discipline in this loop is mandatory.

# NO-DRIFT DESIGN (SYSTEM GUARANTEE MODEL)

## Core Principle
The plan file is the ONLY source of truth.
If a change is not in the plan → it does not exist.

---

## Rules
- The plan defines behavior; code is implementation only
- No code changes without corresponding plan updates
- Milestones are the only valid unit of progress
- Every milestone transition MUST be reflected in the plan

---

## Forbidden Drift

The following are NOT allowed:

- Implementing outside current milestone scope
- Updating code without updating plan state
- Skipping milestone status transitions
- Introducing unplanned behavior

---

## State Locking Rule

Only these state changes are valid:

- not-started → in-progress → done → COMPLETE

No other state mutation is valid.

---

## Commit Binding Rule

Every commit MUST correspond to exactly one milestone transition.

## Plan Quality Requirements

A plan is INVALID if:
- Acceptance criteria are vague
- Verify commands are weak
- Scope unclear

Fix before execution
