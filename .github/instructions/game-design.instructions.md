---
description: 'High-level game design principles for Copilot to follow when working in any game codebase. Covers player experience, mechanics, feel, difficulty, and code patterns for game systems.'
applyTo: '**/*.gd,**/*.tscn,**/*.cs,**/*.cpp,**/*.h,**/project.godot,**/*.uproject,**/*.uplugin,**/Build.cs,**/*.unity,**/*.asset'
---

# Game Design Principles

## Core Player Experience

- **Every system serves a feeling** — before writing code for a mechanic, name the feeling it should produce (power, tension, discovery, relief). If you cannot name it, reconsider the mechanic.
- **The player is always right about their experience** — if a player feels lost, the design is unclear. Never explain the problem away; fix the design.
- **Reduce friction in core loops** — the actions a player performs most often (move, aim, jump, attack) must be the most responsive and polished.

## Mechanic Design

- **One mechanic, many expressions** — a strong mechanic should appear in exploration, combat, and puzzle contexts. If a mechanic only works in one context, it may not be worth its complexity cost.
- **Introduce mechanics safely, then challenge them** — always give players a low-stakes introduction to a new mechanic before requiring it under pressure.
- **Depth over breadth** — fewer systems that interact meaningfully are better than many shallow systems. Before adding a new mechanic, ask: "Does this make an existing mechanic more interesting?"

## Game Feel (Juice)

- **Every action needs feedback** — any player input must produce an immediate response: animation, sound, particle effect, or camera reaction. Silent, static responses feel broken.
- **Anticipation + action + recovery** — structure all animations with windup (anticipation), impact (action), and settle (recovery). Removing windup makes actions feel weightless; removing recovery makes them feel floaty.
- **Numbers on screen signal impact** — damage numbers, score popups, and resource changes communicate power. Larger numbers = larger feeling of impact.

## Difficulty & Accessibility

- **Design for the median player** — balance and tune numbers based on data from players who are not developers or testers. Developers have expertise bias.
- **Difficulty is not cruelty** — hard should mean "requires skill and thought", not "opaque rules" or "unavoidable punishment".
- **Always provide accessibility options** — colorblind modes, subtitle size, aim assist, and difficulty sliders are not optional features; they expand your audience and are ethically correct.
- **Fail states must teach** — when a player dies or fails, the game should make it clear why and what to try differently.

## Code Patterns for Game Systems

- **Separate data from behaviour** — use ScriptableObjects (Unity), Resources (Godot), or data structs (C++) for game data. Logic lives in systems; numbers live in data files.
- **Decouple systems with events/signals** — game systems should communicate through events rather than direct references. This enables iteration without cascading changes.
- **Pool frequently spawned objects** — bullets, particles, and enemies should use object pools, not instantiate/destroy per frame.
- **Time everything with delta time** — movement, physics, and timers must use `delta` (frame-independent time). Frame-rate-dependent values will break on different hardware.
- **Never hard-code tuning values** — damage, speed, cooldowns, and costs belong in exported variables or data files, not magic numbers in code.

## Narrative Integration

- **Story follows systems** — design the gameplay mechanic first; fit the narrative framing around it. Mechanics forced into a narrative premise become awkward.
- **Environmental storytelling over cutscenes** — show history through props, architecture, and NPC behaviour before resorting to scripted sequences.
- **Ludonarrative consistency** — player agency in gameplay must be consistent with the story's portrayal of the character. A "stealthy hero" who massacres in cutscenes creates dissonance.

## Performance Targets

| Platform | Target FPS | Physics FPS | Draw Calls (max) |
|----------|-----------|-------------|-----------------|
| PC (high) | 144 | 60 | 2000 |
| PC (mid) | 60 | 60 | 1000 |
| Console | 60 | 60 | 1000 |
| Mobile | 30–60 | 30 | 200 |

- Profile early and often. Performance problems found late are expensive to fix.
- The CPU game thread (logic, AI, physics) and GPU (rendering) must both meet targets independently.
