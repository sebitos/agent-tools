---
name: game-level-design
description: |
  Level design, environment design, and spatial storytelling for video games. Use this skill when:
  - Designing a level layout, dungeon, map, or playable space
  - Structuring player flow and navigation through an environment
  - Teaching mechanics through level design (without text tutorials)
  - Designing combat arenas, encounter spaces, or challenge rooms
  - Creating open-world zones, hub areas, or linear corridors
  - Planning enemy placement, obstacle layout, and resource distribution
  - Designing set-pieces, vistas, and memorable landmarks
  - Balancing exploration rewards vs main path clarity
  - Creating spatial narrative and environmental storytelling through level design
  - Reviewing or critiquing a level layout for flow, clarity, and pacing
---

# Game Level Design

Principles and patterns for designing spaces that teach, challenge, and delight players.

---

## Core Principle: Space is Gameplay

> Every room tells the player what to do next.
> Every path is a question. Every door is a promise.

Level design is game design expressed spatially. The best levels:
- Teach without text
- Reward exploration without punishing the main path
- Create memorable set-pieces burned into player memory
- Tell stories through geometry, not words

---

## The Three Functions of Every Space

Every room, area, or zone should fulfil at least one function:

| Function | Purpose | Design Focus |
|----------|---------|--------------|
| Teaching | Introduce a mechanic or establish a rule | Safety; low stakes; clear feedback |
| Challenging | Test player mastery of a mechanic | Stakes; difficulty; expression |
| Rewarding | Give the player something valuable | Curiosity payoff; emotional beat; upgrade |

**Rule**: Opening areas should teach. Middle areas should challenge. End areas should reward.

---

## Player Flow

### The Golden Path

Every level needs a **golden path** — the intended route a typical player follows.

```
Landmark → Landmark → Landmark → Goal
```

- Landmarks are visually dominant elements that pull the player forward
- The golden path should be navigable by intuition — no map needed
- Side paths diverge from the golden path and always reconnect

### Flow Architecture Patterns

**Linear Corridor**
```
Start → A → B → C → End
```
Best for: narrative games, cinematic experiences, tutorial sequences

**Branching Path**
```
Start → A → (B or C) → D → End
```
Best for: choice-based games, different playstyle routes

**Hub and Spoke**
```
         ┌─ Zone A
Hub ─────┼─ Zone B
         └─ Zone C
```
Best for: open world, RPG, metroidvania post-unlock return

**Figure-8 Loop**
```
Start → A → B
         ↗    ↘
        C      D
         ↖    ↗
          E ←
```
Best for: interconnected worlds; lets players revisit areas from different angles

### Navigation Heuristics

Players navigate by:
1. **Light** — bright areas attract; dark areas repel
2. **Openings** — gaps, doors, and arches draw the eye forward
3. **Height** — elevated areas signal vistas and destinations
4. **Colour** — warm colours advance; cool colours recede
5. **Sound** — music or ambient audio leads players toward objectives
6. **Enemy placement** — enemies mark that you're on the right path

---

## Teaching Through Level Design

### The Super Mario Method

Introduce every mechanic in **safety** before testing it under **pressure**.

```
Stage 1: Introduce (safe)
  → Place a pit in the open; no enemies; player can see it clearly
  → Player understands: "there are pits that kill me"

Stage 2: Apply (moderate stakes)
  → Place a pit with a slow, predictable enemy nearby
  → Player must combine knowledge: "time my jump, avoid enemy"

Stage 3: Test (full pressure)
  → Multiple pits, fast enemies, tight timing
  → Player demonstrates mastery
```

### Mechanic Introduction Checklist

- [ ] Is this the first time the player sees this mechanic?
- [ ] Is the introduction area forgiving (no death consequence if they fail)?
- [ ] Is the mechanic isolated from other new mechanics for this scene?
- [ ] Does the environment visually communicate what the mechanic is?
- [ ] Is there a subtle reward for engaging correctly on the first try?

---

## Combat Encounter Design

### Arena Anatomy

Every combat encounter needs:

```yaml
arena:
  size: medium (enough space to move, small enough to feel pressure)
  cover:
    - 3-4 solid cover positions
    - at least 1 elevated position (rewards mobility)
  entry_exit: 2 entry/exit points (avoid cul-de-sac traps)
  resources:
    - ammo/health pickup in visible but contested location
  choke_points: 1-2 (forces engagement; creates drama)
  sight_lines: mix of open and covered (supports multiple playstyles)
```

### Enemy Placement Principles

- **Surprise**: 1 in 4 enemies positioned where the player won't expect them
- **Threat gradient**: weak enemies in front, strong enemies at the back (pull player into danger)
- **Patrol logic**: enemy patrol routes should feel purposeful, not random
- **Density**: avoid enemy clumps — spread them to require movement and positioning

### Encounter Pacing

```
Encounter rhythm per level:
  Breather → Standard → Standard → Elite → Breather → Boss

Each "Breather" = a space with no enemies where the player can observe, collect, and plan
```

**Rule**: Never place two elite or boss-level encounters without a breather between them.

---

## Environmental Storytelling Through Level Design

### The Scene Composition Checklist

A well-designed narrative space:
- [ ] Has a clear focal point the camera/player eye moves toward
- [ ] Uses scale to communicate power relationships (large villain lair, cramped refugee camp)
- [ ] Uses debris, objects, and props to tell what happened here
- [ ] Has at least one discoverable detail that rewards the curious player
- [ ] Is consistent with the established fiction of the world

### Spatial Narrative Techniques

| Technique | Implementation |
|-----------|----------------|
| Before/After | Show ruins of what was before adjacent to what exists now |
| Scale contrast | Giant architecture dwarfs the player → conveys oppression |
| Lived-in detail | Dirty dishes, unfinished letters, personal items → someone lived here |
| Staged tragedy | Skeleton reaching toward a locked door → tells a story without words |
| Functional inconsistency | A church with bloodstains → something is very wrong here |

---

## Open World Design

### Zone Structure

```
Zone Hierarchy:
  Region → District → Landmark → Point of Interest (POI)
```

Each level of hierarchy should be visually distinct — a player should know which **Region** they're in by look alone.

### Density Mapping

Plot content density as a heat map:

```
Dense (core area)   → Quests, shops, services, NPCs, story content
Medium (transitional) → Roaming enemies, resource nodes, scattered POIs
Sparse (wilderness)   → Exploration rewards, hidden lore, rare encounters
```

**Rule**: Sparse areas must have enough reward density to justify travel — at least one discovery per 2 minutes of movement.

### Open World Readability

- Every area of interest should have a **visible landmark** readable from a distance
- Players should be able to see 2–3 potential destinations at any time
- The world should communicate faction territory visually (architecture, colours, signage)
- Fast travel should be unlocked through exploration, not given for free

---

## Pacing and Level Arc

Every level has a **dramatic arc** regardless of genre:

```
Entry (establish)
  ↓
Rising action (escalate challenge + interest)
  ↓
Peak (climax — most intense moment)
  ↓
Resolution (small breather before exit or next level)
```

### Pacing Tools

| Tool | Effect |
|------|--------|
| Enemy density | High = intense; low = relief |
| Music tempo | Fast = urgency; slow = exploration |
| Ceiling height | Low = claustrophobic; high = grandeur |
| Lighting | Dark = fear; bright = safety |
| Corridor width | Narrow = focused; wide = freedom |
| Verticality | High elevation = vulnerability; cover = safety |

---

## Level Design Review Checklist

Before a level ships:

**Flow**
- [ ] Can a new player navigate without the map in the first 3 minutes?
- [ ] Are all dead ends signed as dead ends (reward inside, or visual cue to turn back)?
- [ ] Does the level have at least one memorable vista or wow moment?

**Teaching**
- [ ] Is every new mechanic introduced safely before it is tested?
- [ ] Are the stakes of the first encounter forgiving enough to fail and retry?

**Pacing**
- [ ] Is there a breather after every major encounter?
- [ ] Does the level escalate challenge over its length?
- [ ] Does the level end at a point of narrative or gameplay resolution?

**Polish**
- [ ] Is lighting used to guide navigation?
- [ ] Are resources (health, ammo) placed in fair but contested locations?
- [ ] Does the space feel lived-in and purposeful, not empty?
