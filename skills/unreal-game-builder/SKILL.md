---
name: unreal-game-builder
description: |
  Unreal Engine game development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging an Unreal Engine 5 game
  - Writing or refactoring Unreal C++ code (AActor, UActorComponent, UObject)
  - Deciding when to use C++ vs Blueprints for a given system
  - Working with the Enhanced Input System, Gameplay Ability System (GAS), or Unreal Subsystems
  - Designing GameMode / GameState / PlayerState / PlayerController class hierarchy
  - Implementing Unreal delegates, multicast delegates, or Blueprint-assignable events
  - Managing Unreal GC: UPROPERTY, TWeakObjectPtr, IsValid()
  - Optimizing Unreal game performance (Nanite, Lumen, tick overhead, GC spikes)
  - Any task where the codebase contains .uproject, .uplugin, or Build.cs files
---

# Unreal Game Builder

Best practices and patterns for building games in Unreal Engine 5.

---

## UObject Class Hierarchy

Choose the right base class — this determines lifetime, replication, and GC behaviour:

```
UObject
  └── UActorComponent        — Component; no transform; attach to Actors
        └── USceneComponent  — Has transform; can attach child components
  └── AActor                 — Placeable in the world; has transform; tickable
        └── APawn            — Possessable by a Controller
              └── ACharacter — APawn + CharacterMovement + Capsule + SkeletalMesh
  └── AGameMode              — Server-only; defines game rules (Win/Lose)
  └── AGameState             — Replicated; shared world state visible to all
  └── APlayerState           — Per-player replicated state (score, health, name)
  └── APlayerController      — Mediates Player ↔ Pawn; persists between possessions
```

**Rules**:
- Put game logic in `AActor` subclasses or `UActorComponent`s, not in plain `UObject`
- Use `UActorComponent` to compose behaviour — prefer over deep inheritance chains
- `AGameMode` for server rules; `APlayerState` for per-player stats (replicated to all clients)

---

## Required Macros

Every UObject/AActor subclass requires these macros — never omit them:

```cpp
UCLASS()
class MYGAME_API APlayerCharacter : public ACharacter {
    GENERATED_BODY()  // ← Required — generates reflection data for GC and editor

public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
    float MaxHealth = 100.f;

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TakeDamage(float Amount);
};
```

**Key UPROPERTY specifiers**:

| Specifier | Meaning |
|-----------|---------|
| `EditAnywhere` | Editable in editor defaults and on placed instances |
| `VisibleAnywhere` | Visible but not editable (use for components) |
| `Replicated` | Synced to clients in multiplayer |
| `BlueprintReadWrite` | Read and write from Blueprint |
| `BlueprintReadOnly` | Read-only from Blueprint |

**Key UFUNCTION specifiers**:

| Specifier | Meaning |
|-----------|---------|
| `BlueprintCallable` | Callable from Blueprint graph |
| `BlueprintImplementableEvent` | Declared in C++; implemented in Blueprint |
| `BlueprintNativeEvent` | C++ default implementation; Blueprint can override |

---

## C++ vs Blueprints

| Use C++ for | Use Blueprint for |
|-------------|-------------------|
| Performance-critical hot-path logic | Rapid prototyping and iteration |
| Core gameplay systems (combat, movement) | Level sequencing and cutscenes |
| Base class definitions and APIs | Per-level and per-asset variation |
| Networking and replication logic | VFX, particle wiring, sound cues |
| Framework code and utilities | Designer-owned configuration |

**Pattern**: Define the API and behaviour in C++; let designers configure and extend in Blueprint.

---

## Delegates and Events

Use Unreal's delegate system — not raw function pointers:

```cpp
// Single-cast delegate
DECLARE_DELEGATE_OneParam(FOnHealthChanged, float);

// Multicast (C# event equivalent)
DECLARE_MULTICAST_DELEGATE_TwoParams(FOnEnemyKilled, AActor*, int32);

class AEnemy : public ACharacter {
public:
    FOnEnemyKilled OnEnemyKilled;

    void Die() {
        OnEnemyKilled.Broadcast(this, PointValue);
    }
};

// Binding (safe — auto-nulls if listener is GC'd)
Enemy->OnEnemyKilled.AddUObject(this, &AMyGameMode::HandleEnemyKilled);
```

**Rules**:
- Use `AddUObject` or `AddWeakLambda` — never `AddRaw` for UObject listeners (GC safety)
- Unbind in `BeginDestroy` or when the listener is destroyed
- Use `UPROPERTY(BlueprintAssignable)` on multicast delegates to expose them to Blueprint

---

## Enhanced Input System

Always use Enhanced Input — not legacy `BindAction`:

```cpp
// In SetupInputComponent
if (auto* EIC = Cast<UEnhancedInputComponent>(InputComponent)) {
    EIC->BindAction(JumpAction, ETriggerEvent::Triggered, this, &APlayerCharacter::Jump);
}

// In BeginPlay — register the mapping context
if (auto* PC = Cast<APlayerController>(GetController())) {
    if (auto* EIS = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer())) {
        EIS->AddMappingContext(DefaultMappingContext, 0);
    }
}
```

- Define `UInputAction` and `UInputMappingContext` as Data Assets
- Separate input reading from game response — input triggers events; game logic responds

---

## Memory and GC

```cpp
// ✅ Safe — UPROPERTY registers with GC
UPROPERTY()
TArray<AActor*> TrackedActors;

// ❌ Unsafe — GC does not see this; actors may be collected mid-frame
TArray<AActor*> UnsafeList;
```

- Every `UObject*` stored as a class member must be `UPROPERTY()` — otherwise GC may free it
- Use `TWeakObjectPtr<AActor>` for non-owning references that may become invalid
- Always call `IsValid(Ptr)` before dereferencing — checks for null **and** pending-kill state

---

## Subsystems (Prefer Over Singletons)

Use Unreal Subsystems for game-wide services:

```cpp
UCLASS()
class UInventorySubsystem : public UGameInstanceSubsystem {
    GENERATED_BODY()
public:
    void AddItem(FName ItemId, int32 Quantity);
    int32 GetItemCount(FName ItemId) const;
private:
    TMap<FName, int32> Inventory;
};

// Access from anywhere
GetGameInstance()->GetSubsystem<UInventorySubsystem>()->AddItem("Sword", 1);
```

| Subsystem Type | Lifetime |
|----------------|----------|
| `UGameInstanceSubsystem` | Entire game session |
| `UWorldSubsystem` | Current level / world |
| `ULocalPlayerSubsystem` | Per local player |

---

## Performance

| Area | Guidance |
|------|----------|
| Draw calls | Use Nanite for static geometry; instance with Hierarchical Instanced Static Mesh (HISM) |
| Lighting | Lumen for dynamic; baked lighting for strict performance budgets |
| GC spikes | Avoid spawning/destroying Actors in hot loops — use object pooling |
| Tick overhead | Disable `PrimaryActorTick.bCanEverTick = false` on Actors that don't need it; use `SetActorTickInterval` |
| Blueprint overhead | Move per-frame hot-path logic to C++ — Blueprint function calls have overhead |

**Always profile with Unreal Insights** before optimizing: `UnrealInsights.exe` or `-trace=cpu,gpu,frame` launch argument.
