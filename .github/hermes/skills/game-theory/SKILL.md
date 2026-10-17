---
name: game-theory
description: |
  Formal game theory, player psychology, and game design science for video games. Use this skill when:
  - Designing player incentive structures and motivation systems
  - Applying formal game theory (Nash equilibria, dominant strategies) to multiplayer design
  - Designing competitive game balance using game-theoretic principles
  - Understanding and applying player psychology (intrinsic vs extrinsic motivation, flow state)
  - Designing economy and resource systems grounded in theory
  - Analyzing or resolving dominant strategy problems in a game
  - Designing PvP systems with game-theoretically sound balance
  - Applying prospect theory, loss aversion, or behavioural economics to game design
  - Designing cooperative or social game systems
  - Evaluating whether a game system creates interesting decisions
---

# Game Theory for Game Designers

Formal theory and psychological models applied to video game design.

---

## What Makes a Decision Interesting?

Sid Meier's definition: **"A game is a series of interesting decisions."**

A decision is **interesting** when:
1. Multiple options are viable — no single dominant strategy
2. The player has enough information to reason about outcomes
3. The consequences are meaningful
4. The decision reflects the player's expression of identity or skill

```
Uninteresting decision:  Option A always wins → players learn A, stop deciding
Interesting decision:    Option A wins against B, B wins against C, C wins against A
                         (Rock-Paper-Scissors triangle — the foundation of competitive game balance)
```

---

## Formal Game Theory Concepts

### Dominant Strategy

A strategy that is always the best choice regardless of what opponents do.

```
If players always do X because nothing beats X:
→ X is a dominant strategy
→ The decision space collapses
→ Players stop engaging with other options
```

**Design Response**: Introduce counters, costs, or situational trade-offs to remove dominant strategies.

### Nash Equilibrium

A state where no player can improve their outcome by unilaterally changing strategy.

```
In competitive games: Nash equilibrium ≠ fun
If every player plays "optimally" and no one deviates:
→ The game becomes solved
→ Expression and surprise disappear
→ Skill becomes pure execution, not decision-making
```

**Design Response**: Build games where Nash equilibria are non-obvious, context-dependent, or require predicting opponent psychology — not just computation.

### Zero-Sum vs Non-Zero-Sum

| Type | Definition | Examples |
|------|-----------|---------|
| Zero-sum | One player's gain is another's loss | Chess, fighting games, battle royale |
| Non-zero-sum | All players can gain or all can lose | MMO raids, co-op games, economy-building |
| Positive-sum design | Mechanics that reward cooperation over competition | Diablo loot drops (personal loot), shared XP |

**Design Rule**: Pure zero-sum creates hostile play patterns. Introduce non-zero-sum mechanics to reduce toxicity in competitive games (shared objectives, team rewards).

### Prisoner's Dilemma in Games

Two players independently choosing to cooperate or defect:

```
             Player 2: Cooperate   Player 2: Defect
Player 1: Cooperate    (3, 3)          (0, 5)
Player 1: Defect       (5, 0)          (1, 1)
```

This models every PvP betrayal system, trust economy, or alliance mechanic.

**Design Applications**:
- Trade systems where players can cheat each other
- Alliance mechanics with tempting betrayal rewards
- Faction systems with cooperation and defection outcomes

**Design Rule**: In iterated (repeated) prisoner's dilemma, cooperation emerges naturally. Design repeated interaction to build community; avoid one-shot interactions if you want cooperation.

---

## Player Psychology Models

### Self-Determination Theory (SDT)

Players are intrinsically motivated by three core psychological needs:

| Need | Definition | Design Expression |
|------|-----------|------------------|
| Autonomy | "I am choosing this freely" | Meaningful choices; multiple paths; player expression |
| Competence | "I am getting better" | Skill progression visible; mastery curves; fair challenges |
| Relatedness | "I am connected to others" | Social systems; co-op; shared experiences |

**Design Rule**: Games that satisfy all three create deep intrinsic motivation. Games that rely only on extrinsic rewards (loot, achievements) lose players when rewards stop.

### Flow State (Csikszentmihalyi)

Flow = the state of optimal engagement where challenge matches skill.

```
     Challenge
         │
    High │  Anxiety      │   FLOW ZONE
         │               │
         │               │
    Low  │  Boredom      │
         └───────────────────── Skill
              Low              High
```

**Keeping players in flow**:
- Increase challenge as skill increases (dynamic difficulty)
- Provide clear goals at all times
- Give immediate feedback on every action
- Eliminate unnecessary friction (long menus, unskippable content)
- Remove interruptions (notifications, loading screens in critical moments)

**Anti-patterns that break flow**:
- Suddenly spike difficulty with no warning
- Force players to stop and farm before progressing
- Introduce new complex mechanics too quickly
- Require external knowledge (looking up guides)

### Bartle's Player Types

Four archetypes of what players want from games:

| Type | Motivation | Game Systems They Love |
|------|-----------|----------------------|
| Achievers | Complete goals; earn rewards | Achievement systems, completionism, trophies |
| Explorers | Discover hidden things | Open worlds, secrets, lore, Easter eggs |
| Socializers | Connect with other players | Guilds, chat, co-op, trading |
| Killers | Compete and dominate others | PvP rankings, leaderboards, 1v1 systems |

**Design Rule**: A healthy multiplayer game needs all four types. A game that serves only Killers drives out Socializers and Explorers — the community collapses.

### Prospect Theory & Loss Aversion

Players feel losses ~2× more intensely than equivalent gains.

```
Losing 100 gold feels twice as bad as gaining 100 gold feels good.
```

**Design Applications**:

| Application | Mechanism |
|-------------|-----------|
| Risk/reward framing | "Don't lose your streak" > "Gain a bonus" |
| Permadeath | Loss of a run is more compelling than progress gains |
| Cosmetic stakes | "Don't lose your rare skin" in battle royale |
| Economy design | Scarcity of resources is more motivating than abundance |

**Caution**: Weaponizing loss aversion is predatory design. Dark patterns include:
- Timers that expire purchased items
- Fear-of-missing-out (FOMO) limited offers
- "Protect your progress" mechanics tied to monetization

---

## Economy Design

### Supply and Demand in Game Economies

Every game with tradeable resources has an economy. Unmanaged economies degrade.

```
Inflation spiral:
  Too many resources enter the economy
  → Prices rise
  → Early players are rich; new players cannot afford anything
  → Economy collapses or new players quit
```

**Four economic controls**:

| Control | Function | Example |
|---------|----------|---------|
| Faucet | Resources enter the economy | Enemy drops, quest rewards |
| Drain | Resources leave the economy | Repair costs, crafting consumption, taxes |
| Sink | Desirable way to remove resources | Cosmetics, upgrades that consume materials |
| Cap | Hard limit on accumulation | Inventory limits, carry caps |

**Rule**: Every faucet needs a corresponding drain. Economies without drains inflate and die.

### Progression Economy

For single-player games, the currency isn't money — it's player power and time.

```
Progression curve types:
  Linear:      constant reward per hour → feels predictable; loses urgency
  Logarithmic: fast early, slow late → satisfying early; frustrating late
  Exponential: slow early, fast late → unsatisfying early; power fantasies late
  Oscillating: mix of fast and slow → best for long games; creates peaks and valleys
```

**Design Rule**: Single-player economies should use **oscillating progression** — periods of fast reward followed by consolidation before the next burst.

---

## Competitive Balance Principles

### Degenerate Strategies

A strategy that trivialises the game:

```
Detection → Analyse win rates / usage rates
If one option is chosen >60–70% of the time → it's likely degenerate
```

**Fixing degenerate strategies**:
1. **Add a counter** — introduce something that beats the dominant strategy
2. **Add a cost** — make the strategy more expensive or risky
3. **Add a context** — make the strategy only dominant in specific situations
4. **Nerf** — reduce the strength of the option (last resort; frustrates invested players)

### Asymmetric Balance

Different factions/characters/roles with different strengths that balance at a meta level.

```
Faction A: High offense, low defence
Faction B: Medium offense, medium defence
Faction C: Low offense, high defence
→ No faction dominates all situations
```

**Design Rule**: Asymmetric balance is more interesting than symmetric balance but harder to achieve. Use **win rate data** from playtesting to iteratively tune.

### Rock-Paper-Scissors Triangles

The fundamental unit of interesting competitive interaction:

```
Cavalry → beats → Infantry
Infantry → beats → Archers
Archers → beats → Cavalry
```

Every competitive system should have at least one complete RPS triangle. Stack multiple triangles for deeper strategy.

---

## Social Game Design

### Network Effects

A game becomes more valuable as more players join.

```
Metcalfe's Law: network value ∝ n²
```

**Design implications**:
- Onboard players in groups (friend referral > solo acquisition)
- Create social infrastructure before players arrive (guilds, chat, clans)
- Make social connections visible in UI (friend activity feeds)

### Anti-Churn Mechanics

Retention is a game design problem, not just a marketing problem.

| Mechanic | Psychological Basis | Example |
|----------|--------------------|---------| 
| Daily login reward | Variable ratio reinforcement | Daily bonus chest |
| Social obligation | Relatedness (SDT) | Guild events; friend obligations |
| Cliffhanger endings | Zeigarnik effect (unfinished = memorable) | "Return tomorrow to see what happens" |
| Investment hook | Sunk cost + ownership | Named character; customised base |
| Progress bar | Goal gradient effect (closer = faster) | XP bar nearly full |

**Caution**: Anti-churn mechanics that exploit psychology at the expense of player wellbeing are dark patterns. Design for retention through genuine value, not manipulation.

---

## Making Systems, Not Stories

> Design the system; let players create the stories.

The most memorable game moments are **emergent** — not scripted.

```
Scripted:   Player watches a cutscene of a betrayal
Emergent:   Player chose to trust an ally who had reasons to betray them
            → The betrayal means more because the player caused it
```

**Design for emergence**:
- Give systems properties that interact in unexpected ways
- Give players information asymmetry (not everyone knows the same things)
- Create conditions where multiple rational actors pursue competing goals
- Accept that players will find unintended interactions — embrace the best ones

---

## Ethical Design Checklist

- [ ] Does the game respect the player's time? (are sessions reasonably completable?)
- [ ] Are monetisation mechanics transparent and non-predatory?
- [ ] Does the game avoid exploiting loss aversion as a monetisation lever?
- [ ] Are random reward systems (loot boxes) disclosed as probabilistic?
- [ ] Does the game avoid exploiting compulsive loops in harmful ways?
- [ ] Is the game appropriate for its target age group?
- [ ] Does difficulty exist to create challenge and expression, not frustration and whales?
