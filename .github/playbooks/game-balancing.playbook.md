# Game Balancing Playbook

## Purpose

Define how game systems, economy, and difficulty are tuned iteratively — using data, playtesting, and theory to create fair, engaging challenges.

---

## When to Use

- Any milestone that adds or changes numbers (damage, health, speed, cost, drop rate)
- When a playtester reports "too easy", "too hard", or "this is useless"
- When economy systems (currency, crafting, progression) are introduced or modified
- Before any balance changes ship — always validate with data
- When preparing for public release or platform submission

---

## Fundamental Rule: Balance With Data, Not Gut Feel

> Never change a number because it "feels wrong." Find out *why* it feels wrong first.

The balancing sequence:

1. **Establish baselines** — what are the ideal values at each point in progression?
2. **Playtest and measure** — collect data; don't rely on memory
3. **Identify outliers** — what is clearly over- or under-powered?
4. **Make one change at a time** — never change multiple variables simultaneously
5. **Re-test** — confirm the change fixed the problem without creating new ones
6. **Document** — record what changed and why

---

## Balance Spreadsheet

Before implementing any game system with numbers, create a balance spreadsheet:

```
Columns (example for RPG combat):
  Level | Player HP | Enemy HP | Damage/Hit | Hits to Kill | Hits to Die | Time to Kill (seconds)

Row 1 (Level 1):  100 | 40 | 15 | 3 | 7 | 30s
Row 5 (Level 5):  250 | 120 | 35 | 4 | 7 | 30s   ← time to kill should stay roughly constant
Row 10 (Level 10): 500 | 300 | 70 | 5 | 7 | 30s
```

**Rule**: Time-to-kill should remain roughly constant as players level up. Scaling HP and damage together without changing the *experience* is the goal.

---

## Required Steps

### 1. Define Target Values

Before any tuning, define what "correct" looks like:

```markdown
## Balance Targets for [System Name]

**Player kill time**: [Target: how long should it take to kill a standard enemy?]
  Current: ___ Target: ___

**Death frequency**: [How often should an average player die per hour?]
  Current: ___ Target: ___

**Resource drain rate**: [How quickly should the player spend resources?]
  Current: ___ Target: ___

**Option usage spread**: [What % of players should choose each option?]
  Option A: ___% Option B: ___% Option C: ___% (aim for no option >50%)

**Completion rate**: [What % of players should complete this level/encounter?]
  Current: ___% Target: ___%
```

---

### 2. Collect Playtest Data

Track these metrics during every balance playtest session:

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Deaths per level | Count deaths per playthrough | 2–5 for normal difficulty |
| Time to complete | Stopwatch or telemetry | Varies by design intent |
| Resources at level end | Note remaining HP, ammo, currency | > 20% = too easy; < 5% = too hard |
| Options chosen | Track which abilities/weapons players used | No single option > 60% |
| Stuck points | Where did players stop and struggle? | No point > 3 attempts average |

**Minimum sample size**: 5 unique playtesters per balance pass.

---

### 3. Identify and Fix Outliers

**Over-powered (OP) indicators**:
- One option/strategy chosen > 70% of the time
- Players complete encounters without resource expenditure
- Players describe content as "trivial" or "too easy"
- An ability makes other abilities redundant

**Under-powered indicators**:
- An option/strategy never chosen voluntarily
- Players describe a section as "unfair" or "frustrating"
- Death rate > 10 deaths per hour on normal difficulty
- Completion rate < 60% for non-optional content

**Fix order** (prefer this sequence):
1. **Add a counter** to the OP option (creates strategic depth)
2. **Buff the weak options** rather than nerfing the strong one
3. **Adjust costs** (OP option costs more; weak option costs less)
4. **Tune numbers** (last resort — direct nerfs frustrate invested players)

---

### 4. Economy Balancing

For games with currency/crafting/progression economies:

```
Track per playtest session:
  - Currency earned per hour
  - Currency spent per hour
  - Net accumulation rate (earned - spent)
  - Most-purchased items / upgrades
  - Least-purchased items / upgrades
```

**Healthy economy indicators**:
- Net accumulation close to zero over time (earning ≈ spending)
- No single item purchased > 40% of the time
- Players have meaningful choices about what to buy (not always obvious)

**Inflation fix**: Add drains (repair costs, upgrade consumption, consumables)  
**Deflation fix**: Add faucets (more drops, better quest rewards, daily bonuses)

---

### 5. Difficulty Curve Balancing

Plot difficulty over time and compare against the target curve:

```
Target:              Actual (problem):
  D │      ╭─        D │   ╭──────
  i │    ╭─╯         i │ ╭─╯
  f │  ╭─╯           f │╯           ← Difficulty too high at start
  f │╭─╯             f │            ← Missing mid-game escalation
  ──────────         ──────────
     Time               Time
```

**Difficulty adjustments**:
- Too hard early → Add tutorial safety nets; reduce first-area enemy aggression
- Too easy throughout → Increase enemy variety; add elite/miniboss encounters
- Difficulty cliff (sudden spike) → Insert a gradual escalation sequence before the hard part
- No payoff at the end → Ensure final boss is the hardest single encounter

---

## Balance Change Log

Every change must be documented:

```markdown
## Balance Change Log

### [Date] v[X.X]
**System**: Combat — melee weapons
**Problem**: Sword chosen 80% of the time; axe unused
**Data**: 8/10 playtesters never picked up the axe voluntarily
**Change**: Axe damage increased +20%; added Stagger effect on heavy attack
**Expected outcome**: Axe viable vs heavily armoured enemies; creates meaningful choice
**Verified**: [Yes/No — after next playtest]
```

---

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| Nerfing the fun option first | Buff alternatives before touching the popular option |
| "Feels right" tuning without data | Collect 5 playtester sessions before changing any number |
| Changing multiple numbers at once | One change per test cycle — isolate variables |
| Balancing for expert play only | Balance for the median player; add Hard mode for experts |
| Ignoring economy inflation | Add drains every time new faucets are introduced |
| Setting difficulty by developer skill | Developers know the game too well — measure new player data only |
