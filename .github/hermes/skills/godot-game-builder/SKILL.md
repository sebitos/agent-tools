---
name: godot-game-builder
description: |
  Godot Engine game development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging a Godot 4.x game
  - Writing or reviewing GDScript code or C# in Godot
  - Working with Godot's Node/Scene system and scene composition
  - Implementing Godot physics (CharacterBody2D/3D, RigidBody, Area nodes)
  - Using Godot signals, groups, and the Autoload/Singleton pattern
  - Implementing Godot animations (AnimationPlayer, AnimationTree, Tween)
  - Working with Godot's Input system, InputMap, and input actions
  - Implementing Godot's resource system (Resources, PackedScene, custom Resources)
  - Optimizing Godot game performance (draw calls, physics layers, object pooling)
  - Exporting a Godot project for PC, mobile, or web
  - Any task where the codebase contains .gd, .tscn, .tres, or project.godot files
---

# Godot Game Builder

Best practices and patterns for building games in Godot 4.x.

---

## Node and Scene Fundamentals

Godot's architecture is built around a **Node tree**. Everything is a Node; scenes are reusable Node trees.

### Node Hierarchy Rules

```
Node hierarchy:
  Root (Node)
    ├── World (Node3D / Node2D)
    │     ├── Player (CharacterBody3D)
    │     │     ├── Sprite3D / MeshInstance3D
    │     │     ├── CollisionShape3D
    │     │     └── Camera3D
    │     └── Level (Node3D)
    │           ├── Terrain (MeshInstance3D)
    │           └── Enemies (Node3D)  ← container node
    └── UI (CanvasLayer)
          └── HUD (Control)
```

**Rules**:
- One responsibility per scene — don't put player logic and enemy logic in the same scene
- Use **container nodes** (plain `Node3D`/`Node2D`) to group logical children
- UI always lives under a `CanvasLayer` — never under the world node
- Camera is a child of the Player — unless it needs independent movement

### Scene Composition vs Inheritance

```gdscript
# Good: Composition — Enemy scene instanced into Level scene
# enemy.tscn → has its own script, exported from PackedScene

# Avoid: Inheritance chains longer than 2 levels
class_name RangedBoss extends RangedEnemy  # OK
class_name UltraBoss extends RangedBoss extends BaseEnemy  # Too deep — flatten
```

---

## GDScript Patterns

### Export Variables (Data-Driven Design)

```gdscript
class_name Enemy
extends CharacterBody3D

@export var max_health: int = 100
@export var move_speed: float = 3.5
@export var attack_damage: int = 15
@export var patrol_path: NodePath  # Assign in editor

var _current_health: int

func _ready() -> void:
    _current_health = max_health
```

**Rule**: Any designer-tunable value should be `@export`. Keep logic in code; keep data in the inspector.

### Signals (Decoupled Communication)

Signals are Godot's event system — prefer over direct references where possible.

```gdscript
# Define signals on the emitter
class_name Enemy
extends CharacterBody3D

signal died(enemy: Enemy)
signal health_changed(new_health: int, max_health: int)

func take_damage(amount: int) -> void:
    _current_health -= amount
    health_changed.emit(_current_health, max_health)
    if _current_health <= 0:
        died.emit(self)
        queue_free()
```

```gdscript
# Connect in the listener
func _ready() -> void:
    enemy.died.connect(_on_enemy_died)
    enemy.health_changed.connect(_on_enemy_health_changed)

func _on_enemy_died(enemy: Enemy) -> void:
    score += enemy.score_value
    spawn_loot(enemy.global_position)
```

**Rules**:
- Emit signals from the bottom up (child tells parent about events)
- Connect signals in the parent, not the child
- Never connect signals to nodes that may be freed — disconnect or use `CONNECT_ONE_SHOT`

### Autoload (Singletons)

Use Autoloads for global systems that must persist across scenes:

```gdscript
# Project Settings → Autoload → Add GameManager.gd as "GameManager"

# GameManager.gd
extends Node

var score: int = 0
var player_health: int = 100

signal score_changed(new_score: int)

func add_score(amount: int) -> void:
    score += amount
    score_changed.emit(score)
```

```gdscript
# Access from anywhere
GameManager.add_score(100)
```

**Autoload candidates**: AudioManager, GameManager, SaveManager, EventBus, SceneManager  
**Not for Autoload**: Anything scene-specific, anything the player controls

---

## Movement Systems

### CharacterBody3D (Recommended for Player / NPCs)

```gdscript
class_name Player
extends CharacterBody3D

const SPEED = 5.0
const JUMP_VELOCITY = 4.5
var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")

func _physics_process(delta: float) -> void:
    # Apply gravity
    if not is_on_floor():
        velocity.y -= gravity * delta

    # Handle jump
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = JUMP_VELOCITY

    # Handle horizontal movement
    var direction := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
    if direction:
        velocity.x = direction.x * SPEED
        velocity.z = direction.y * SPEED
    else:
        velocity.x = move_toward(velocity.x, 0, SPEED)
        velocity.z = move_toward(velocity.z, 0, SPEED)

    move_and_slide()
```

### 2D Character Movement

```gdscript
class_name Player2D
extends CharacterBody2D

const SPEED = 200.0
const JUMP_VELOCITY = -400.0
var gravity := ProjectSettings.get_setting("physics/2d/default_gravity") as float

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity.y += gravity * delta

    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = JUMP_VELOCITY

    var direction := Input.get_axis("move_left", "move_right")
    velocity.x = direction * SPEED if direction else move_toward(velocity.x, 0, SPEED)

    move_and_slide()
```

---

## State Machine in Godot

Use a typed enum + match pattern for clean FSM:

```gdscript
class_name Enemy
extends CharacterBody3D

enum State { IDLE, PATROL, CHASE, ATTACK, DEAD }
var state: State = State.IDLE

func _physics_process(delta: float) -> void:
    match state:
        State.IDLE:    _process_idle(delta)
        State.PATROL:  _process_patrol(delta)
        State.CHASE:   _process_chase(delta)
        State.ATTACK:  _process_attack(delta)
        State.DEAD:    pass  # No processing when dead

func _transition_to(new_state: State) -> void:
    if state == new_state:
        return
    state = new_state
    match state:
        State.CHASE:
            _chase_start()
        State.DEAD:
            died.emit(self)
            _play_death_animation()
```

---

## Resource System

### Custom Resources (Data Objects)

```gdscript
# ItemData.gd — define in project
class_name ItemData
extends Resource

@export var item_name: String = ""
@export var description: String = ""
@export var icon: Texture2D
@export var max_stack: int = 1
@export var value: int = 0
```

```
# In the editor:
# File → New Resource → ItemData
# Fill exported fields in inspector
# Save as sword.tres, potion.tres, etc.
```

```gdscript
# Load resources at runtime
var sword: ItemData = preload("res://items/sword.tres")
var potion: ItemData = load("res://items/potion.tres")  # Dynamic load
```

**Rule**: Game data (items, abilities, enemy stats) should be Custom Resources, not hardcoded in scripts.

---

## Scene Management

```gdscript
# SceneManager autoload
class_name SceneManager
extends Node

func change_scene(path: String, transition: bool = true) -> void:
    if transition:
        await _play_transition_out()
    get_tree().change_scene_to_file(path)
    if transition:
        await _play_transition_in()

func load_scene_additive(path: String) -> Node:
    var packed: PackedScene = load(path)
    var instance: Node = packed.instantiate()
    get_tree().root.add_child(instance)
    return instance
```

---

## Input System

### Define in InputMap, Not in Code

```gdscript
# Good — InputMap action name
if Input.is_action_just_pressed("attack"):
    ...

# Bad — hardcoded key
if Input.is_key_pressed(KEY_SPACE):
    ...
```

**Rule**: All inputs go through `InputMap` (Project Settings → Input Map). This enables rebinding.

### Controller + Keyboard Parity

```gdscript
# Works for both keyboard and controller
var move_dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
```

---

## Performance Best Practices

### Object Pooling

```gdscript
class_name BulletPool
extends Node

@export var bullet_scene: PackedScene
@export var pool_size: int = 50

var _pool: Array[Node] = []

func _ready() -> void:
    for i in pool_size:
        var bullet = bullet_scene.instantiate()
        bullet.visible = false
        add_child(bullet)
        _pool.append(bullet)

func get_bullet() -> Node:
    for bullet in _pool:
        if not bullet.visible:
            bullet.visible = true
            return bullet
    # Pool exhausted — expand
    var bullet = bullet_scene.instantiate()
    add_child(bullet)
    _pool.append(bullet)
    return bullet

func return_bullet(bullet: Node) -> void:
    bullet.visible = false
    bullet.set_physics_process(false)
```

### Physics Layer Configuration

Use **collision layers and masks** to limit physics checks:

```
Layer 1: Player
Layer 2: Enemies
Layer 3: World (terrain, walls)
Layer 4: Projectiles
Layer 5: Triggers / Areas

Player   — layer: 1,  mask: 2+3 (checks enemies and world)
Enemy    — layer: 2,  mask: 1+3 (checks player and world)
Projectile — layer: 4, mask: 2+3 (checks enemies and world; not player projectiles vs player)
```

**Rule**: Only enable the collision layers/masks you need. Every unnecessary layer check is a performance cost.

---

## Export and Deployment

### Export Checklist

- [ ] Export templates downloaded for all target platforms
- [ ] `project.godot` has correct application name and version
- [ ] Icons provided for all required sizes
- [ ] Android: keystore configured; package name set
- [ ] iOS: bundle identifier set; provisioning profile configured
- [ ] Web: CORS headers configured on server for `.wasm` files
- [ ] All resources are correctly referenced (no missing assets)
- [ ] Debug features removed (debug HUDs, cheat codes, verbose logging)
- [ ] Run the exported build — not just the editor — before submission

---

## Common Godot Mistakes

| Mistake | Fix |
|---------|-----|
| `get_node()` by path in `_process` | Cache in `@onready var node = $NodePath` |
| Physics code in `_process` | Move to `_physics_process` |
| Too many Autoloads | Limit to 5–8 true global systems; use signal bus pattern instead |
| Deeply nested scene trees | Flatten; use composition over nesting |
| Connecting signals in code to freed nodes | Use `CONNECT_ONE_SHOT` or disconnect in `_exit_tree` |
| `load()` in `_process` | Preload at startup or use async `ResourceLoader` |
