# Game Level Design Playbook

## Purpose

Define how game levels are planned, greyboxed, iterated, and polished — ensuring every space is functional before it is beautiful.

---

## When to Use

- Any milestone that introduces a new level, zone, area, or map
- When designing encounter layouts or combat arenas
- When reviewing a level for flow, clarity, or pacing problems
- Before any art passes on a level — layout must be signed off first

---

## Fundamental Rule: Function Before Form

> **Never art-up a level that hasn't been greenlighted in greybox.**

The level design sequence is non-negotiable:

1. **Paper map** — sketch intent on paper or whiteboard
2. **Greybox / blockout** — simple geometry; no textures; fully playable
3. **Playtest blockout** — play and watch others play; fix flow problems
4. **Encounter design** — place enemies, resources, and checkpoints
5. **Narrative dressing** — environmental storytelling, props, lighting
6. **Art pass** — textures, models, polish
7. **Final playtest** — full playthrough with all systems active

---

## Required Steps

### 1. Paper Map

Define the level's intent before opening the editor:

```markdown
## Level: [Name]

**Player entry point**: [Where the player starts; what they see first]
**Exit / Goal**: [What the player must reach or accomplish]
**Main path**: [Brief description of the golden path]
**Optional paths**: [What side routes exist and what they reward]

**Mechanics introduced**: [Any new mechanic first appearing here]
**Mechanics tested**: [Existing mechanics challenged here]

**Narrative beat**: [What story moment happens in this level?]
**Mood / tone**: [How should this space feel?]

**Enemy types**: [What enemies appear here and where?]
**Key encounters**: [Name the 2–3 major encounters]
```

---

### 2. Greybox / Blockout

Build the level with primitive shapes only — boxes, ramps, cylinders.

**Greybox acceptance criteria**:
- [ ] The golden path is walkable start to finish
- [ ] All optional paths are accessible and lead somewhere
- [ ] Navigation is intuitive — a new player moves in the right direction without a marker
- [ ] All encounters are positioned and functional (enemies placed, even if placeholder)
- [ ] There are no fall-through geometry issues, no stuck points
- [ ] The level is beatable in greybox form

**Do not proceed to Step 3 until all greybox criteria pass.**

---

### 3. Playtest the Blockout

Watch at least **two people who have not designed the level** play through it.

**Observation rules**:
- Do not tell them where to go — observe without helping
- Note exactly where they get confused, stuck, or turn back
- Note where they find something delightful or satisfying unprompted
- Note where they ignore content you intended them to find

**Playtest issues and fixes**:

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Player circles in a hub and doesn't progress | Lack of clear destination | Add a visible landmark; change lighting to highlight the exit |
| Player finds the optional path first, then feels lost | Optional path is more prominent than golden path | Narrow optional entry; widen golden path |
| Player skips an encounter by walking around it | Encounter is optional when it shouldn't be | Gate the path; funnel through encounter |
| Player dies in a tutorial moment | Stakes too high in teaching zone | Move encounter earlier; add checkpoint; reduce enemy aggression |
| Player reaches the exit without finding the optional reward | Reward is not visible from the path | Move reward to a visible location on the path edge |

---

### 4. Encounter Design

For every combat or challenge encounter in the level:

```markdown
## Encounter: [Name]

**Location**: [Arena / room description]
**Intent**: [What does this encounter teach or test?]
**Enemy composition**: 
  - [Enemy type] × [count] — [role: flanker / tank / sniper]
**Player resources**: [Health pickup location and rationale]
**Escape routes**: [How many exits from the arena?]
**Cover positions**: [How many cover spots and where?]
**Elevation**: [Is there high ground? Who controls it at start?]
**Victory condition**: [What ends the encounter?]
```

---

### 5. Pacing Map

Plot the level's pacing to ensure it has a dramatic arc:

```
Plot challenge level over time (0 = min, 10 = max):

  Combat  │
  Tension │   4    7    5    9    3
  (0-10)  │___↗____↗____↘____↗____↘___
  ─────────────────────────────────────
  Progress  Entry  Mid  Breather  Peak  Exit
```

**Rules**:
- Peak challenge must be before the last 20% of the level
- Every peak (7+) must be followed by a breather (3 or below)
- The level should end at moderate tension (not at maximum — that's the boss)

---

### 6. Environmental Storytelling Dressing

After encounters are verified, add environmental narrative:

```markdown
## Narrative Dressing Checklist

For this level:
- [ ] Entry area establishes the tone visually within the first 10 seconds
- [ ] At least one "readable" scene (staged props telling a story without words)
- [ ] At least one visible landmark usable for navigation
- [ ] Resources (health/ammo) placed logically for the fiction, not just gameplay
- [ ] At least one discoverable detail that rewards curious players
```

---

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| Art pass before layout is signed off | Block art work until greybox playtest passes |
| Symmetrical encounter arenas | Asymmetry creates interest; make cover and sightlines unequal |
| Optional content with no visible hook | Hint at the reward from the main path (sound, light, glimpse) |
| Corridor with no navigation aid | Add a window, light source, or sound cue pointing forward |
| Two major encounters back-to-back | Insert a breather space (open area, collectible, scenic vista) |
| Invisible tutorial (player doesn't know a mechanic exists) | Bring mechanic requirements into player sight before requiring them |
