# Game Testing Playbook

## Purpose

Define how game code and game experience are tested — covering both automated logic tests and structured playtest sessions.

---

## When to Use

- Any milestone that adds a game system (combat, movement, inventory, AI, save/load)
- Any milestone that changes game balance or tuning values
- Before any platform submission or public release
- When a bug is reported — always add a regression test

---

## Two Types of Testing

```
Automated Tests               Playtest Sessions
──────────────────            ──────────────────────
Fast, repeatable              Human-driven, qualitative
Game logic correctness        Fun, clarity, game feel
Run on every commit           Run after every milestone
```

Both are required. Neither replaces the other.

---

## Automated Testing

### What to Test Automatically

| System | Test |
|--------|------|
| Damage calculation | Input: 100 HP, 30 damage → Output: 70 HP |
| Armour / resistance | Armoured enemy takes reduced damage per formula |
| Inventory math | Add 5 items, remove 3 → count is 2 |
| State machine transitions | Enemy in Idle + player nearby → transitions to Chase |
| Save / load | Save state, reload, restore → all values match exactly |
| Loot tables | Drop probability distribution matches configured weights |
| Economy formulas | Level 5 upgrade cost matches the progression formula |
| Spawn logic | Correct enemy types spawn at correct wave number |

### What NOT to Automate at Unit Level

- Visual correctness (use screenshot regression tests sparingly)
- Physics simulation outcomes (non-deterministic across platforms)
- Player "feel" (subjective — belongs in playtest sessions)
- Animation blending

### Test Naming

Use the pattern: `Test_<System>_<Condition>_<ExpectedResult>`

Examples:
- `Test_DamageSystem_ArmoredEnemy_DamageReducedByArmor`
- `Test_Inventory_AddItemWhenFull_ReturnsFalseAndInventoryUnchanged`
- `Test_SaveLoad_AllPlayerStats_RestoredExactlyAfterLoad`
- `Test_EnemyFSM_PlayerEntersRange_TransitionsFromIdleToChase`

### Frame Budget Tests

For performance-critical systems, assert that operations complete within the target frame time:

```csharp
// Pseudocode — adapt to your test framework and engine
void Test_EnemySpawn_100Enemies_AverageFrameTimeUnder16ms() {
    // Arrange
    SpawnEnemies(count: 100);

    // Act
    float totalTime = RunSimulationFrames(frameCount: 10);

    // Assert
    float avgFrameTime = totalTime / 10f;
    Assert(avgFrameTime < 16f, $"Average frame time was {avgFrameTime}ms — exceeds 16ms budget");
}
```

---

## Playtest Sessions

### Structured Playtest (New Feature)

| Step | Action |
|------|--------|
| Goal | Does the feature work as intended? Is it fun? |
| Setup | One or more testers who have not seen the feature before |
| Protocol | Do not explain how the feature works; do not assist; observe and take notes |
| Duration | 15–30 minutes per session |
| Output | Written feedback list tagged by severity: Blocker / Major / Minor / Polish |

### Regression Playtest (Before Release)

Complete playthrough of all content. Covers:

- [ ] All levels completable without soft-locks
- [ ] All UI correct and fully localized
- [ ] Save / load works at all save points
- [ ] Platform input: all target controllers / input methods work correctly
- [ ] Performance: no sustained frame rate drops below the target (e.g. 30 fps / 60 fps)
- [ ] Audio: no missing sounds, no audio clipping, correct volume mix

---

## Platform Certification Checklist

Before submission to any platform store:

- [ ] No crashes during standard play sessions
- [ ] No hangs or unresponsive states
- [ ] Save data: corruption recovery handled gracefully
- [ ] Age rating content reviewed
- [ ] Accessibility: subtitles, colourblind modes, remappable controls (check platform certification requirements)
- [ ] Network: offline mode works for single-player content
- [ ] Performance: passes on the minimum-spec target hardware

---

## Regression Policy

Every shipped bug must have a test:

1. Reproduce the bug → write a failing test that captures it
2. Fix the bug → test passes
3. The test stays in the suite permanently — never ship the same bug twice

---

## Anti-Patterns

| Anti-pattern | Risk | Fix |
|---|---|---|
| Only playtesting with developers | Developers know too much — blind to new-player confusion | Always use non-developer testers |
| Testing only happy paths | Edge cases ship as bugs | Explicitly test invalid inputs and boundary states |
| No save/load test | Data corruption discovered on launch day | Always include save/load in automated tests and regression playtest |
| Skipping regression after balance change | A balance "fix" silently breaks other systems | Automated tests for all economy, combat, and spawn formulas |
| Testing on only one device | Platform-specific bugs missed | Test on lowest-spec and highest-spec target hardware before submission |
| Manual-only testing | Regressions slip through | Automate all deterministic logic; reserve manual sessions for feel and usability |
