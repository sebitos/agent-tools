# Agent Playbook Selection Framework

## Purpose

Automatically select and apply the appropriate playbooks based on the current task or milestone.

Playbooks define HOW to implement work.
Plans define WHAT to implement.

---

## When This Runs

This step runs:

- After loading the plan
- Before executing a milestone

---

## Selection Rules

### 1. Explicit Selection (Highest Priority)

If the plan includes:

## Playbook
<playbook-name>

→ Load and apply that playbook

---

### 2. Implicit Selection (Auto-Detection)

If no playbook is specified, infer based on task characteristics.

---

## Detection Heuristics

### API Development

Trigger if:
- Mentions: endpoint, route, controller, API, request/response
- Backend service logic is being created or modified

→ Load: `api-development.playbook.md`

---

### Refactoring

Trigger if:
- Mentions: refactor, clean up, improve structure
- Code duplication or complexity is present

→ Load: `refactoring.playbook.md`

---

### Debugging

Trigger if:
- Mentions: bug, fix, error, failing test
- Unexpected behavior is described

→ Load: `debugging.playbook.md`

---

### Accessibility / UI Compliance

Trigger if:
- UI, UX, frontend, interaction changes
- Mentions: accessibility, usability, compliance

→ Load: `accessibility-compliance.playbook.md`

---

### Testing

Trigger if:
- Mentions: test, spec, unit test, integration test, coverage, e2e, TDD
- A milestone produces new functions, classes, or modules
- A bug fix milestone exists (regression test required)

→ Load: `testing.playbook.md`

---

### Performance Optimization

Trigger if:
- Mentions: performance, latency, throughput, memory, benchmark, profil, slow, optimize
- Deployment Target specifies a performance threshold (e.g. p99 < 200ms)

→ Load: `performance.playbook.md`

---

### Game Development

Trigger if:
- Mentions: game, mechanic, player, enemy, level, spawn, health, score, game loop, core loop
- Codebase contains Unity (.asmdef, MonoBehaviour), Unreal (.uproject, UPROPERTY), or Godot (.gd, .tscn) files
- Task involves game systems: combat, movement, inventory, AI behaviour, save/load, physics

→ Load: `game-development.playbook.md`

Also load `game-testing.playbook.md` when:
- A game milestone adds or changes a system that affects player-facing behaviour
- The task mentions playtesting, QA, or platform submission

---

### Mobile Development

Trigger if:
- Mentions: iOS, Android, iPhone, iPad, tablet, phone, SwiftUI, UIKit, Jetpack Compose, App Store, Play Store, mobile app, Flutter, React Native
- Codebase contains `.swift`, `.xcodeproj`, `.xcworkspace`, `Package.swift` (iOS/macOS), or `.kt`, `AndroidManifest.xml`, `build.gradle` (Android)
- Task involves: adaptive layouts (phone vs tablet), push notifications, in-app purchases, deep linking, background tasks, app submission

→ Load: `mobile-development.playbook.md`

---

## Multiple Playbooks

- Multiple playbooks may be active simultaneously
- Apply all relevant rules
- If conflicts arise:
  → Follow system rules first  
  → Then code practices  
  → Then resolve playbook conflict conservatively  

---

## Execution Behavior

Once selected:

- Playbooks become MANDATORY guidance
- They define HOW implementation is performed
- They do NOT override:
  - Plan scope
  - Milestones
  - System constraints

---

## Logging Requirement

The agent must log:

- Which playbooks were selected
- Why they were selected

Example:

"Selected API Playbook due to endpoint creation in milestone M1"

---

## Failure Conditions

If the agent cannot determine an appropriate playbook:

→ Proceed without one  
→ Log: "No applicable playbook found"

---

## Anti-Patterns

- Ignoring a clearly applicable playbook
- Selecting playbooks without justification
- Overriding plan scope using playbooks