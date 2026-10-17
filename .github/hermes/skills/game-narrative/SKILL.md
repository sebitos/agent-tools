---
name: game-narrative
description: |
  Game narrative design, interactive storytelling, and game writing. Use this skill when:
  - Writing or designing a game's story, world, or lore
  - Designing branching dialogue systems or choice architectures
  - Building quest or mission structures (main story, side quests, hidden quests)
  - Creating character arcs, motivations, and relationships
  - Writing NPC dialogue, barks, environmental text, or in-world documents
  - Designing non-linear narrative structures (hub worlds, anthology arcs)
  - Reviewing ludonarrative harmony or dissonance in a design
  - Structuring narrative delivery (cutscenes vs environmental storytelling vs audio logs)
  - World-building: factions, histories, geography, cultures
  - Designing onboarding narrative that teaches mechanics through story
---

# Game Narrative Design

Patterns and techniques for building interactive stories that are inseparable from gameplay.

---

## Core Principle: Story Serves Play

> **Gameplay is the story.** Cutscenes and dialogue are support, not the delivery vehicle.

The best game stories are ones that could only work as games — the player's *actions* are the narrative.

| Delivery Method | When to Use |
|-----------------|-------------|
| Environmental storytelling | Background lore, world texture, optional depth |
| NPC dialogue / barks | Moment-to-moment context, personality |
| Audio logs / readable items | Optional lore for curious players |
| Cutscenes | Major story beats only (max 3–5 minutes per major beat) |
| Gameplay itself | Character relationships, themes, player identity |

**Rule**: If removing the cutscene breaks the story but removing the gameplay doesn't — the design is wrong.

---

## Narrative Structure Models

### Three-Act Structure (Linear Games)

```
Act 1 — Ordinary World → Inciting Incident → Call to Adventure
Act 2 — Rising Stakes → Midpoint Twist → Dark Night of the Soul
Act 3 — Climax → Resolution → New Equilibrium
```

Map acts to game progression milestones:
- Act 1 = Tutorial zone through first major ability unlock
- Act 2 = Main campaign (longest section; most mechanics introduced)
- Act 3 = Final area, no new mechanics, full expression of player mastery

### Non-Linear / Hub Structure

```
Central Hub
  ├── Branch A (can complete independently)
  ├── Branch B (can complete independently)
  ├── Branch C (requires A or B complete)
  └── End Gate (requires all branches)
```

**Rule**: Every branch must be completable in isolation — never require the player to have done another branch first unless explicitly gated and signalled.

### Branching Dialogue (Choice Architecture)

```
                    [Player Choice]
                   /        |        \
             Option A    Option B    Option C
               (kind)    (neutral)   (hostile)
                 \          |          /
                  [Consequence State]
                  /                  \
          Short term              Long term
       (NPC reacts now)       (faction change)
```

**Four types of choice** — every choice should be one of:

| Type | Effect | Example |
|------|--------|---------|
| Tone | Changes relationship/tone only | "I understand" vs "I don't care" |
| Tactical | Affects how a scene plays out | "Storm the gate" vs "Sneak in" |
| Narrative | Changes story branch or outcome | Spare vs kill a character |
| World-state | Changes the game world permanently | Save village vs sacrifice village |

**Design Rules**:
- Make consequences visible within 1–2 scenes (not chapters later)
- Never present a "wrong" choice that breaks the game — all paths must be completable
- Signal that a choice is irreversible before the player commits (e.g., "This is your last chance to…")
- Avoid false choices — if all options lead to the same outcome, cut options to one

---

## Quest Design

### Quest Anatomy

Every quest needs:

```yaml
quest:
  name: The Broken Bridge
  hook: "Who is destroying the bridges and why?"
  goal: Find and stop the saboteur
  conflict: The saboteur is a local you trust
  resolution: Choices — turn them in, cover for them, or help them
  reward:
    mechanical: New shortcut route unlocked
    narrative: Faction trust shifts; optional follow-up quest
```

### Quest Pacing Formula

```
Setup (10%) → Exploration / Investigation (50%) → Confrontation (30%) → Resolution (10%)
```

### Quest Types

| Type | Function | Design Focus |
|------|----------|--------------|
| Main quest | Drives narrative forward | Emotional beats; introduce new story elements |
| Side quest | Worldbuilding + character depth | One focused theme; self-contained |
| Faction quest | Develop faction identity | Show faction values through actions, not words |
| Hidden / environmental | Reward curiosity | No map marker; found by exploration |
| Radiant / repeatable | Player expression + economy | Short, satisfying loop; no story investment |

**Rule**: Every named NPC with a quest should have a life beyond the quest — comment on world events, react to what the player did.

---

## Character Writing

### Character Pillars

Define three pillars for every major character:

```
Character: Marcus Vane (villain)
1. Core motivation: Fear of powerlessness
2. Contradiction: Believes he is protecting his people
3. Change arc: Recognises his fear has made him the monster he fought
```

### NPC Voice Rules

- Every NPC should have **one distinguishing speech pattern** (verbose vs clipped, formal vs slang, optimist vs cynic)
- NPCs react to the player's **actions**, not just their presence
- Avoid "quest giver syndrome" — NPC exists only to hand out tasks; give them opinions, history, reactions

### Dialogue Writing Checklist

- [ ] Does every line reveal character or advance story? (cut if neither)
- [ ] Is the subtext different from the text? (what they say vs what they mean)
- [ ] Would a player skip this on a second playthrough? (if yes, shorten it)
- [ ] Does the player have agency within this conversation?
- [ ] Are options labelled by tone, not by exact words? (let the writer fill in the line)

---

## Environmental Storytelling

Tell stories through objects, spaces, and layouts — not words.

### Techniques

| Technique | Example |
|-----------|---------|
| Residue | Empty children's shoes next to a collapsed building |
| Contrast | Lavish throne room directly above a prison |
| Staging | Two skeletons reaching toward each other across a gap |
| Documents | A journal entry that stops mid-sentence |
| Interactable props | A locket you can pick up and examine |

### Environmental Story Checklist

- [ ] Can a player understand the story beat without reading any text?
- [ ] Is the scene composition directing the eye to the key story element?
- [ ] Does it reward curiosity but not punish players who skip it?
- [ ] Is it consistent with established world lore?

---

## Ludonarrative Harmony

Ludonarrative **harmony**: the mechanics and story reinforce the same theme.
Ludonarrative **dissonance**: the mechanics contradict the story.

### Examples

| Game | Mechanic | Story | Result |
|------|----------|-------|--------|
| Journey | Silent; can only chirp | Transcendent spiritual voyage | Harmony |
| Spec Ops: The Line | Shooting feels bad; slow; brutal | War is not heroic | Harmony |
| Dishonored | "Ghost" achievement; kills are permanent | Morality system tracks violence | Harmony |
| Classic RPG hero | Kills 10,000 enemies | "Hero of peace" cutscene | Dissonance |

**Design Rule**: Before adding a mechanic, ask — "Does this reinforce what the story is *about*?"

---

## World-Building Framework

### Four-Layer Model

```
Layer 1: Cosmology  — Origins, gods, creation myths, fundamental rules of existence
Layer 2: History    — Major events, wars, empires, disasters that shaped the present
Layer 3: Culture    — Factions, religions, customs, economies, social structures
Layer 4: Personal   — Individual stories, local conflicts, specific people and places
```

**Rule**: Build all four layers, but deliver mostly **Layer 4** to the player. Layers 1–3 inform the world; Layer 4 is what they experience.

### Iceberg Principle

> 90% of world-building should never appear in the game directly.

The depth of the world is *felt* through consistency, not exposition. Every NPC should know things the player doesn't — the world existed before the player arrived.

---

## Narrative Delivery Formats

### Cutscene Guidelines

- Maximum **90 seconds** for a scene; break longer beats into multiple scenes separated by gameplay
- Player must retain agency at least every **5 minutes** of consecutive non-interactive content
- End every cutscene by restoring player control at a point of dramatic tension, not resolution
- Use cutscenes to show, not explain — **no monologue exposition dumps**

### Audio Log / Readable Design

- Self-contained — tells a story in 100–300 words
- Ends on an emotional note, not an informational one
- Written in character voice, not wiki-style
- Optional — never put critical game info in skippable logs

### Bark System

Barks = short, context-triggered lines ("Found the intruder!", "Almost got him!")

```yaml
bark_trigger: player_spotted
lines:
  - "There! Don't let them escape!"
  - "Intruder! Sound the alarm!"
  - "Hey — you're not supposed to be here!"
priority: high
cooldown_seconds: 8
max_plays_per_session: 3
```

**Rules**:
- 5–10 lines minimum per trigger to avoid repetition fatigue
- Set cooldown to prevent the same line playing twice in quick succession
- Barks should reflect faction personality — a bandit sounds different from a palace guard

---

## Common Narrative Mistakes

| Mistake | Fix |
|---------|-----|
| Telling, not showing | Replace dialogue exposition with a gameplay moment that demonstrates the same thing |
| Undercutting stakes with humour | Reserve comedy relief for *after* a tense scene resolves, not during |
| Saving companions who can die | Let characters die; permanent consequences make choices feel real |
| The player is a passive spectator | Give players at least one decision per major story beat |
| Villain with no motivation | Give the villain a goal the player can understand, even if they oppose it |
| Preachy theme delivery | Embody the theme in gameplay; don't have characters say the theme aloud |
