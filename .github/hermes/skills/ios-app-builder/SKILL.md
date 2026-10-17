---
name: ios-app-builder
description: |
  iOS and iPadOS app development patterns and implementation guidance. Use this skill when:
  - Building, extending, or debugging an iOS or iPadOS app
  - Writing or reviewing SwiftUI views, view models, or UIKit view controllers
  - Implementing adaptive layouts that work on both iPhone and iPad (all screen sizes)
  - Working with App lifecycle, SceneDelegate, or UIApplicationDelegate
  - Implementing navigation: NavigationStack, NavigationSplitView, sheet, fullScreenCover
  - Persisting data with Core Data, SwiftData, UserDefaults, Keychain, or FileManager
  - Integrating networking with URLSession or async/await HTTP clients
  - Handling push notifications (APNs), background fetch, or background processing
  - Implementing App Store receipt validation, StoreKit 2 in-app purchases
  - Preparing for App Store submission: entitlements, capabilities, Info.plist, privacy strings
  - Any task where the codebase contains .xcodeproj, .xcworkspace, or Package.swift files targeting iOS/iPadOS
---

# iOS App Builder

Best practices and patterns for building iPhone and iPad apps with Swift and SwiftUI.

---

## Project Structure

```
MyApp/
├── App/
│   ├── MyApp.swift          (App entry point — @main)
│   └── AppDelegate.swift    (UIApplicationDelegate if needed)
├── Features/
│   ├── ProductList/
│   │   ├── ProductListView.swift
│   │   ├── ProductListViewModel.swift
│   │   └── ProductListView+Subviews.swift
│   └── ProductDetail/
│       ├── ProductDetailView.swift
│       └── ProductDetailViewModel.swift
├── Domain/
│   ├── Models/
│   └── UseCases/
├── Data/
│   ├── Network/
│   ├── Persistence/
│   └── Repositories/
├── Shared/
│   ├── Components/         (reusable UI components)
│   ├── Extensions/
│   └── Constants.swift
└── Resources/
    ├── Assets.xcassets
    └── Localizable.strings
```

---

## App Architecture: MVVM

```
View (SwiftUI)
  ↓ observes @StateObject / @EnvironmentObject
ViewModel (@Observable / ObservableObject)
  ↓ calls
Repository (protocol)
  ↓ calls
DataSource (network / persistence)
```

**Rules**:
- Views hold no business logic — only layout and user interaction
- ViewModels hold no UIKit/SwiftUI imports — pure Swift, fully testable
- Repositories abstract the data source — swap remote for local without changing ViewModel

---

## Navigation

**iOS 16+ (recommended)**:

```swift
// NavigationStack with typed path
@State private var path = NavigationPath()

NavigationStack(path: $path) {
    ProductListView()
        .navigationDestination(for: Product.self) { product in
            ProductDetailView(product: product)
        }
}
```

**iPad — two-column layout**:

```swift
NavigationSplitView {
    SidebarView()            // list / menu
} detail: {
    DetailPlaceholderView()  // selected content
}
```

**Rules**:
- Use `NavigationStack` for iPhone; `NavigationSplitView` for iPad multi-column
- Never use deprecated `NavigationView`
- Deep-link support: handle `onOpenURL` and map URLs to `NavigationPath` entries

---

## Adaptive iPhone + iPad Layouts

```swift
@Environment(\.horizontalSizeClass) var sizeClass

var body: some View {
    if sizeClass == .compact {
        PhoneLayout()      // iPhone, iPad slide-over
    } else {
        TabletLayout()     // iPad full-screen, Split View 1/2+
    }
}
```

**Grid layouts that adapt automatically**:

```swift
let columns = [GridItem(.adaptive(minimum: 160))]

LazyVGrid(columns: columns, spacing: 16) {
    ForEach(products) { ProductCard(product: $0) }
}
```

**Checklist for tablet support**:
- [ ] Test in both compact and regular horizontal size class
- [ ] `NavigationSplitView` or sidebar for iPad
- [ ] No hardcoded widths — use `.frame(maxWidth: .infinity)` and relative sizing
- [ ] Keyboard support: `onSubmit`, `focused`, Tab key navigation
- [ ] Pointer (trackpad/mouse) support: `.hoverEffect()` on interactive elements

---

## Data Persistence

| Need | Solution |
|------|----------|
| Small key-value settings | `UserDefaults` (via `@AppStorage`) |
| Sensitive credentials / tokens | Keychain (`Security` framework or `KeychainAccess` package) |
| Relational data, queries | Core Data or SwiftData (iOS 17+) |
| Simple structured data | JSON file in `Documents` or `Application Support` |
| Sync across devices | CloudKit + Core Data / SwiftData |

**Never** store auth tokens in `UserDefaults` — always use Keychain.

---

## Networking

```swift
// Type-safe async networking
func fetchProducts() async throws -> [Product] {
    let url = URL(string: "https://api.example.com/products")!
    let (data, response) = try await URLSession.shared.data(from: url)
    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
        throw APIError.invalidResponse
    }
    return try JSONDecoder().decode([Product].self, from: data)
}
```

**Rules**:
- Always check HTTP status code — `URLSession` does not throw on 4xx/5xx
- Decode on a background context — do not decode on `@MainActor`
- Use `JSONDecoder.dateDecodingStrategy` and `keyDecodingStrategy` rather than manual mapping

---

## App Store Submission Checklist

Before submitting to TestFlight or App Store Review:

- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) completed for all used APIs
- [ ] All `NSUsageDescription` keys present in `Info.plist` for requested permissions
- [ ] App icon set complete for all required sizes
- [ ] No calls to private APIs (run `ipatool` or Instruments → System Usage)
- [ ] Minimum deployment target is justified — test on that OS version
- [ ] Accessibility: VoiceOver tested, Dynamic Type supported, colour contrast passes
- [ ] iPad layout tested on 11" and 12.9" (or M-series equivalents)
- [ ] Tested on physical device — not just Simulator — before submission
- [ ] Crash-free rate > 99% on TestFlight before App Store submission
