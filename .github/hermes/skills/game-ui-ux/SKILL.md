---
name: game-ui-ux
description: |
  Game UI/UX design and implementation patterns. Use this skill when:
  - Designing HUD (heads-up display) elements for player information
  - Implementing game menus (main menu, pause menu, settings, inventory)
  - Designing UI feedback systems (damage numbers, tooltips, notifications)
  - Creating accessible game UI (colour blindness, font size, input remapping)
  - Implementing diegetic vs non-diegetic UI (in-world vs overlay)
  - Designing inventory, equipment, skill tree, or map interfaces
  - Reviewing UI clarity, readability, and information hierarchy
  - Implementing controller-friendly UI navigation
  - Designing onboarding and tutorial UI without hand-holding
  - Reviewing or critiquing a game's user experience
---

# Game UI/UX Design

Patterns and principles for creating game interfaces that inform without interrupting.

---

## Core Principle: UI Should Disappear

> The best game UI is the one the player stops thinking about.

Game UI competes with the game world for attention. Every UI element should earn its place.

**Three questions before adding any UI element**:
1. Is this information the player **needs right now**?
2. Can this information be communicated through **gameplay or the world** instead?
3. Will this element **interrupt the player's attention** from the core experience?

---

## UI Categories

### Diegetic vs Non-Diegetic

| Type | Definition | Example |
|------|-----------|---------|
| **Diegetic** | Exists within the game world | Health bar on character's chest, holographic map |
| **Non-diegetic** | Overlay; outside the game world | Traditional HUD, pause menu |
| **Meta** | Exists in real world, represents game world | Controller rumble for health |
| **Spatial** | 3D world but not part of fiction | Floating damage numbers, quest markers |

**Design preference order**: Diegetic → Spatial → Meta → Non-diegetic

Use non-diegetic UI only when the information cannot be clearly communicated diegetically.

---

## HUD Design Principles

### Information Hierarchy

Place elements by how frequently the player needs them:

```
Constant awareness (corners):   Health, stamina, ammo count
Frequent reference (edges):     Minimap, objective marker
Contextual (center-adjacent):   Crosshair, interaction prompts
Rare (accessible but hidden):   Full map, detailed stats
Never on HUD:                   Information that changes rarely (full inventory, lore)
```

### Safe Zones

Keep all HUD elements within **safe zones** — 5–10% margin from screen edges for TV overscan and notch-screened devices.

```
┌────────────────────────────────┐
│  Safe zone (5-10% inset)       │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │  GAME WORLD              │  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

### HUD Minimalism Rules

- **Show only what the player can act on right now** — hide irrelevant meters
- **Fade idle elements** — reduce opacity when no combat/action is happening
- **Scale with importance** — critical health warning should demand attention; normal health bar should not
- **No more than 5–7 simultaneous HUD elements** — cognitive load limit

### Adaptive HUD

```csharp
// Pseudocode — adaptive HUD visibility
float healthRatio = health.Current / (float)health.Max;

if (healthRatio > 0.8f && !inCombat) {
    FadeHUDElement(healthBar, targetAlpha: 0.3f);   // Subtle
} else if (healthRatio < 0.25f) {
    PulseHUDElement(healthBar, urgency: true);       // Critical warning
} else {
    SetHUDElementAlpha(healthBar, alpha: 1.0f);      // Normal
}
```

---

## Menu Design

### Navigation Architecture

```
Main Menu
  ├── New Game
  ├── Continue / Load Game
  ├── Settings
  │     ├── Video
  │     ├── Audio
  │     ├── Controls / Input
  │     └── Accessibility
  └── Exit

Pause Menu (minimal — player is mid-game)
  ├── Resume
  ├── Map / Journal
  ├── Settings (shortcut)
  └── Quit to Main Menu
```

**Rules**:
- **Resume** is always the first option in a pause menu
- **Destructive actions** (quit, delete save) require confirmation dialogs
- Pause menu should **never navigate to gameplay-critical information** that requires multiple button presses
- **Back/Cancel** must always work on every screen

### Controller Navigation

```
D-Pad/Analog: Navigate between focusable elements
A/Cross:      Confirm / select
B/Circle:     Back / cancel (must always work)
Y/Triangle:   Context action (if applicable)
Start/Options: Pause (if applicable)
```

**Focusable element rules**:
- Every interactive element must have a visible **focused state**
- Tab order must be **logical and predictable** (top-left to bottom-right default)
- No interactive element should ever be unreachable by keyboard/controller
- Mouse hover and controller focus should produce **identical visual states**

---

## Feedback UI

### Damage Numbers

Floating damage numbers communicate combat effectiveness:

```csharp
// Pseudocode — damage number spawner
void ShowDamageNumber(Vector3 worldPos, int amount, DamageType type) {
    var text = damageNumberPool.Get();
    text.SetText(amount.ToString());
    text.SetColor(GetColorForDamageType(type));  // red=normal, yellow=crit, grey=miss
    text.AnimateFloat(startPos: worldPos, endPos: worldPos + Vector3.up * 2f, duration: 0.8f);
    text.FadeOut(delay: 0.6f, duration: 0.2f);
}

Color GetColorForDamageType(DamageType type) => type switch {
    DamageType.Critical => Color.yellow,
    DamageType.Miss     => Color.grey,
    DamageType.Poison   => Color.green,
    _                   => Color.red
};
```

### Notification System

```yaml
notification_types:
  quest_update:
    position: top-right
    duration_seconds: 4
    icon: quest_icon
    max_queue: 3
  
  item_acquired:
    position: bottom-right
    duration_seconds: 3
    icon: item_thumbnail
    max_queue: 5
  
  achievement_unlocked:
    position: bottom-left
    duration_seconds: 6
    icon: achievement_icon
    max_queue: 1  # Block; only show one at a time
    priority: high
```

**Rules**:
- Never show more than 3–4 notifications simultaneously
- Queue notifications rather than stack them
- High-priority notifications (achievement, critical quest) pause the queue

---

## Inventory & Menu UI

### Inventory Design Principles

- Items should have **scannable information** — icon + name readable at a glance
- **Tooltip on hover/focus** for detailed stats (not shown in the grid)
- **Sort / filter** controls are required once inventory exceeds ~20 slots
- Highlight **new items** clearly (dot indicator, glow, "NEW" badge)
- Mark **equipped items** with a distinct visual state (checkmark, overlay)
- **Drag and drop** (if applicable) must have clear drop target indication

### Information Layout (Tooltip/Item Detail)

```
┌──────────────────────────────┐
│ [ICON]  ITEM NAME            │
│         Item Type | Rarity   │
├──────────────────────────────┤
│ STATS                        │
│  +15 Attack                  │
│  +5 Speed                    │
│  Compare: ▲+8 vs equipped    │
├──────────────────────────────┤
│ DESCRIPTION                  │
│  Flavour text here. Short.   │
└──────────────────────────────┘
```

**Rule**: Comparison stats (vs currently equipped) should be shown automatically — removing friction from decision-making is the designer's job, not the player's.

---

## Accessibility

### Essential Accessibility Settings

Every game should include:

| Setting | Default | Notes |
|---------|---------|-------|
| Subtitle font size | Medium | Small / Medium / Large / Extra Large |
| Subtitles on/off | On | Default ON; player opt-out |
| Subtitle speaker name | On | Shows who is speaking |
| Colourblind mode | Off | Deuteranopia, Protanopia, Tritanopia |
| UI scale | 100% | 75% – 150% range |
| Input remapping | — | Every action rebindable |
| Toggle vs hold | Hold | Option to toggle all hold-to-activate inputs |
| Aim assist | On (console), Off (PC) | Separate for each input type |
| Controller vibration | On | Intensity slider; on/off |
| Flashing/strobing effects | On | Disable option — mandatory for certification |

### Colourblind Safe Colour Palette

Never use **red/green alone** to communicate state — the most common colourblindness.

Always pair colour with **shape**, **icon**, or **text**:

```
❌ Bad:  Red enemy = hostile, green enemy = friendly (red/green colourblind cannot distinguish)
✅ Good: Red enemy = hostile (skull icon), green enemy = friendly (heart icon)
```

### Font and Text Readability

- Minimum font size for body text: **18pt** on TV, **14pt** on PC at 1080p
- Use **high contrast** text (4.5:1 contrast ratio minimum — WCAG AA)
- Avoid **italic text** for long subtitles — harder to read at speed
- Avoid **fully uppercase** body text — reduces readability

---

## Onboarding UI

### Show, Don't Tell

Teach mechanics through UI cues, not text walls:

| Instead of... | Use... |
|--------------|--------|
| "Press X to jump" | X button prompt appears near a gap the player must cross |
| "You can crouch" | Enemy that requires crouching to pass under |
| "Check your map" | Quest marker visible on screen; map opens organically |
| Wall-of-text tutorial | Short, contextual prompts that disappear after one use |

### Input Prompt Rules

- Show **platform-correct input icons** (Xbox icons on Xbox; PlayStation on PS; keyboard on PC)
- Input icons must update **instantly** when the player switches between controller and keyboard
- Prompts should fade away after the player demonstrates they know the action
- Never show more than **2 input prompts simultaneously** during onboarding

---

## UI Review Checklist

**Clarity**
- [ ] Is every HUD element readable at 1080p from 2 metres?
- [ ] Does every interactive element have a visible focused/hover state?
- [ ] Are critical warnings visually distinct from non-critical information?

**Navigation**
- [ ] Is every UI screen fully navigable by controller?
- [ ] Does Back/Cancel work on every screen?
- [ ] Are destructive actions confirmed before executing?

**Accessibility**
- [ ] Is there a colourblind mode or colour/shape redundancy throughout?
- [ ] Are subtitles available and on by default?
- [ ] Are all inputs remappable?
- [ ] Is flashing/strobing effects disableable?

**Feedback**
- [ ] Does every player action have immediate UI feedback?
- [ ] Are notification queues limited to prevent information overload?
- [ ] Is new/updated inventory clearly marked?
