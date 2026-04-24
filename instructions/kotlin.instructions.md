---
description: 'Instructions for writing Kotlin code following modern Android development practices with Jetpack Compose and Android Architecture Components'
applyTo: '**/*.kt,**/*.kts,**/AndroidManifest.xml,**/build.gradle,**/build.gradle.kts'
---

# Kotlin Development Instructions

Follow modern Kotlin (1.9+) and Android development best practices. Use Jetpack Compose for all new UI; use View system (XML) only when extending existing View-based codebases.

## Naming Conventions

- **Classes, interfaces, objects**: `PascalCase`
- **Functions, properties, local variables**: `camelCase`
- **Constants** (`const val`, top-level `val`): `SCREAMING_SNAKE_CASE`
- **Package names**: `lowercase.with.dots`
- **Composable functions**: `PascalCase` (they are conceptually types, not functions) — `ProductCard`, `LoginScreen`
- **Test functions**: backtick names allowed — `` `given valid input, returns 200` ``
- Avoid abbreviations; prefer `userId` (ubiquitous) but `productIdentifier` over `prodId`

## Null Safety

- Never use `!!` (non-null assertion) except in test code or when the null case is truly impossible and documented
- Use `?.let`, `?: return`, or `?: throw` at boundaries
- Represent absent state explicitly with `sealed class` or `Result<T>` rather than nullable returns

```kotlin
// Good — absence is modelled explicitly
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

// Bad — null overloaded with multiple meanings
var data: Product? = null
```

## Coroutines and Flow

- Use `suspend` functions for all async work — no callbacks in new code
- Use `StateFlow` (for state) and `SharedFlow` (for events) over `LiveData` in new code
- Collect flows in `lifecycleScope.launch` with `repeatOnLifecycle(Lifecycle.State.STARTED)` — never in `GlobalScope`
- Use `viewModelScope` for ViewModel coroutines — auto-cancelled on ViewModel clear
- Use `Dispatchers.IO` for I/O; never block `Dispatchers.Main`

```kotlin
// Good
class ProductViewModel(private val repo: ProductRepository) : ViewModel() {
    private val _products = MutableStateFlow<UiState<List<Product>>>(UiState.Loading)
    val products: StateFlow<UiState<List<Product>>> = _products.asStateFlow()

    init {
        viewModelScope.launch {
            _products.value = try {
                UiState.Success(repo.getProducts())
            } catch (e: IOException) {
                UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

## Jetpack Compose

- One top-level `@Composable` screen per file; file name matches the composable name
- Keep `@Composable` functions under 40 lines — extract child composables for clarity
- Hoist all mutable state to the lowest common ancestor; pass state down, events up
- Use `ViewModel` + `StateFlow` / `UiState` for screen-level state — never hold mutable state inside a composable that a ViewModel should own
- Prefer `LazyColumn` / `LazyRow` over `Column` / `Row` for lists of more than a few items
- Use `Modifier` parameters — always accept an external `modifier: Modifier = Modifier` on reusable components

```kotlin
@Composable
fun ProductCard(
    product: Product,
    onTap: () -> Unit,
    modifier: Modifier = Modifier   // ← always expose modifier
) {
    Card(modifier = modifier.clickable(onClick = onTap)) {
        Text(product.name)
    }
}
```

## Adaptive Layouts (Phone + Tablet)

- Use `WindowSizeClass` to distinguish compact (phone portrait), medium (phone landscape / small tablet), and expanded (large tablet / desktop) layouts
- Use `NavigationSuiteScaffold` (Compose Material 3) to automatically switch between bottom navigation bar (compact) and navigation rail / drawer (expanded)
- Never hardcode dp values for layout boundaries — use `WindowSizeClass` breakpoints
- Test with the Resizable Emulator in Android Studio to cover all three window size classes

## Architecture (MVVM + Clean)

```
UI Layer       Composables + ViewModel (UiState, UiEvent)
Domain Layer   Use Cases (optional; required when logic is shared across ViewModels)
Data Layer     Repositories → DataSources (Remote, Local)
```

- ViewModels must not import Android framework classes other than `ViewModel`, `SavedStateHandle`
- Repositories return domain models — not network DTOs or database entities
- Use Hilt for dependency injection in all new Android projects

## Constants

```kotlin
// Good — companion object or top-level constant
private const val MAX_RETRY_COUNT = 3
private const val BASE_URL = "https://api.example.com"

// Bad
if (retries > 3) { ... }
```

## Error Handling

- Never swallow exceptions with an empty `catch` block
- Use `Result<T>` or a sealed `UiState` to propagate errors to the UI layer
- Log unexpected exceptions with structured logging (Timber) before recovering or rethrowing
- Never expose raw exception messages in UI — map to user-friendly strings

## Formatting and Tooling

- Format with `ktfmt` or Kotlin's official formatter; commit an `.editorconfig`
- Run `detekt` for static analysis; commit a `detekt.yml` configuration
- Enable Android Lint and treat all `Error` severity issues as build failures

## Testing

- **Unit tests**: JUnit 5 + `kotlinx-coroutines-test`; run on JVM — no emulator needed
- **Integration/UI tests**: Compose UI Test library (`createAndroidComposeRule`)
- **End-to-end**: Espresso or UI Automator for critical flows only
- Use `TestCoroutineScheduler` and `UnconfinedTestDispatcher` for coroutine tests
- Mirror source structure in `src/test/` (JVM) and `src/androidTest/` (emulator)
- Test naming: `given<Context>_when<Action>_then<ExpectedResult>()`
