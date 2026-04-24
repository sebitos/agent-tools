---
name: unity-game-builder
description: |
  Unity-specific game development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging a Unity game
  - Writing or refactoring MonoBehaviour scripts
  - Working with ScriptableObjects for data-driven design
  - Using Unity Physics (2D or 3D), the new Input System, Animator, UI Toolkit, or uGUI
  - Managing assets with Addressables
  - Implementing coroutines or async/await (UniTask / Unity 6 Awaitable)
  - Optimizing Unity game performance (draw calls, GC allocation, profiler)
  - Creating Unity Editor tools or custom inspectors
  - Any task where the codebase contains Unity-specific APIs or .asmdef files
---

# Unity Game Builder

Best practices and patterns for building games in Unity 2022 LTS / Unity 6+.

---

## MonoBehaviour Lifecycle

Understand and respect execution order:

```
Awake()  →  OnEnable()  →  Start()
  →  [per frame: Update()  →  FixedUpdate()  →  LateUpdate()]
  →  OnDisable()  →  OnDestroy()
```

| Method | Use for |
|--------|---------|
| `Awake` | Self-initialization; cache `GetComponent<T>()` references |
| `Start` | Cross-object initialization (other Awakes are guaranteed complete) |
| `Update` | Input, camera, non-physics movement, timers |
| `FixedUpdate` | Physics forces, Rigidbody movement — runs at fixed timestep |
| `LateUpdate` | Follow cameras; UI dependent on other transforms |

**Rules**:
- Cache all `GetComponent<T>()` calls in `Awake` — never call in `Update`
- Never call `FindObjectOfType<T>()` in runtime loops — cache or inject references
- Keep `Update` lean — offload heavy logic to services or coroutines

---

## ScriptableObjects

Use ScriptableObjects to separate data from behaviour (data-driven design).

```csharp
[CreateAssetMenu(fileName = "EnemyConfig", menuName = "Game/Enemy Config")]
public class EnemyConfig : ScriptableObject {
    public int   MaxHealth = 100;
    public float MoveSpeed = 5f;
    public GameObject Prefab;
}
```

**Good uses**:
- Game configuration (enemy stats, weapon data, level parameters)
- Shared event channels between scenes (ScriptableObject events)
- Item / ability databases

**Avoid**: Storing mutable runtime state in ScriptableObjects — they persist changes in the Editor across play sessions.

---

## Unity Input System (New Input System)

Always use the new Input System — not legacy `Input.GetKey`:

```csharp
[SerializeField] private InputActionReference _jumpAction;

private void OnEnable()  => _jumpAction.action.performed += OnJump;
private void OnDisable() => _jumpAction.action.performed -= OnJump;

private void OnJump(InputAction.CallbackContext ctx) {
    // Handle jump — called on the performed phase
}
```

- Generate a C# wrapper class from the Input Action Asset for type-safe access
- Separate input reading from game response — input fires events; game logic responds

---

## Physics

**3D Physics (PhysX)**:
- Move Rigidbodies via `rb.MovePosition()` or `rb.AddForce()` in `FixedUpdate`
- Use `rb.linearVelocity` for direct velocity control (e.g. character controller)
- Never use `Transform.position` to move a Rigidbody — this bypasses the physics simulation

**2D Physics (Box2D)**:
- Same rules apply to `Rigidbody2D`
- `Collider2D.isTrigger = true` for detection zones; non-trigger for physical responses

**Layer Matrix**: Configure the Physics Layer Collision Matrix (Project Settings → Physics) to disable unnecessary overlap checks between layer pairs.

---

## Coroutines and Async

```csharp
// Coroutine — frame-sequenced operations
private IEnumerator SpawnAfterDelay(float delay) {
    yield return new WaitForSeconds(delay);
    Instantiate(enemyPrefab, spawnPoint.position, Quaternion.identity);
}

// UniTask — true async I/O (web requests, file I/O, addressables)
private async UniTaskVoid LoadLeaderboard(CancellationToken ct) {
    var data = await leaderboardService.GetTopScoresAsync(ct);
    UpdateUI(data);
}
```

- Use **coroutines** for frame-timing coordination
- Use **UniTask** (or `Awaitable` in Unity 6) for async I/O and awaitable operations
- Pass `this.GetCancellationTokenOnDestroy()` to cancel async tasks when the object is destroyed

---

## UI

- **UI Toolkit** — prefer for new projects (Unity 6+); better performance and data binding support
- **uGUI** — use when working on an existing project that already uses it

**Rules**:
- Separate UI logic from game logic — UI listens to events, does not call gameplay code directly
- Drive UI updates via the event bus or a dedicated ViewModel
- Never read or write `Canvas` / `LayoutGroup` properties per-frame — each access triggers a layout rebuild

---

## Object Pooling (Unity 2021+)

Unity's built-in `ObjectPool<T>` (in `UnityEngine.Pool`):

```csharp
using UnityEngine.Pool;

private ObjectPool<GameObject> _bulletPool;

private void Awake() {
    _bulletPool = new ObjectPool<GameObject>(
        createFunc:      () => Instantiate(bulletPrefab),
        actionOnGet:     obj => obj.SetActive(true),
        actionOnRelease: obj => obj.SetActive(false),
        actionOnDestroy: obj => Destroy(obj),
        defaultCapacity: 50,
        maxSize:         200
    );
}
```

Pre-warm pools at scene load — never at the moment of first use.

---

## Addressables

Use Addressables for all assets too large for the initial build or needed on demand.

- Never load Addressables synchronously on the main thread
- Always release handles: `Addressables.Release(handle)` when the asset is no longer needed
- Group assets by load pattern (per-level content, shared UI, character-specific) to minimize download size

---

## Performance Checklist

| Issue | Fix |
|-------|-----|
| High Draw Calls | Enable GPU Instancing; use static/dynamic batching |
| GC spikes | Pool objects; remove LINQ and `new` from `Update` |
| Physics overhead | Tune Layer Collision Matrix; avoid non-convex MeshColliders |
| Animator overhead | Disable `Animator` when off-screen; use `AnimatorCullingMode.CullCompletely` |
| Shadow cost | Limit shadow-casting lights; reduce shadow distance |
| UI rebuild cost | Separate static and dynamic canvas elements onto separate Canvas objects |

**Always profile before optimizing**: Window → Analysis → Profiler.
