---
description: 'Instructions for writing C# code following modern idiomatic C# practices, compatible with Unity and Godot C# workflows'
applyTo: '**/*.cs,**/*.csproj,**/*.sln,**/*.asmdef'
---

# C# Development Instructions

Follow modern, idiomatic C# practices for all C# code including Unity scripts, Godot C# nodes, and standalone .NET projects.

## Naming Conventions

- **Classes, structs, interfaces, enums**: `PascalCase`
- **Methods and properties**: `PascalCase`
- **Private fields**: `_camelCase` (underscore prefix)
- **Local variables and parameters**: `camelCase`
- **Constants**: `PascalCase` (C# convention); `ALL_CAPS` only for engine/platform constants
- **Interfaces**: Prefix with `I` — `IMovable`, `IDamageable`, `IPoolable`
- **Events and delegates**: `PascalCase`, past-tense for event names — `OnPlayerDied`, `OnItemPickedUp`
- Avoid abbreviations; prefer `playerHealth` over `plHp`

## Type System

- Enable nullable reference types: `#nullable enable` at file or project level
- Use `var` only when the type is immediately obvious from the right-hand side
- Prefer explicit types in method signatures and class-level declarations
- Use `readonly` for fields that should not be reassigned after construction
- Use `record` types for immutable data carriers
- Prefer `struct` for small, short-lived value types; avoid mutable structs

## Properties and Fields

- Use auto-properties for public state: `public int Health { get; private set; }`
- Avoid public fields — expose state via properties
- Use expression-bodied members for simple one-liners
- Back properties with private fields only when custom logic is required

## Constants and Magic Values

Define constants at class or module level — never inline magic numbers or strings.

- Use `const` for compile-time values, `static readonly` for runtime-initialized values
- Group related constants in a `static class Constants` or as an `enum`

```csharp
// Good
public const float MAX_FALL_SPEED = 20f;

// Bad
if (velocity.y < -20f) { ... }
```

## Error Handling

- Never catch `Exception` without re-throwing or logging — catch specific exception types
- Use `ArgumentNullException.ThrowIfNull()` (.NET 6+) at method entry points
- In Unity: use `Debug.LogError` / `Debug.LogWarning` at system boundaries; avoid silent failures
- Avoid throwing exceptions in hot game-loop code (`Update`, `FixedUpdate`) — use result types or state flags

## Memory and Performance

- Avoid allocations in hot paths (`Update`, `FixedUpdate`, render callbacks):
  - No `new` in `Update` — use object pools
  - No LINQ in hot paths — LINQ allocates enumerators
  - No string interpolation in hot paths — use `StringBuilder` or pre-cached strings
- Cache component references in `Awake()` — never call `GetComponent<T>()` or `FindObjectOfType<T>()` per frame
- Use `struct` and value types where appropriate to reduce GC pressure
- Profile with Unity Profiler or Rider's profiler before optimizing

## Async and Coroutines

- Prefer `async`/`await` (with UniTask in Unity or native `Awaitable` in Unity 6+) over callbacks
- Never use `async void` except in event handlers where the signature is forced
- In Unity: use coroutines for frame-timing coordination; prefer UniTask for async I/O
- Always cancel async operations with `CancellationToken` when the owning object is destroyed

## Collections

- Prefer `List<T>`, `Dictionary<TKey, TValue>`, `HashSet<T>` over arrays when size is dynamic
- Pre-allocate with a capacity hint when size is known: `new List<T>(expectedCount)`
- Expose internal collections as `IReadOnlyList<T>` or `ReadOnlyCollection<T>`

## Code Structure

- One class per file; filename must match class name
- Keep methods under 40 lines; extract helpers for clarity
- Avoid `#region` — prefer smaller, focused classes over collapsible sections
- Follow: `api/`, `services/`, `systems/`, `models/`, `utils/` directory layout

## Formatting

- Use `.editorconfig` to enforce style consistently
- Run `dotnet format` before committing
- 4-space indentation; braces on their own line (Allman style)

## Testing

- Use **NUnit** (Unity Test Framework) or **xUnit** / **NUnit** for standalone .NET
- Mirror the source directory structure in the test project
- Follow AAA (Arrange → Act → Assert)
- Test pure logic classes in isolation — separate logic from MonoBehaviour lifecycle
- Use `[TestCase]` for parameterized tests
- Test naming: `Test_<System>_<Condition>_<ExpectedResult>`
