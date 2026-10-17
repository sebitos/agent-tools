---
name: gamemaker-game-builder
description: |
  GameMaker Studio 2 game development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging a GameMaker Studio 2 game
  - Writing or reviewing GML (GameMaker Language) code
  - Working with GameMaker Objects, Rooms, Sprites, and Sequences
  - Implementing collision detection with collision_rectangle, place_meeting, or physics bodies
  - Using GameMaker's built-in variables (speed, direction, image_index, alarm[])
  - Implementing GameMaker state machines with enum and switch
  - Managing rooms, persistent objects, and global variables
  - Optimizing GameMaker performance (draw calls, surfaces, batching)
  - Exporting a GameMaker project for Windows, macOS, HTML5, iOS, or Android
  - Any task where the codebase contains .yy, .yyp, or GML (.gml) files
---

# GameMaker Game Builder

Best practices and patterns for building games in GameMaker Studio 2 (GMS2) with GML.

---

## Object and Event Fundamentals

GameMaker games are built from **Objects** reacting to **Events**. Execution order within a step:

```
Begin Step Event
  → Step Event          ← main logic, input, movement
  → End Step Event
  → Draw Event          ← rendering (never put logic here)
  → Draw GUI Event      ← HUD / UI rendering
```

| Event | Use for |
|-------|---------|
| **Create** | Initialise all instance variables |
| **Step** | Input, movement, state updates, timers |
| **Alarm[N]** | Delayed or repeating actions (cooldowns, spawners) |
| **Collision** | React to touching another object |
| **Draw** | Render the sprite; override only when needed |
| **Draw GUI** | HUD elements — always in screen-space coordinates |
| **Destroy** | Clean up surfaces, buffers, or ds_lists |
| **Clean Up** | Runs after Destroy — last chance for memory cleanup |

**Rules**:
- Declare every variable in the **Create event** — GML is not typed; undeclared vars cause crashes
- Never put gameplay logic in a Draw event — Draw runs separately from the game step
- Destroy temp data structures (`ds_list`, `ds_map`, `surface`) in Destroy or Clean Up — GML does **not** garbage-collect them

---

## Variable Initialisation (Create Event)

```gml
// Create Event — declare ALL instance variables here
move_speed  = 3;
jump_force  = -10;
is_grounded = false;
state       = STATE.IDLE;
hp          = 100;
hp_max      = 100;

// Timer example (seconds * game_get_speed)
alarm[0]    = room_speed * 2;  // fire Alarm 0 in 2 seconds
```

---

## State Machine with Enum

```gml
// In a Script Asset or at the top of Create:
enum STATE {
    IDLE,
    WALK,
    JUMP,
    ATTACK,
    DEAD
}

// Step Event:
switch (state) {
    case STATE.IDLE:
        if (keyboard_check(vk_right) || keyboard_check(vk_left)) {
            state = STATE.WALK;
        }
        if (keyboard_check_pressed(vk_space)) {
            state = STATE.JUMP;
        }
    break;

    case STATE.WALK:
        var _dir = keyboard_check(vk_right) - keyboard_check(vk_left);
        x += _dir * move_speed;
        image_xscale = (_dir != 0) ? sign(_dir) : image_xscale;
        if (_dir == 0) state = STATE.IDLE;
    break;

    case STATE.JUMP:
        vspeed = jump_force;
        state  = STATE.IDLE;  // transition after applying impulse
    break;
}
```

---

## Collision Detection

GML offers both tile-based (precise) and physics-based collision.

```gml
// Tile-based — most common for platformers
// Step Event:
var _on_ground = place_meeting(x, y + 1, obj_solid);
is_grounded    = _on_ground;

if (is_grounded && keyboard_check_pressed(vk_space)) {
    vspeed = jump_force;
}

// Move with slope/wall detection (platformer standard):
if (place_meeting(x + hspeed, y, obj_solid)) {
    while (!place_meeting(x + sign(hspeed), y, obj_solid)) {
        x += sign(hspeed);
    }
    hspeed = 0;
}
x += hspeed;

if (place_meeting(x, y + vspeed, obj_solid)) {
    while (!place_meeting(x, y + sign(vspeed), obj_solid)) {
        y += sign(vspeed);
    }
    vspeed = 0;
}
y += vspeed;
```

---

## Alarms (Cooldowns and Timers)

```gml
// Create Event:
shoot_cooldown = false;

// Step Event:
if (keyboard_check_pressed(ord("Z")) && !shoot_cooldown) {
    instance_create_layer(x, y, "Bullets", obj_bullet);
    shoot_cooldown = true;
    alarm[0]       = room_speed / 4;  // 0.25 second cooldown
}

// Alarm[0] Event:
shoot_cooldown = false;
```

---

## Drawing and Sprites

```gml
// Draw Event — only override if you need custom rendering:
draw_self();  // draws the object's assigned sprite normally

// Custom draw with rotation and scaling:
draw_sprite_ext(
    spr_player,       // sprite asset
    image_index,      // frame
    x, y,             // position
    image_xscale,     // horizontal scale (flip with -1)
    image_yscale,
    image_angle,
    c_white,          // colour blend
    image_alpha
);

// Draw GUI Event — always use screen-space coords:
draw_set_colour(c_yellow);
draw_set_font(fnt_hud);
draw_text(16, 16, "HP: " + string(hp));
```

---

## Data Structures (Memory Management)

GML does **not** free data structures automatically. Always destroy them.

```gml
// Create Event:
inventory = ds_list_create();

// Usage:
ds_list_add(inventory, "sword");
ds_list_add(inventory, "potion");

var _count = ds_list_size(inventory);

// Clean Up Event (not Destroy):
ds_list_destroy(inventory);
```

| Structure | Use for | Destroy with |
|-----------|---------|-------------|
| `ds_list` | Ordered collection | `ds_list_destroy` |
| `ds_map` | Key-value store, JSON-like data | `ds_map_destroy` |
| `ds_grid` | 2D arrays (tile maps, grids) | `ds_grid_destroy` |
| `ds_stack` | LIFO queue (undo systems) | `ds_stack_destroy` |

---

## Room Management and Persistent Objects

```gml
// Make an object persist across room transitions (e.g., GameManager):
// Object Properties → check "Persistent"

// Or at runtime in Create Event:
persistent = true;

// Go to next room:
room_goto(rm_level_02);

// Restart current room:
room_restart();

// Check current room:
if (room == rm_menu) { /* ... */ }
```

---

## Global Variables and Game Data

```gml
// Declare globals in a Script Asset (runs at game start):
globalvar score, lives, volume_master;
score          = 0;
lives          = 3;
volume_master  = 1.0;

// Access anywhere:
global.score += 100;  // preferred syntax in GMS2
```

**Rule**: Use `global.` prefix consistently. GameMaker allows both `globalvar` and `global.var`; stick to `global.` in GMS2 — it is explicit and searchable.

---

## Performance Rules

| Rule | Reason |
|------|--------|
| Use `sprite_exists()` before `draw_sprite()` in loops | Prevents crash on unloaded sprites |
| Destroy surfaces in Clean Up | Surfaces live on GPU VRAM — leaks cause OOM crashes |
| Use `with (obj_enemy) { }` instead of looping `instance_find` | Native GML loop is faster |
| Batch draw calls — draw all objects of same type together | Reduces GPU state switches |
| Use tile maps for static collision, not thousands of solid objects | Tiles use spatial hashing; objects are iterated linearly |
| Cache `instance_number(obj_enemy)` in a variable if called each step | Counts are O(n) |

---

## Export Checklist

- [ ] Set Room Speed (typically 60)
- [ ] Configure Game Options → General (title, icon, version)
- [ ] Set texture page size (2048×2048 default; 4096 for more atlas space)
- [ ] Enable texture compression for mobile targets
- [ ] Test with Draw GUI event for all HUD — ensure it renders correctly at all resolutions
- [ ] Set up `display_set_gui_size(1920, 1080)` or viewport scaling for UI consistency
- [ ] Test room transitions — persistent objects should not duplicate
- [ ] Profile with the GMS2 profiler: check Step event cost per object type

---

## Common GML Mistakes

| Mistake | Fix |
|---------|-----|
| Using a variable before declaring it in Create | Declare all vars in Create event |
| Forgetting to destroy `ds_list` / `ds_map` | Add destroy to Clean Up event, not Destroy |
| Putting game logic in Draw event | Move all logic to Step; Draw is render-only |
| Calling `instance_create_layer` without checking layer exists | Use `layer_exists()` first |
| Using `other` outside a collision or `with` block | `other` is undefined outside those scopes |
| Real-number comparisons with `==` (floating point drift) | Use `abs(a - b) < 0.001` instead |
