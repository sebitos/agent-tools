---
description: 'Instructions for writing C++ code following modern C++ standards (C++17/20), compatible with Unreal Engine workflows'
applyTo: '**/*.cpp,**/*.h,**/*.hpp,**/*.cc,**/*.inl'
---

# C++ Development Instructions

Follow modern C++ (C++17 minimum, C++20 where available) and Unreal Engine conventions for all C++ source files including game code, engine extensions, and plugin code.

## Naming Conventions (Unreal Engine)

Unreal Engine uses a mandatory prefix system — follow it for all Unreal code:

- `F` prefix — plain structs and data classes: `FPlayerStats`, `FInventoryItem`
- `U` prefix — UObject subclasses: `UHealthComponent`, `UInventorySubsystem`
- `A` prefix — AActor subclasses: `APlayerCharacter`, `AEnemy`
- `I` prefix — interface classes: `IDamageable`, `IInteractable`
- `E` prefix — enums: `EGameState`, `EEnemyBehavior`
- Methods and functions: `PascalCase`
- Member variables: `PascalCase` with no prefix (`Health`, `MaxSpeed`)
- Local variables: `camelCase`
- Constants / macros: `ALL_CAPS`

For non-Unreal projects, document your naming convention in `CONVENTIONS.md` and apply it consistently.

## Memory Management

- Prefer stack allocation over heap allocation
- Use RAII — acquire resources in constructors, release in destructors
- In non-Unreal code: `std::unique_ptr` for exclusive ownership, `std::shared_ptr` for shared
- **Unreal GC rules** — do not use `std::shared_ptr` for `UObject`s:
  - Register `UObject*` fields with `UPROPERTY()` to prevent GC collection mid-frame
  - Use `TWeakObjectPtr<T>` for non-owning references that may become invalid
  - Use Unreal's `TSharedPtr<FStruct>` (not `std::`) for non-UObject heap data
- Never store raw `UObject*` in fields that lack `UPROPERTY` — the GC will not see them

## Error Handling

- Exceptions are **disabled** in Unreal Engine — do not use `throw`, `try`, or `catch`
- Use `check(Condition)` for invariants that should never fail (debug-only crash in non-Shipping)
- Use `ensure(Condition)` for recoverable invariants — logs and continues in non-Shipping builds
- Use `UE_LOG(LogCategory, Verbosity, Format, ...)` for runtime diagnostic logging
- Return `bool` or a result struct when a function can legitimately fail

## Constants and Magic Values

Never hardcode magic numbers or strings — define them at a named constant.

```cpp
// Good
constexpr float MAX_FALL_SPEED = 2000.f;

// Bad
if (Velocity.Z < -2000.f) { ... }
```

- Use `constexpr` for compile-time constants in preference to `#define`
- Use `TMap<FName, float>` or `UDataAsset` for designer-tunable game parameters
- Unreal `FName` for string keys; never compare raw `FString` in hot loops

## Includes and Header Hygiene

- Use `#pragma once` instead of include guards
- Forward-declare types in headers rather than including full headers
- Put includes in `.cpp` files where possible — minimize `.h` include chains
- Include order: engine headers → module headers → local headers, each group alphabetical

## Templates

- Use templates only for genuinely generic, reusable behaviour
- Avoid deep template metaprogramming; prefer `if constexpr` for simple conditional logic
- Unreal macros (`UPROPERTY`, `UFUNCTION`, `GENERATED_BODY`) are mandatory — never omit them

## Code Structure

- Keep functions under 50 lines; extract helpers into static functions or utility classes
- One class per `.h`/`.cpp` pair; filename must match class name
- Avoid deep inheritance hierarchies — prefer composition via `UActorComponent`
- Separate data (`UPROPERTY` state) from behaviour (methods)

## Formatting

- Use `.clang-format` — Unreal provides one at the repo root; use it
- Run `clang-format` before committing
- Unreal convention: tabs (not spaces), braces on their own line (Allman style)
- Follow your project's `.clang-format` if it overrides defaults

## Testing

- Use Unreal's automation framework: `IMPLEMENT_SIMPLE_AUTOMATION_TEST` / `IMPLEMENT_COMPLEX_AUTOMATION_TEST`
- Test pure C++ logic in isolation where possible (`FStruct` methods, utility classes, math)
- For physics-dependent or networked logic, use Unreal's functional test actors
- Run tests: Unreal Editor → Tools → Session Frontend → Automation tab
- Test naming: `<Module>.<Category>.<WhatItTests>` (Unreal convention)
