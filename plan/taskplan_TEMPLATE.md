# Task Plan: <taskname>

## Status
not-started

---

## Task Description
<One clear sentence describing the goal>

---

## Deployment Target
Define exactly what "done" means. Must be testable and observable.

Examples:
- API responds 200 at /health
- Frontend loads at http://localhost:3000 without errors
- Tests pass with 100% success rate

---

## Playbooks Applied

- api-development.playbook.md
- accessibility-compliance.playbook.md

---

## Architecture Overview

### Summary
<High-level explanation of how the system will work>

### ASCII Diagram
(Replace with your own diagram)
[Client] → [API] → [Database]
              ↓
       [External Service]

### Files In Scope
- path/to/file1
- path/to/file2

### Files Out of Scope
- path/to/untouched1
- path/to/untouched2

---

## Milestones

### M1 — <short title>
Status: not-started

Scope:
- Exact changes to implement
- Be strict and minimal

Key Files:
- path/to/file

Acceptance Criteria:
- [ ] Clear, binary outcome
- [ ] No subjective wording

Verify Commands:
- command here
- Expected: describe success output

Commit Message:
<taskname>: M1 <description>

---

### M2 — <short title>
Status: not-started

Scope:
- ...

Key Files:
- ...

Acceptance Criteria:
- [ ]

Verify Commands:
- command here
- Expected: ...

Commit Message:
<taskname>: M2 <description>

---

### M3 — <human gate example>
Status: not-started

⚠️ HUMAN-GATE: Do not proceed past this milestone without explicit human approval.
Reason: <e.g. irreversible infrastructure change / production deployment / credential rotation>

Scope:
- ...

Key Files:
- ...

Acceptance Criteria:
- [ ]

Verify Commands:
- command here
- Expected: ...

Commit Message:
<taskname>: M3 <description>

---

(Add more milestones as needed)

---

## Risk Register

### Risk 1 — <title>
- Likelihood: High / Medium / Low
- Impact: High / Medium / Low
- Mitigation: <strategy>

### Risk 2 — <title>
- Likelihood: High / Medium / Low
- Impact: High / Medium / Low
- Mitigation: ...

### Risk 3 — <title>
- Likelihood: High / Medium / Low
- Impact: High / Medium / Low
- Mitigation: ...

---

## Decision Log

<!-- Append entries during execution. Format:
### [Milestone] — <short title>
Decision: <what was decided>
Reason: <why this choice was made over alternatives>
Tradeoff: <what was given up or accepted>
-->

### [M0] — Example entry
Decision: Used X approach instead of Y
Reason: Y requires a new dependency; X is achievable with stdlib
Tradeoff: Slightly more verbose but no added dependency surface area

### Entry 1
- Decision: <what was decided>
- Reason: <why>
- Alternatives considered: <optional>

(Add entries during execution)

---

## Parking Lot (Out of Scope)

- Idea 1
- Idea 2

Do not implement these in current milestones.

---

## RESUME HERE (only when needed)

- Current milestone:
- Last completed step:
- Next exact action:
- Files involved: