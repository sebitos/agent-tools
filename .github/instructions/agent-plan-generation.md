# Agent Plan Generation Framework

## PURPOSE

Ensure all plans are generated with:
- Correct domain awareness
- Applicable playbooks pre-applied
- Complete milestone structure

This runs BEFORE any plan is created.

---

## CORE PRINCIPLE

Plans must be generated WITH playbooks, not before them.

A plan that does not reflect playbook requirements is INVALID.

---

## PIPELINE

All tasks MUST follow this sequence:

1. Understand Intent
2. Detect Applicable Playbooks
3. Generate Plan Using Playbooks
4. Save Plan
5. Begin Execution Protocol

---

## STEP 1 — INTENT ANALYSIS

Extract:

- Task type (API, UI, backend, infra, data, etc.)
- Scope (feature, refactor, bugfix, system)
- Complexity level

---

## STEP 2 — PLAYBOOK DETECTION

Match task to playbooks.

Examples:

- API → api-playbook.md
- UI → ui-playbook.md
- Accessibility → accessibility-playbook.md
- Data → data-playbook.md

Rules:

- Multiple playbooks CAN be applied
- MUST include all relevant ones
- If unsure → include rather than exclude

---

## STEP 3 — PLAN GENERATION

The plan MUST:

- Follow taskplan_TEMPLATE.md
- Include milestones derived from playbooks
- Include:
  - validation
  - error handling
  - testing
  - edge cases

Each milestone must be:

- Atomic
- Verifiable
- Sequential

---

## STEP 4 — VALIDATION

Before saving plan, verify:

- Does it reflect ALL playbook requirements?
- Are there missing milestones?
- Is execution possible without adding new steps later?

If NO → regenerate plan

---

## HARD RULES

- No playbook detection → STOP
- No plan generation → STOP
- No validation → STOP

---

## OUTPUT

Plan file in:

/.github/plan/<task>.plan.md