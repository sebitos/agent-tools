---
name: android-app-builder
description: |
  Android app development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging an Android app
  - Writing or reviewing Jetpack Compose UI, ViewModels, or Fragment/Activity code
  - Implementing adaptive layouts that work on phones, tablets, and foldables
  - Working with Android Lifecycle, Activity, Fragment, or Application class
  - Implementing navigation with Jetpack Navigation component or Compose Navigation
  - Persisting data with Room, DataStore, SharedPreferences, or SQLite
  - Integrating with Google Play Services (Firebase, Maps, Push Notifications / FCM)
  - Using WorkManager for background tasks or AlarmManager for scheduled work
  - Implementing in-app purchases with Google Play Billing Library
  - Preparing for Google Play Store submission: signing, permissions, privacy policy, content rating
  - Any task where the codebase contains AndroidManifest.xml, build.gradle, or .kt files targeting Android
---

# Android App Builder

Best practices and patterns for building Android apps with Kotlin and Jetpack Compose.

---

## Project Structure (Feature Modules preferred)

```
app/
└── src/main/
    ├── java/com.example.app/
    │   ├── MainActivity.kt          (single Activity for Compose)
    │   ├── MyApplication.kt
    │   ├── di/                      (Hilt modules)
    │   ├── features/
    │   │   ├── productlist/
    │   │   │   ├── ProductListScreen.kt   (Composable screen)
    │   │   │   ├── ProductListViewModel.kt
    │   │   │   └── ProductListUiState.kt
    │   │   └── productdetail/
    │   │       ├── ProductDetailScreen.kt
    │   │       └── ProductDetailViewModel.kt
    │   ├── domain/
    │   │   ├── model/
    │   │   └── usecase/
    │   ├── data/
    │   │   ├── remote/
    │   │   ├── local/               (Room DAOs, entities)
    │   │   └── repository/
    │   └── ui/
    │       ├── components/          (reusable composables)
    │       ├── theme/               (Color, Type, Shape)
    │       └── navigation/          (NavGraph, Routes)
    └── res/
        ├── values/strings.xml
        └── drawable/
```

---

## App Architecture: MVVM + Clean

```
UI Layer       Composables ← ViewModel (UiState / UiEvent)
Domain Layer   Use Cases (business rules shared across screens)
Data Layer     Repositories → Remote DataSource + Local DataSource
```

```kotlin
// Standard ViewModel pattern
@HiltViewModel
class ProductListViewModel @Inject constructor(
    private val getProductsUseCase: GetProductsUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProductListUiState>(ProductListUiState.Loading)
    val uiState: StateFlow<ProductListUiState> = _uiState.asStateFlow()

    init { loadProducts() }

    private fun loadProducts() {
        viewModelScope.launch {
            _uiState.value = try {
                ProductListUiState.Success(getProductsUseCase())
            } catch (e: Exception) {
                ProductListUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

---

## Navigation (Compose Navigation)

```kotlin
// Define type-safe routes
@Serializable object ProductList
@Serializable data class ProductDetail(val productId: String)

// NavGraph
NavHost(navController = navController, startDestination = ProductList) {
    composable<ProductList> {
        ProductListScreen(onProductClick = { id ->
            navController.navigate(ProductDetail(productId = id))
        })
    }
    composable<ProductDetail> { backStackEntry ->
        val args = backStackEntry.toRoute<ProductDetail>()
        ProductDetailScreen(productId = args.productId)
    }
}
```

**Rules**:
- One `Activity` + Compose Navigation for all new apps
- Pass only IDs (primitives) between screens — load full data in the destination ViewModel
- Handle deep links in `NavHost` with `deepLinks = listOf(navDeepLink { ... })`

---

## Adaptive Layouts (Phone + Tablet + Foldable)

```kotlin
@Composable
fun AdaptiveLayout(viewModel: ProductListViewModel) {
    val windowSizeClass = calculateWindowSizeClass()

    when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> {
            // Phone portrait — single column, bottom nav
            PhoneLayout(viewModel)
        }
        WindowWidthSizeClass.Medium -> {
            // Phone landscape / small tablet — consider two columns
            MediumLayout(viewModel)
        }
        WindowWidthSizeClass.Expanded -> {
            // Large tablet / desktop — navigation rail or drawer + list-detail
            ExpandedLayout(viewModel)
        }
    }
}
```

**Navigation scaffold that adapts automatically**:

```kotlin
NavigationSuiteScaffold(
    navigationSuiteItems = {
        navItems.forEach { item ->
            item(icon = { Icon(item.icon, null) }, label = { Text(item.label) }, ... )
        }
    }
) {
    // Screen content
}
```
`NavigationSuiteScaffold` automatically shows bottom bar (compact), navigation rail (medium), or navigation drawer (expanded).

**Tablet checklist**:
- [ ] `WindowSizeClass` used — no hardcoded device-type checks
- [ ] Navigation rail / drawer for expanded width
- [ ] List-detail pattern (`ListDetailPaneScaffold`) for master-detail flows
- [ ] Foldable: test with `FoldingFeature` — avoid placing interactive elements in the hinge area
- [ ] Keyboard + mouse: all click targets ≥ 48dp; focusable with Tab key

---

## Data Persistence

| Need | Solution |
|------|----------|
| Key-value settings | `DataStore<Preferences>` (not SharedPreferences in new code) |
| Sensitive credentials | Android Keystore System via `EncryptedSharedPreferences` or BiometricPrompt |
| Structured / relational data | Room (`@Database`, `@Entity`, `@Dao`) |
| Files | `Context.getFilesDir()` or `Context.getCacheDir()` |
| Sync + offline | Room + WorkManager background sync |

---

## Background Work

```kotlin
// WorkManager for deferrable, guaranteed work
val syncWork = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.HOURS)
    .setConstraints(
        Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
    )
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "content-sync", ExistingPeriodicWorkPolicy.KEEP, syncWork
)
```

- Use `WorkManager` for guaranteed execution (survives process kill)
- Use `coroutineScope` inside `CoroutineWorker.doWork()` — never block the Worker thread
- Avoid `AlarmManager` for recurring work unless exact timing is required (calendars, reminders)

---

## Permissions

- Request permissions only when the user performs the action that needs them (just-in-time)
- Always handle the denial case gracefully — show rationale before re-requesting
- Use `ActivityResultContracts.RequestPermission` — never call `requestPermissions()` directly in new code
- Minimum permission principle: request READ_MEDIA_IMAGES instead of READ_EXTERNAL_STORAGE on API 33+

---

## Google Play Submission Checklist

Before releasing to Internal Testing or Production:

- [ ] Target SDK = latest stable Android release (required by Play Store deadline)
- [ ] `compileSdk` ≥ `targetSdk`
- [ ] App signed with Play App Signing (upload key enrolled)
- [ ] All permissions declared in `AndroidManifest.xml` with justification in Play Console
- [ ] Privacy policy URL set in Play Console if app collects any user data
- [ ] Content rating questionnaire completed
- [ ] Adaptive icon (`ic_launcher_foreground` + `ic_launcher_background`) provided
- [ ] Tested on phone (compact), 7" tablet (medium), and 10"+ tablet (expanded) emulators
- [ ] Tested on API = `minSdk` — verify nothing crashes on the minimum supported version
- [ ] Crash-free rate > 99% in internal/alpha track before promoting to production
