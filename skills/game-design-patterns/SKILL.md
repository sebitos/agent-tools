---
name: game-design-patterns
description: |
  Engine-agnostic game design patterns, player experience principles, and feedback system design. Use this skill when:
  - Designing or critiquing a core game loop, meta loop, or session structure
  - Implementing game feel: hit stop, screen shake, particle feedback, audio response
  - Designing difficulty curves, challenge scaling, or player progression
  - Building reward systems, economies, or progression mechanics
  - Designing level structure, pacing, and player guidance (without text tutorials)
  - Implementing player feedback systems (visual, audio, haptic responses to game events)
  - Balancing positive vs negative feedback loops in a game economy
  - Designing or reviewing a tutorial or onboarding flow
  - Any task focused on making a game more fun, readable, or satisfying to play
---

# Game Design Patterns

Engine-agnostic patterns for player experience, game feel, and design system implementation.

---

## Core Game Loop

Every game needs three loops operating at different timescales:

```
Core Loop   (seconds) : Action → Immediate Result → Small Reward → Repeat
Meta Loop   (minutes) : Session → Unlock / Progress → Return Hook
Campaign    (hours)   : Story beat → Milestone → Narrative reward → Completion
```

**Design Rule**: The core loop must be fun before adding the meta loop. A broken core loop cannot be saved by progression systems.

**Core loop validation checklist**:
- [ ] Player achieves a clear result within 30 seconds
- [ ] Failure is instructive — player understands why they failed
- [ ] Next attempt is immediately accessible (no long death screens)
- [ ] Every action has clear, readable feedback

---

## Game Feel (Juice)

Game feel is the tactile, visceral satisfaction of interaction. Every core action needs at minimum:

| Action | Visual | Audio | Haptic (if applicable) |
|--------|--------|-------|------------------------|
| Jump | Squash/stretch + dust particle on land | Whoosh + landing thud | Light pulse on land |
| Hit enemy | Hit stop (2–4 frames) + impact particle | Impact SFX | Sharp pulse |
| Collect item | Scale pop + colour flash | Pickup chime | Light tap |
| Die | Death animation + screen flash | Death SFX | Strong pulse |

### Hit Stop

Pause the animation briefly on a significant impact — makes every hit feel weighty:

```csharp
// Unity example
private IEnumerator HitStop(float duration) {
    Time.timeScale = 0f;
    yield return new WaitForSecondsRealtime(duration);
    Time.timeScale = 1f;
}
// Typical durations: light hit = 2 frames, heavy hit = 4–6 frames
```

### Screen Shake

Use noise-based displacement — not a simple sin wave (noise reads as more natural):

```csharp
// Perlin noise shake
float intensity = shakeMagnitude * Mathf.PerlinNoise(Time.time * shakeFrequency, 0f);
camera.transform.localPosition = Random.insideUnitSphere * intensity;
```

**Rule**: Add feedback first, tune magnitude second. Missing feedback feels broken to players.

---

## Difficulty Curves

Difficulty should follow the player's skill growth — not a flat linear ramp:

```
Difficulty
│          /‾‾‾‾‾‾
│         /
│   _____/
│__/
└──────────────────── Time
  Tutorial  Mid  Late
```

**Proven patterns**:
- **Introduction → Escalation → Twist**: Teach a mechanic safely → escalate it → combine with another
- **Rest rooms**: After a hard section, give the player a low-stakes area to recover and explore
- **Rubber band**: Subtle difficulty reduction when a player is failing repeatedly (should be invisible)
- **Telegraphed spikes**: Give a visual or audio cue that a hard section is approaching (boss music, visual shift)

---

## Player Guidance Without Text Tutorials

Guide players through level design, not instruction walls:

1. **Light and contrast**: Bright or lit areas draw the eye toward the intended path
2. **Enemy density**: Dense = path is blocked / progress needed; sparse = safe exploration zone
3. **Architecture funnelling**: Use geometry to guide movement; avoid 50/50 ambiguous branching
4. **Safe failure teaching**: Let the player fail in a consequence-free context before requiring the skill in earnest

### Tutorial Design Rules

- Teach one mechanic at a time
- Immediately give a context to use the mechanic after teaching it
- Never lock the tutorial skip for returning players
- Every tutorial element must be cuttable — if removing it doesn't break onboarding, remove it

---

## Economy and Progression

### Resource Types

| Type | Earned by | Spent on |
|------|-----------|----------|
| Hard currency | Playing | Core progression |
| Soft currency | Purchase or rare drops | Cosmetic or acceleration |
| Energy / stamina | Time (mobile pattern) | Session gating — avoid unless intentional |

### Feedback Loop Design

**Positive feedback loop** (rich get richer): Player advantage compounds.
- Example: Kill enemies → earn gold → buy better weapons → kill faster
- Risk: Runaway-leader snowball
- Balance: Diminishing returns; catch-up mechanics; reset points (roguelite run end)

**Negative feedback loop** (balance-restoring): Disadvantage is partially corrected.
- Example: Losing units makes enemy AI slightly easier; leading player gets targeted
- Risk: Feels unfair if too strong
- Balance: Keep it subtle — players should not consciously notice the balancing effect

---

## Level Design Checklist

Before shipping any level or room:

- [ ] A new player can navigate it without external help
- [ ] Entry and exit are visually distinct from each other
- [ ] At least one optional path exists with an exploration reward
- [ ] Checkpoint placement is generous — failure sends the player back ≤ 60 seconds
- [ ] Every hazard is visible before it kills (first encounter is a warning, not a punishment)
- [ ] The "optimal route" is discoverable through play without a guide

---

## Onboarding Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Text-wall tutorial | Players skip it entirely | Contextual prompts or teach by doing |
| Unskippable tutorial | Infuriates returning players | Always allow skip; auto-detect returning player |
| Punishing first death | Discourages exploration | Make the first area very forgiving |
| Gating fun behind 20-minute tutorial | Player never reaches the game | Put fun first; tutorial second |
| Teaching everything upfront | Cognitive overload | Just-in-time teaching — introduce mechanics when first needed |
