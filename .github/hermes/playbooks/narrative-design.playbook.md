# Narrative Design Playbook

## Purpose

Define how story, dialogue, and world-building are planned, written, and integrated into game development milestones — ensuring narrative serves and enhances gameplay at every stage.

---

## When to Use

- Any milestone that introduces story content, dialogue, or world-building
- When writing quest scripts, NPC dialogue, or cutscene direction
- When designing branching narrative systems or conversation trees
- When reviewing a game for ludonarrative dissonance
- Before writing a word of in-game text — establish the narrative framework first

---

## Fundamental Rule: Story Emerges From Play

> Story is what happens *because* of the player's actions, not despite them.

The narrative design sequence:

1. **Establish the world** — rules, factions, history, stakes
2. **Define character motivations** — everyone wants something
3. **Create gameplay-narrative alignment** — mechanics reinforce themes
4. **Write content** — dialogue, quests, environmental stories
5. **Integrate and test** — play through with story intent; find breaks

---

## Required Steps

### 1. Narrative Pillars

Before any writing, define the game's narrative pillars:

```
Theme:        What does this game say about the human condition?
              Example: "Power corrupts even those who seek it for good reasons"

Tone:         What emotional register does this game live in?
              Example: "Dark but hopeful — like late Tolkien"

Player Arc:   How does the player's character change?
              Example: "Stranger → Reluctant protector → Willing sacrifice"

World Truth:  What is the central truth of this world's lore?
              Example: "The gods left because humans chose to forget them"
```

**Acceptance criteria** — pillars are complete when every team member can answer:
"Is this quest/dialogue/scene consistent with our narrative pillars?"

---

### 2. World Bible

A world bible is the canonical reference for all narrative decisions.

**Minimum world bible contents**:

```markdown
## World Name
### Cosmology
- Origins of the world
- Fundamental rules (magic, technology, physics exceptions)

### History (5–10 key events)
- [Year] Event name — what happened and why it matters today

### Factions (2–6 active factions)
- Name, goal, belief, relationship to player

### Geography (key regions)
- Name, character, who lives there, what happens there

### Languages / Communication
- How do people communicate? Any translation mechanics?

### Economy
- What has value and why?

### Key Characters
- Name, role, motivation, secret, arc
```

**Rule**: The world bible grows during development. Every new writer must read it before contributing a line.

---

### 3. Quest Scripts

Write quests using the quest anatomy template:

```markdown
## Quest: [Name]

**Hook**: [Why does the player care? What question does this answer?]
**Goal**: [What must the player accomplish?]
**Conflict**: [What complicates it?]
**Resolution options**: [What choices exist and what are their consequences?]

### Rewards
- Mechanical: [New ability, item, shortcut, crafting recipe]
- Narrative: [What changes in the world? What does the player learn?]

### Dialogue Beats
1. Introduction — [NPC introduces the situation]
2. Complication reveal — [Player discovers the truth is more complex]
3. Decision point — [Player must choose]
4. Resolution — [NPC reacts to player's choice]

### Lore Opportunities
- [Environmental detail that hints at backstory]
- [Optional readable that expands the theme]
```

---

### 4. Dialogue Scripting

Write dialogue after quests are designed — never before.

**Dialogue script format**:

```
[SCENE: Market square. Daytime. Merchant ELARA stands behind her stall.]

ELARA
"You're the one they're calling the Hollow? 
(beat)
You don't look like a ghost to me."

    [CHOICE A — TONE: Curious]
    PLAYER: "What do they say about me?"
    
    [CHOICE B — TONE: Dismissive]  
    PLAYER: "I don't care what they say."
    
    [CHOICE C — TONE: Threatening]
    PLAYER: "Keep talking and you'll find out."

[IF CHOICE A]
ELARA
"That you died and came back wrong. 
That everything you touch turns to ash.
(pause — she studies you)
Though your coin spends fine."

[IF CHOICE B / C — RELATIONSHIP: -1]
ELARA
"Right. Business then. What do you need?"
```

**Dialogue review checklist**:
- [ ] Every line reveals character or advances the scene
- [ ] Player choices are labelled by tone/intent, not exact words
- [ ] All choices are completable — no "wrong" answer blocks progress
- [ ] Subtext exists — what is *not* said matters as much as what is

---

### 5. Playtest Narrative Integration

After implementing dialogue/quest content, test specifically for narrative:

**Narrative playtest checklist**:
- [ ] Does the story beat land without prior knowledge of the world bible?
- [ ] Do the player's choices feel like they matter?
- [ ] Does the NPC's reaction match what the player expected?
- [ ] Does the narrative moment support or interrupt the core gameplay loop?
- [ ] Can a player who skips all optional dialogue still follow the main story?

---

## Narrative-Gameplay Integration Rules

| Gameplay moment | Narrative opportunity |
|-----------------|----------------------|
| Tutorial / first area | Establish the world's normal; introduce the inciting incident |
| First major combat | Character under pressure reveals who they really are |
| First major death (NPC) | Raise stakes; make consequences real |
| Midpoint twist | Reframe what the player thought they knew |
| Final area | No new mechanics — full expression of character and theme |
| Post-credits / epilogue | Show consequences of player choices; resolve outstanding hooks |

---

## Anti-Patterns to Avoid

| Anti-pattern | Fix |
|-------------|-----|
| Exposition dumps in dialogue | Spread lore across multiple conversations and environmental details |
| NPCs only exist for quests | Give every named NPC opinions, a life, and reactions to world events |
| Choices with identical outcomes | If all roads lead to the same place, cut options to one |
| Preachy theme delivery | Characters *embody* the theme through actions; never state it aloud |
| Long unskippable cutscenes | Cap at 90 seconds; return player control on a moment of tension |
| Retconning established lore | Track all lore in the world bible; flag contradictions before shipping |
