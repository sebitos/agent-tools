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
  - Building 2D games with Tilemap, Sprite Atlas, Cinemachine 2D, or 2D Physics
  - Working with Unity ECS/DOTS (Entities, Components, Systems, Jobs, Burst)
  - Implementing Animator, AnimationTree, blend trees, or timeline-driven cutscenes
  - Managing multi-scene workflows (additive loading, scene bootstrapping)
  - Any task where the codebase contains Unity-specific APIs or .asmdef files
  - Implementing genre-specific systems: Metroidvania (ability gates, persistent world state, room transitions), top-down RPG, roguelike/roguelite, shoot 'em up, or turn-based strategy
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

---

## Unity 2D — Tilemap

Use the Tilemap system for grid-based levels. Always separate tiles into logical layers.

```
Hierarchy:
  Grid (Grid component)
    ├── Ground     (Tilemap + TilemapRenderer + TilemapCollider2D + CompositeCollider2D)
    ├── Decoration (Tilemap + TilemapRenderer — no collider)
    └── Hazards    (Tilemap + TilemapRenderer + TilemapCollider2D)
```

```csharp
// Read/write tiles at runtime:
[SerializeField] private Tilemap _groundTilemap;
[SerializeField] private TileBase _dirtTile;

private void BreakTile(Vector3 worldPos) {
    Vector3Int cell = _groundTilemap.WorldToCell(worldPos);
    _groundTilemap.SetTile(cell, null);          // remove tile
}

private void PlaceTile(Vector3Int cell) {
    _groundTilemap.SetTile(cell, _dirtTile);
}
```

**Rules**:
- Add `CompositeCollider2D` to the Ground Tilemap and set `TilemapCollider2D.usedByComposite = true` — this merges tile edges into a single collider, eliminating the micro-gap physics bug
- Decoration layers have **no collider** — renderer only
- Use **Rule Tiles** (2D Extras package) for auto-tiling (walls that pick the correct sprite based on neighbours)

---

## Unity 2D — Sprite Atlas

Pack sprites into atlases to reduce draw calls and texture switches.

```csharp
// Load a sprite from an atlas at runtime (Addressables):
private async UniTask<Sprite> LoadSpriteAsync(string atlasAddress, string spriteName) {
    var atlas = await Addressables.LoadAssetAsync<SpriteAtlas>(atlasAddress).ToUniTask();
    return atlas.GetSprite(spriteName);
}
```

**Atlas configuration rules**:
- Create one atlas per logical group: `UI_Atlas`, `Player_Atlas`, `Enemies_Atlas`
- Enable **Tight Packing** and **Allow Rotation** in atlas settings for smaller texture pages
- Set `Max Texture Size` to 2048 (4096 only if required and platform supports it)
- Never mix UI sprites and world sprites in the same atlas — they use different render pipelines

---

## Unity 2D — Cinemachine

Cinemachine handles cameras without code. Use Virtual Cameras (VCams).

```
Hierarchy:
  Main Camera  (Camera + CinemachineBrain)
  VCam_Player  (CinemachineVirtualCamera)
  VCam_Cutscene (CinemachineVirtualCamera — higher Priority during cutscenes)
```

```csharp
// Switch cameras by Priority — highest priority wins:
[SerializeField] private CinemachineVirtualCamera _cutsceneCam;

private void StartCutscene() {
    _cutsceneCam.Priority = 20;  // player cam is 10 — this takes over
}

private void EndCutscene() {
    _cutsceneCam.Priority = 0;
}
```

**Common 2D VCam settings**:

| Setting | Recommended value | Reason |
|---------|------------------|--------|
| Body: Framing Transposer | Dead zone 10–15% | Reduces camera micro-jitter |
| Aim: Composer | Disabled (2D) | No 3D aim needed |
| Confiner 2D extension | Set to level PolygonCollider2D | Prevents camera showing outside level |
| Follow Offset Y | Slight positive (+0.5–1) | Shows more of what's ahead vertically |

**Pixel-perfect games**: Use `Pixel Perfect Camera` component on the Main Camera alongside `CinemachineBrain` — set `Cinemachine.CinemachinePixelPerfect` extension on each VCam.

---

## Unity 2D — Physics and Character Controller

```csharp
[RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D))]
public class PlayerController2D : MonoBehaviour {
    [SerializeField] private float _moveSpeed = 8f;
    [SerializeField] private float _jumpForce = 18f;
    [SerializeField] private LayerMask _groundLayer;

    private Rigidbody2D _rb;
    private bool _isGrounded;

    private void Awake() => _rb = GetComponent<Rigidbody2D>();

    private void FixedUpdate() {
        // Ground check using a small overlap circle at feet:
        _isGrounded = Physics2D.OverlapCircle(
            (Vector2)transform.position + Vector2.down * 0.5f,
            0.1f, _groundLayer
        );
    }

    public void Move(float horizontal) {
        _rb.linearVelocity = new Vector2(horizontal * _moveSpeed, _rb.linearVelocity.y);
        if (horizontal != 0)
            transform.localScale = new Vector3(Mathf.Sign(horizontal), 1, 1); // flip sprite
    }

    public void Jump() {
        if (!_isGrounded) return;
        _rb.linearVelocity = new Vector2(_rb.linearVelocity.x, _jumpForce);
    }
}
```

---

## Animator and Animation

```csharp
// Cache the Animator hash — never pass strings in Update:
private static readonly int SpeedHash  = Animator.StringToHash("Speed");
private static readonly int JumpHash   = Animator.StringToHash("Jump");
private static readonly int GroundHash = Animator.StringToHash("IsGrounded");

private void Update() {
    _animator.SetFloat(SpeedHash, Mathf.Abs(_rb.linearVelocity.x));
    _animator.SetBool(GroundHash, _isGrounded);
}

private void OnJump() {
    _animator.SetTrigger(JumpHash);
}
```

**Animator State Machine rules**:
- Use **Blend Trees** for directional movement (8-way or 1D speed blending) — not one state per direction
- Use **Sub-State Machines** to group related states (Attack sub-machine, Death sub-machine)
- Set **Transition duration to 0** for responsive action games; use short cross-fades (0.05–0.1s) only for locomotion
- Disable **Foot IK** and **Write Defaults** consistently across all states — mixing Write Defaults causes pose corruption

---

## Scene Management (Multi-Scene / Additive Loading)

```csharp
// Additive scene loading — keep a persistent Bootstrap scene loaded at all times:
public static class SceneLoader {
    public static async UniTask LoadSceneAsync(string sceneName, CancellationToken ct) {
        // Load new scene additively:
        await SceneManager.LoadSceneAsync(sceneName, LoadSceneMode.Additive)
                          .ToUniTask(cancellationToken: ct);
        SceneManager.SetActiveScene(SceneManager.GetSceneByName(sceneName));
    }

    public static async UniTask UnloadSceneAsync(string sceneName, CancellationToken ct) {
        await SceneManager.UnloadSceneAsync(sceneName)
                          .ToUniTask(cancellationToken: ct);
    }
}
```

**Multi-scene architecture**:
```
Bootstrap  (persistent — managers, services, DontDestroyOnLoad objects)
  + UI     (additive — HUD, menus — always loaded)
  + Level  (additive — swapped per level)
```

- Use a **Bootstrap scene** to initialise singletons and services before any gameplay scene loads
- Place `DontDestroyOnLoad` objects **only** in the Bootstrap scene — never in gameplay scenes
- Never use `SceneManager.LoadScene` (synchronous) in production — always use async

---

## ECS / DOTS (Unity Entities)

Use ECS/DOTS for systems requiring thousands of entities (bullets, particles, crowds, simulations). Do **not** use DOTS for small object counts — the overhead is not justified.

```csharp
// Component (pure data — no MonoBehaviour):
public struct HealthComponent : IComponentData {
    public int Current;
    public int Max;
}

public struct MoveSpeedComponent : IComponentData {
    public float Value;
}

// System (pure logic — queries entities):
[BurstCompile]
public partial struct MoveForwardSystem : ISystem {
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;

        foreach (var (transform, speed) in
            SystemAPI.Query<RefRW<LocalTransform>, RefRO<MoveSpeedComponent>>()) {
            transform.ValueRW.Position += math.forward(transform.ValueRO.Rotation)
                                        * speed.ValueRO.Value * dt;
        }
    }
}
```

**DOTS decision rules**:

| Use DOTS | Use MonoBehaviour |
|----------|------------------|
| 1000+ identical entities (bullets, enemies in crowd) | Player, camera, UI, managers |
| Heavy per-frame math (pathfinding, simulation) | Any system that needs MonoBehaviour callbacks |
| Job-parallelisable work | Systems with external dependencies (audio, networking) |

- Tag components (zero-size `IComponentData`) for filtering: `struct IsDeadTag : IComponentData {}`
- Use `[BurstCompile]` on all systems that are math-only — gives 10–100× speedup
- Bridge DOTS ↔ MonoBehaviour with `EntityManager` and `Baker` (Subscene baking)

---

## Editor Tools and Custom Inspectors

```csharp
// Custom property drawer — reusable UI for a serialised type:
[CustomPropertyDrawer(typeof(FloatRange))]
public class FloatRangeDrawer : PropertyDrawer {
    public override void OnGUI(Rect pos, SerializedProperty prop, GUIContent label) {
        EditorGUI.BeginProperty(pos, label, prop);
        pos = EditorGUI.PrefixLabel(pos, label);

        float half = pos.width / 2f - 2f;
        var minRect = new Rect(pos.x,          pos.y, half, pos.height);
        var maxRect = new Rect(pos.x + half + 4, pos.y, half, pos.height);

        EditorGUI.PropertyField(minRect, prop.FindPropertyRelative("Min"), GUIContent.none);
        EditorGUI.PropertyField(maxRect, prop.FindPropertyRelative("Max"), GUIContent.none);
        EditorGUI.EndProperty();
    }
}

// Custom Editor — add buttons and validation to a MonoBehaviour inspector:
[CustomEditor(typeof(SpawnManager))]
public class SpawnManagerEditor : Editor {
    public override void OnInspectorGUI() {
        base.OnInspectorGUI();
        if (GUILayout.Button("Spawn Test Wave") && Application.isPlaying) {
            ((SpawnManager)target).SpawnWave();
        }
    }
}
```

**Editor tool rules**:
- Wrap all editor-only code in `#if UNITY_EDITOR` or place in an `Editor/` folder
- Use `SerializedProperty` and `SerializedObject.ApplyModifiedProperties()` — never set fields directly in a `CustomEditor` (bypasses undo/redo)
- Use `[MenuItem("Tools/My Tool")]` for editor utilities that operate on selected assets or scene objects

---

## Assembly Definitions (.asmdef)

Structure code into assemblies to reduce recompile times and enforce boundaries.

```
Assets/
  Runtime/
    Game.Runtime.asmdef         ← gameplay code; no Editor references
  Editor/
    Game.Editor.asmdef          ← editor tools; references Game.Runtime
  Tests/
    Game.Tests.asmdef           ← references Game.Runtime; testables
```

- Each `.asmdef` only references what it needs — this prevents circular dependencies
- The `Editor` assembly must set **Editor Only** platform and reference `UnityEditor.dll`
- Tests assembly references `NUnit` and `UnityEngine.TestRunner`

---

## Build and Platform Checklist

- [ ] Strip engine code: Player Settings → Managed Stripping Level → Medium (IL2CPP builds)
- [ ] Set Scripting Backend to **IL2CPP** for iOS, Android, and console
- [ ] Enable **Incremental GC** (Project Settings → Player → Use Incremental GC)
- [ ] Configure Quality Settings per platform (shadows off on mobile)
- [ ] Set **Texture Compression** per platform (ASTC for iOS/Android, DXT for PC)
- [ ] Validate all scenes are in Build Settings
- [ ] Run **Build Report** (Window → Build Report) and remove unused assets over 1 MB
- [ ] Test on the lowest-spec target hardware before submission

---

## Genre Patterns — Metroidvania

A Metroidvania requires: **ability gates**, **persistent world state**, **room transitions**, a **minimap**, and **save points**.

### Ability Gate System

```csharp
// ScriptableObject — one asset per ability:
[CreateAssetMenu(menuName = "Abilities/AbilityDefinition")]
public class AbilityDefinition : ScriptableObject {
    public string AbilityId;
    public string DisplayName;
}

// Runtime inventory — serialised to save file:
public class AbilityInventory : MonoBehaviour {
    private readonly HashSet<string> _unlocked = new();

    public bool Has(AbilityDefinition ability) => _unlocked.Contains(ability.AbilityId);

    public void Unlock(AbilityDefinition ability) {
        _unlocked.Add(ability.AbilityId);
        EventBus.Raise(new AbilityUnlockedEvent(ability));
    }
}

// Gate — placed in level, blocks passage until ability is owned:
public class AbilityGate : MonoBehaviour {
    [SerializeField] private AbilityDefinition _requiredAbility;
    [SerializeField] private AbilityInventory  _inventory;

    private void Start() {
        bool open = _inventory.Has(_requiredAbility);
        gameObject.SetActive(!open);     // disable collider + renderer when open
    }
}
```

### Persistent World State

Track which destructible objects, gates, and collectibles have been interacted with using a string key saved to disk.

```csharp
public class WorldStateManager : MonoBehaviour {
    private static readonly HashSet<string> _destroyed = new();

    public static bool IsDestroyed(string id) => _destroyed.Contains(id);
    public static void MarkDestroyed(string id) => _destroyed.Add(id);
}

// Destructible wall:
public class DestructibleWall : MonoBehaviour {
    [SerializeField] private string _uniqueId;

    private void Start() {
        if (WorldStateManager.IsDestroyed(_uniqueId))
            Destroy(gameObject);
    }

    public void Destroy() {
        WorldStateManager.MarkDestroyed(_uniqueId);
        Destroy(gameObject);
    }
}
```

### Room Transition System

```csharp
// Trigger at room boundary — fades out, loads new room additively, fades in:
public class RoomTransitionTrigger : MonoBehaviour {
    [SerializeField] private string _targetRoom;
    [SerializeField] private string _spawnPointId;

    private async void OnTriggerEnter2D(Collider2D other) {
        if (!other.CompareTag("Player")) return;
        await RoomManager.Instance.TransitionTo(_targetRoom, _spawnPointId);
    }
}

public class RoomManager : MonoBehaviour {
    public static RoomManager Instance { get; private set; }
    [SerializeField] private CanvasGroup _fadePanel;

    public async UniTask TransitionTo(string room, string spawnId) {
        // Fade to black:
        await _fadePanel.DOFade(1f, 0.25f).ToUniTask();

        // Unload old, load new:
        string current = SceneManager.GetActiveScene().name;
        await SceneLoader.LoadSceneAsync(room, destroyCancellationToken);
        await SceneLoader.UnloadSceneAsync(current, destroyCancellationToken);

        // Move player to spawn point:
        var spawn = GameObject.FindWithTag(spawnId);
        FindObjectOfType<PlayerController2D>().transform.position = spawn.transform.position;

        // Fade back in:
        await _fadePanel.DOFade(0f, 0.25f).ToUniTask();
    }
}
```

### Minimap

- Use a second **Camera** culling only a `Minimap` layer, rendered to a `RenderTexture` displayed in a UI RawImage
- Place a simple colored quad on the Minimap layer for each room; reveal them via `Fog of War` (a fullscreen overlay with cutouts per visited room)
- Store visited room IDs in the save file — reveal on load

### Metroidvania Design Rules

- Every ability must open **at least one** previously inaccessible area — otherwise it's a power-up, not a gate
- Save rooms should be placed **before** difficult encounters, not after (respect player time)
- Design rooms to telegraph that a gate exists before the player has the ability (teach before reward)
- Map must be legible — one screen per room maximum for readable minimap representation

---

## Genre Patterns — Top-Down Action / RPG

8-directional movement, interactable NPCs, overworld camera.

```csharp
[RequireComponent(typeof(Rigidbody2D))]
public class TopDownController : MonoBehaviour {
    [SerializeField] private float _speed = 6f;
    private Rigidbody2D _rb;
    private Vector2 _input;

    private static readonly int MoveXHash = Animator.StringToHash("MoveX");
    private static readonly int MoveYHash = Animator.StringToHash("MoveY");
    private static readonly int SpeedHash  = Animator.StringToHash("Speed");

    private void Awake() => _rb = GetComponent<Rigidbody2D>();

    private void Update() {
        _input = new Vector2(Input.GetAxisRaw("Horizontal"),
                             Input.GetAxisRaw("Vertical")).normalized;
        // Feed 2D blend tree for 8-directional animation:
        if (_input != Vector2.zero) {
            _animator.SetFloat(MoveXHash, _input.x);
            _animator.SetFloat(MoveYHash, _input.y);
        }
        _animator.SetFloat(SpeedHash, _input.magnitude);
    }

    private void FixedUpdate() =>
        _rb.MovePosition(_rb.position + _input * _speed * Time.fixedDeltaTime);
}
```

**Interaction System (range-based)**:
```csharp
public class Interactable : MonoBehaviour {
    [SerializeField] private string _promptText = "Press E to talk";
    public virtual void Interact(GameObject interactor) { }
    public string PromptText => _promptText;
}

// Player detects closest interactable in radius and shows prompt:
private void Update() {
    var hits = Physics2D.OverlapCircleAll(transform.position, 1.5f, _interactLayer);
    _nearest = hits.Length > 0
        ? hits.OrderBy(h => (h.transform.position - transform.position).sqrMagnitude)
              .First().GetComponent<Interactable>()
        : null;
    _promptUI.SetActive(_nearest != null);
    if (_nearest != null && Input.GetKeyDown(KeyCode.E))
        _nearest.Interact(gameObject);
}
```

---

## Genre Patterns — Roguelike / Roguelite

Key requirements: **procedural room graph**, **run-scoped state**, **persistent meta-progression**.

```csharp
// Separate run state from persistent save:
[Serializable]
public class RunState {
    public int CurrentFloor;
    public int Gold;
    public List<string> RelicIds = new();
    // Lives only for one run — never saved to disk between runs
}

[Serializable]
public class MetaProgression {
    public int TotalRuns;
    public int UnlockedCharacterIds;
    public Dictionary<string, bool> UnlockedRelics = new();
    // Persists across runs — saved to disk
}
```

**Procedural room graph**:
```csharp
public class DungeonGenerator : MonoBehaviour {
    [SerializeField] private RoomDefinition[] _roomPool;
    [SerializeField] private RoomDefinition   _bossRoom;

    public RoomGraph Generate(int floors) {
        var graph = new RoomGraph();
        var shuffled = _roomPool.OrderBy(_ => Random.value).Take(floors - 1).ToList();
        shuffled.Add(_bossRoom);
        for (int i = 0; i < shuffled.Count; i++)
            graph.AddNode(shuffled[i], exits: i < shuffled.Count - 1 ? 2 : 0);
        return graph;
    }
}
```

**Rules**:
- `RunState` is never written to persistent storage — if the app closes, the run is lost (roguelike) or checkpoint-restored (roguelite)
- Use **ScriptableObjects** for relic/item definitions so designers can tune values without code
- Seed the random generator at run start and store the seed in `RunState` for reproducibility and bug reporting

---

## Genre Patterns — Shoot 'em Up (Shmup)

High-volume bullets require pooling. Use `UnityEngine.Pool.ObjectPool<T>` (already covered) with a dedicated `BulletPool` per weapon type.

```csharp
// Scrolling background — dual-buffer looping:
public class ScrollingBackground : MonoBehaviour {
    [SerializeField] private Transform[] _panels;  // two identical panels stacked vertically
    [SerializeField] private float _scrollSpeed = 3f;
    private float _panelHeight;

    private void Start() => _panelHeight = _panels[0].GetComponent<SpriteRenderer>().bounds.size.y;

    private void Update() {
        foreach (var panel in _panels) {
            panel.Translate(Vector3.down * _scrollSpeed * Time.deltaTime);
            if (panel.position.y < -_panelHeight)
                panel.Translate(Vector3.up * _panelHeight * _panels.Length);
        }
    }
}

// Bullet pattern — fire in a spread:
public class SpreadShooter : MonoBehaviour {
    [SerializeField] private int   _bulletCount  = 5;
    [SerializeField] private float _spreadAngle  = 30f;
    [SerializeField] private BulletPool _pool;

    public void Fire() {
        float step = _bulletCount > 1 ? _spreadAngle / (_bulletCount - 1) : 0f;
        float start = -_spreadAngle / 2f;
        for (int i = 0; i < _bulletCount; i++) {
            var bullet = _pool.Get();
            bullet.transform.position = transform.position;
            bullet.transform.rotation = Quaternion.Euler(0, 0, start + step * i)
                                      * transform.rotation;
        }
    }
}
```

**Shmup rules**:
- Keep the player's hitbox **visually smaller** than the sprite (30–50% of the sprite's visual area) — this is standard genre convention
- Cap max bullets on screen (e.g. 200) and recycle via pool — never instantiate bullets in `Update`
- Use `Rigidbody2D.MovePosition` for the player, **not** transform.position, to maintain collision detection at high speeds

---

## Genre Patterns — Turn-Based RPG / Strategy

```csharp
// Battle state machine using enum + coroutine dispatcher:
public enum BattlePhase { PlayerTurn, EnemyTurn, Resolution, Victory, Defeat }

public class BattleManager : MonoBehaviour {
    public BattlePhase Phase { get; private set; }

    public async UniTask RunBattle(CancellationToken ct) {
        Phase = BattlePhase.PlayerTurn;
        while (!IsBattleOver()) {
            switch (Phase) {
                case BattlePhase.PlayerTurn:
                    await HandlePlayerTurn(ct);
                    Phase = BattlePhase.EnemyTurn;
                    break;
                case BattlePhase.EnemyTurn:
                    await HandleEnemyTurn(ct);
                    Phase = BattlePhase.Resolution;
                    break;
                case BattlePhase.Resolution:
                    await HandleResolution(ct);
                    Phase = AreEnemiesAlive() ? BattlePhase.PlayerTurn : BattlePhase.Victory;
                    break;
            }
        }
    }
}
```

**Grid / Tile-based movement**:
```csharp
// Use Tilemap cell coordinates as the canonical position for all units:
public class GridUnit : MonoBehaviour {
    public Vector3Int CellPosition { get; private set; }

    public async UniTask MoveTo(Vector3Int target, Tilemap tilemap, CancellationToken ct) {
        CellPosition = target;
        Vector3 worldPos = tilemap.GetCellCenterWorld(target);
        await transform.DOMove(worldPos, 0.3f).ToUniTask(cancellationToken: ct);
    }
}
```

**Turn-based rules**:
- Model all game state as pure data (C# records or serialisable classes) — never query the scene to determine game state
- Keep UI strictly as a **view** of state — no game logic in button `OnClick` handlers beyond dispatching commands
- Use a **command pattern** (`ICommand` with `Execute` / `Undo`) to make moves reversible (required for puzzle games, optional for RPGs)
