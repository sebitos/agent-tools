---
name: game-architecture
description: |
  Core game architecture patterns and systems design for engine-agnostic game development. Use this skill when:
  - Designing a game loop or main simulation loop
  - Implementing an Entity-Component-System (ECS) or component-based architecture
  - Building a Finite State Machine (FSM) for game entities, AI, or game state
  - Designing an object pooling system for high-frequency spawning
  - Implementing an event bus or message system for cross-system communication
  - Designing scene/level management and transitions
  - Creating a save/load system with versioning
  - Structuring game code for maintainability and separation of concerns
  - Choosing between architectural patterns for a new game project
---

# Game Architecture Patterns

Engine-agnostic patterns for structuring game systems for performance, maintainability, and scalability.

## Overview

Game architecture differs from business application architecture in key ways:

- **Hot loops**: `Update` runs at 60 Hz+ — allocations and virtual dispatch accumulate
- **World state**: Mutable shared state is normal; manage it deliberately
- **Time**: Fixed vs variable timestep; physics and gameplay may run at different rates
- **Entity count**: Hundreds to thousands of entities updating per frame

---

## Pattern 1: Game Loop

Every game needs a stable, predictable main loop.

### Fixed Timestep (Recommended for Physics / Simulation)

```csharp
// Engine-agnostic pseudocode
const float FIXED_STEP = 1f / 60f;
float accumulator = 0f;

void MainLoop(float deltaTime) {
    accumulator += deltaTime;
    while (accumulator >= FIXED_STEP) {
        FixedUpdate(FIXED_STEP);   // Physics, AI, deterministic logic
        accumulator -= FIXED_STEP;
    }
    float alpha = accumulator / FIXED_STEP;  // Interpolation factor for rendering
    Render(alpha);
}

void Update(float deltaTime) {
    // Variable rate: input, camera, animations
}
```

**Rule**: Physics and deterministic simulation run at a fixed step. Rendering and input run at variable rate.

---

## Pattern 2: Entity-Component-System (ECS)

Separate data (components) from identity (entities) from behaviour (systems).

```
Entity  — just an ID (int or GUID)
Component — pure data:  Health { int current; int max; }
System  — logic that operates on entities matching a component query
```

```csharp
// Data-only component
public struct HealthComponent {
    public int Current;
    public int Max;
}

// System: operates on all entities with both Health and PendingDamage
public class DamageSystem : ISystem {
    public void Update(World world) {
        foreach (var entity in world.Query<HealthComponent, PendingDamageComponent>()) {
            ref var health = ref world.Get<HealthComponent>(entity);
            var damage = world.Get<PendingDamageComponent>(entity);
            health.Current -= damage.Amount;
            world.Remove<PendingDamageComponent>(entity);
            if (health.Current <= 0)
                world.AddTag<DeadTag>(entity);
        }
    }
}
```

**When to use ECS**: Many entities with varied combinations of behaviours. Performance-critical simulations.
**Avoid ECS for**: Single-instance objects (GameManager, Camera, AudioManager).

---

## Pattern 3: Finite State Machine (FSM)

Model AI behaviour, player state, or global game state as explicit states with transition conditions.

```csharp
public enum EnemyState { Idle, Patrol, Chase, Attack, Dead }

public class EnemyFSM {
    private EnemyState _state = EnemyState.Idle;

    public void Update(EnemyContext ctx) {
        _state = _state switch {
            EnemyState.Idle    => ctx.PlayerNearby ? EnemyState.Chase : EnemyState.Idle,
            EnemyState.Chase   => ctx.InAttackRange ? EnemyState.Attack
                                : ctx.PlayerNearby  ? EnemyState.Chase : EnemyState.Patrol,
            EnemyState.Attack  => !ctx.InAttackRange ? EnemyState.Chase : EnemyState.Attack,
            EnemyState.Dead    => EnemyState.Dead,
            _                  => _state
        };
    }
}
```

**Rules**:
- Every state must have defined entry, stay, and exit conditions
- Never mix state logic with rendering or physics — query state, act on it elsewhere
- For complex hierarchies, use a Hierarchical State Machine (HFSM) or Behaviour Tree

---

## Pattern 4: Object Pool

Avoid allocating and destroying objects at runtime in hot paths.

```csharp
public class ObjectPool<T> where T : class {
    private readonly Stack<T> _available = new();
    private readonly Func<T> _factory;
    private readonly Action<T>? _onGet;
    private readonly Action<T>? _onReturn;

    public ObjectPool(Func<T> factory, Action<T>? onGet = null, Action<T>? onReturn = null) {
        _factory  = factory;
        _onGet    = onGet;
        _onReturn = onReturn;
    }

    public T Get() {
        var item = _available.Count > 0 ? _available.Pop() : _factory();
        _onGet?.Invoke(item);
        return item;
    }

    public void Return(T item) {
        _onReturn?.Invoke(item);
        _available.Push(item);
    }
}
```

**Use pools for**: Bullets, particles, enemies, audio sources, UI elements.
**Pre-warm** pools at scene load — never at the moment an object is needed.

---

## Pattern 5: Event Bus (Observer)

Decouple systems by broadcasting named events instead of direct method calls.

```csharp
public static class GameEvents {
    public static event Action<int>?       OnScoreChanged;
    public static event Action<EnemyType>? OnEnemyKilled;
    public static event Action?            OnPlayerDied;

    public static void ScoreChanged(int newScore) => OnScoreChanged?.Invoke(newScore);
    public static void EnemyKilled(EnemyType type) => OnEnemyKilled?.Invoke(type);
    public static void PlayerDied()                => OnPlayerDied?.Invoke();
}
```

**Rules**:
- Unsubscribe in `OnDestroy`/`OnDisable` to prevent memory leaks
- Events are fire-and-forget — do not rely on handler execution order
- Do not use the event bus for queries (use a service/repository instead)
- Prefer strongly-typed event arguments over `object` payloads

---

## Pattern 6: Service Locator

Provide global access to game services without tying code to concrete implementations.

```csharp
public static class Services {
    private static readonly Dictionary<Type, object> _registry = new();

    public static void Register<T>(T service) where T : class
        => _registry[typeof(T)] = service;

    public static T Get<T>() where T : class
        => (T)_registry[typeof(T)];
}

// Register at startup (e.g. GameManager.Awake)
Services.Register<IAudioService>(new AudioService());
Services.Register<ISaveService>(new SaveService());

// Use anywhere
Services.Get<IAudioService>().Play("explosion");
```

**Prefer over singletons**: Easier to mock in tests, swap implementations, and control lifetime.

---

## Pattern 7: Save / Load

Separate save data from runtime state.

```
Runtime State  →  [Serializer]  →  SaveData  →  [Persistence]  →  Disk / Cloud
                                  (plain POCOs)
```

**Rules**:
- Save data types must be plain data objects — no engine object references
- Add a `version` field and write migration logic before the first save reaches players
- Never save engine object references (GameObject, Node, Actor) — save IDs and resolve at load time
- Integrity-check save files with a checksum or HMAC to detect corruption

---

## Decision Guide

| Need | Pattern |
|------|---------|
| Many entities with varied behaviours | ECS |
| Predictable physics / simulation | Fixed timestep loop |
| AI or player state transitions | FSM or Behaviour Tree |
| Runtime object creation at high frequency | Object Pool |
| Cross-system communication | Event Bus |
| Global game services | Service Locator |
| Persistent game state | Save / Load with versioning |
