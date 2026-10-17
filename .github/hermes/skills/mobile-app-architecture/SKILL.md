---
name: mobile-app-architecture
description: |
  Cross-platform mobile architecture patterns covering MVVM, offline-first design, adaptive navigation for phone and tablet, deep linking, push notifications, analytics, and cross-platform framework guidance. Use this skill when:
  - Designing or reviewing the architecture of a mobile app (iOS, Android, or cross-platform)
  - Choosing between native (Swift/Kotlin), cross-platform (Flutter, React Native), or hybrid approaches
  - Implementing MVVM or MVI pattern in a mobile codebase
  - Designing an offline-first data architecture with local cache and remote sync
  - Planning navigation: tab bar vs bottom nav vs navigation rail vs sidebar for phone and tablet
  - Implementing deep linking, universal links (iOS), or app links (Android)
  - Integrating push notifications across platforms
  - Adding analytics, crash reporting, or feature flags
  - Handling app state: foreground, background, suspended, terminated
  - Designing for both phone and tablet from the start of a project
---

# Mobile App Architecture

Patterns and decisions for building well-structured mobile apps that work well on both phones and tablets.

---

## Architecture: MVVM (Default Pattern)

MVVM is the recommended architecture for both iOS (SwiftUI) and Android (Jetpack Compose).

```
View Layer          UI components — observe state, emit events, no logic
ViewModel Layer     Holds UI state, handles user events, calls domain/data layer
Domain Layer        Business rules (use cases) — pure functions, no platform dependency
Data Layer          Repositories → Remote API + Local DB/Cache
```

**Invariants**:
- ViewModels have no dependency on UI framework classes (no `View`, `UIView`, `Context`)
- Repositories expose domain models — not raw network DTOs or database entities
- Views never call data layer directly
- All side effects (network, disk, sensors) are isolated behind interfaces for testability

---

## State Management

Represent screen state as a sealed type — not individual nullable booleans:

```
// iOS
enum LoadState<T> { case idle, case loading, case loaded(T), case failed(Error) }

// Android
sealed class UiState<out T> { Loading, Success(data: T), Error(message: String) }
```

**Rules**:
- Screen state is a **single** `UiState` emitted by the ViewModel
- User actions are **events** sent to the ViewModel (not direct property mutations from the View)
- One-time events (toasts, navigation) use a `Channel` (Android) or `PassthroughSubject` (iOS) — not a persistent state field that the View must clear

---

## Offline-First Data Architecture

```
User action
    ↓
Repository
    ├── 1. Read from local DB immediately → emit to UI
    └── 2. Fetch from network in background
            ↓
        Update local DB
            ↓
        Emit updated data to UI (single source of truth = local DB)
```

**Rules**:
- Local DB is the **single source of truth** — UI always reads from local
- Network writes use optimistic updates + conflict resolution (last-write-wins or version vector)
- Background sync via WorkManager (Android) or BGAppRefreshTask (iOS)
- Mark records with `syncStatus: pending | synced | failed` for retry logic

---

## Adaptive Navigation: Phone vs Tablet

| Layout | Phone (compact) | Tablet (expanded) |
|--------|-----------------|-------------------|
| Primary nav | Bottom tab bar / bottom nav bar | Navigation rail or persistent sidebar drawer |
| Secondary nav | Push onto stack (NavigationStack / NavHost) | Show in detail pane (split view) |
| Modals | Bottom sheet, full-screen cover | Popover or side sheet |
| Forms | Full-screen | Contained panel or sheet |

**Decision rule**: Never hardcode "if iPhone do X, if iPad do Y" — use **size classes** (iOS) or **WindowSizeClass** (Android). The same compact layout appears on iPhone and iPad in Slide Over — size class handles this automatically.

**iOS**:
```swift
NavigationSplitView { Sidebar() } detail: { Detail() }  // iPad
NavigationStack { ... }                                   // iPhone (or compact size class)
// Use @Environment(\.horizontalSizeClass) to switch
```

**Android**:
```kotlin
NavigationSuiteScaffold(...)   // auto-selects bottom bar / rail / drawer
ListDetailPaneScaffold(...)    // auto-selects single-pane / two-pane
```

---

## Deep Linking

| Platform | Mechanism | Example |
|----------|-----------|---------|
| iOS | Universal Links (HTTPS) + Custom URL Schemes | `https://app.example.com/products/42` |
| Android | App Links (HTTPS, verified) + Intent Filters | `https://app.example.com/products/42` |

**Rules**:
- Prefer HTTPS-based verified links over custom schemes for security (no hijacking)
- Deep link handling lives in the **navigation layer** — parse URL → emit navigation event → ViewModel never sees URLs
- Test deep links in CI with `xcrun simctl openurl` (iOS) and `adb shell am start -a android.intent.action.VIEW` (Android)

---

## Push Notifications

```
App Server → FCM / APNs → Device OS → App notification handler
                                            ↓
                                    1. Update local DB
                                    2. Post notification
                                    3. Badge / silent refresh
```

**Rules**:
- Request permission just-in-time (not at launch) — show rationale first
- Handle foreground, background, and terminated app launch from notification
- Notification payload should be a **hint** to refresh — not the full data (avoids stale payloads)
- Register/deregister device token on auth state change

---

## Cross-Platform Frameworks: When to Use

| Situation | Recommendation |
|-----------|---------------|
| Single team, both platforms, UI is straightforward | **Flutter** — single Dart codebase, fast iteration, good tablet support |
| JavaScript/TypeScript team, web + mobile shared logic | **React Native** — JS bridge, `react-native-web` for web too |
| Heavy native features, platform-specific UX is critical | **Native** (Swift + Kotlin) — best performance, best platform fit |
| Existing native app, adding a feature shared across platforms | **KMP (Kotlin Multiplatform)** — share business logic, native UI |

**Avoid** forcing cross-platform when the app is: camera-heavy, ARKit/ARCore, complex Bluetooth, games (use Unity/Unreal instead).

---

## Analytics and Observability

- Instrument **user flows** not individual taps — `flow_started`, `step_completed`, `flow_abandoned`
- Use **event properties** for context: `{ screen: "ProductList", filter: "sale", result_count: 42 }`
- Crash reporting (Firebase Crashlytics / Sentry): enabled from day one, never shipped disabled
- Feature flags (LaunchDarkly / Firebase Remote Config): gate all experimental features — enables instant kill switch without a release

---

## App State Lifecycle Awareness

| iOS State | Android Equivalent | Action Required |
|-----------|--------------------|-----------------|
| Active (foreground) | Resumed | Normal operation |
| Inactive | Paused | Pause timers, autosave |
| Background | Stopped | Save all state, cancel non-essential work |
| Suspended / Terminated | Killed | Restore state on next launch via StateRestoration / `SavedStateHandle` |

**Rules**:
- Persist draft content on entering background — never lose user input
- Restore scroll position and selected tab on cold start
- Cancel in-flight network requests that are non-critical on background transition
