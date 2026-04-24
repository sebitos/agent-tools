# Game Development Playbook

## Purpose

Define how game features and systems are planned, prototyped, and implemented — ensuring the core experience is fun before adding content, systems, or polish.

---

## When to Use

- Any milestone implementing a new game mechanic or core system
- When building a new game from scratch
- When extending an existing game with significant new gameplay
- When porting or rebuilding a game for a new platform

---

## Fundamental Rule: Core Loop First

> **Never add content to a broken core loop.**

The sequence is always:

1. **Core loop playable** — can the player perform the game's primary activity?
2. **Core loop fun** — do playtesters want to repeat it without being asked?
3. **Systems** — progression, economy, meta loop
4. **Content** — levels, enemies, items, narrative
5. **Polish** — juice, audio, VFX, UI

---

## Required Steps

### 1. Define the Core Loop

Before writing code, state this explicitly in the plan:

```
Core action:      <what the player DOES every few seconds>
Immediate result: <what happens immediately>
Reward:           <what the player gains / progresses toward>
Repeat hook:      <why the player wants to do it again>
```

Example:

```
Core action:      Aim and shoot enemies
Immediate result: Enemy dies and drops gold
Reward:           Gold purchases upgrades between rooms
Repeat hook:      Each upgrade meaningfully changes how the next room plays
```

---

### 2. Vertical Slice Milestone

Implement the smallest playable version of the core loop before any other work.

A Vertical Slice includes:
- One level / room / arena
- One enemy type (minimal AI)
- One player ability
- Minimal UI (health display, basic feedback)
- No progression, no meta layer, no content variety

**Acceptance criteria** — the Vertical Slice milestone is complete when:
- A new player can start and play for 5 minutes without instructions
- At least one non-developer playtester says "I want to keep playing"
- No crashes, no soft-lock states

---

### 3. Playtest After Every Milestone

After every implementation milestone:

1. **Play it yourself** — identify obvious breaks and friction points
2. **Watch someone else play** — do not help; observe silently where they get stuck
3. **Record feedback** — what confused them? What felt bad? What felt satisfying?
4. **Triage**: Fix broken things before adding new things

---

### 4. Iterate Before Expanding

- Do not add a second enemy type until the first feels satisfying to fight
- Do not add a second level until the first level is fun to replay
- Do not implement progression until the base session experience justifies returning to it

---

### 5. Scope Management

For each proposed feature, ask:

1. Does this make the core loop more fun?
2. Is this required for the game to be shippable?
3. Can the game be fully experienced without it?

If all three answers are No → cut it.

---

## Milestone Structure for Game Features

Each game feature milestone must follow this format:

```markdown
### Feature: <name>

Status: [ ] Not Started

Acceptance Criteria:
- [ ] Player can perform the action
- [ ] Action has clear visual and audio feedback
- [ ] Feature does not break the existing core loop
- [ ] Playtested by at least one non-developer

Verify Commands:
- Run the game and play through the feature manually
- Run automated tests for any pure logic (damage calculation, spawn logic, inventory math)

Commit Message: feat(gameplay): add <feature>
```

---

## Expose All Tunable Values

Never hardcode game balance values in logic — always expose them as configurable data:

| Engine | Mechanism |
|--------|-----------|
| Unity | `ScriptableObject` assets or `[SerializeField]` fields |
| Unreal | `UDataAsset`, `UPROPERTY(EditAnywhere)`, or Data Table |
| Engine-agnostic | JSON / YAML config file loaded at startup |

This allows balancing without code changes.

---

## Anti-Patterns

| Anti-pattern | Risk | Fix |
|---|---|---|
| Feature creep before core loop | Ship never happens | Freeze scope until core loop passes playtest |
| Polish before systems | Art assets get thrown out | Polish last |
| No playtesting until "ready" | Late discovery of fundamental fun problems | Playtest from Vertical Slice onward |
| Skipping object pooling | Frame rate drops at player-visible moments | Pool from the start for any entity that spawns at runtime |
| Hardcoded game values | Balancing requires code changes | Expose all tunable values as config or data assets |
| Building systems without a plan | Scope creep; wasted code | Plan first; code from milestones only |
