---
description: 'Instructions for writing Swift code following modern Swift practices for iOS, iPadOS, and macOS using SwiftUI and UIKit'
applyTo: '**/*.swift,**/*.xcodeproj/**,**/*.xcworkspace/**,**/Package.swift'
---

# Swift Development Instructions

Follow modern Swift (Swift 5.9+) practices for all iOS, iPadOS, and macOS code. Prefer SwiftUI for new UI; use UIKit when working in existing UIKit codebases or when SwiftUI lacks required API coverage.

## Naming Conventions

- **Types** (classes, structs, enums, protocols): `PascalCase`
- **Functions, methods, properties, variables**: `camelCase`
- **Constants**: `camelCase` at local scope; `static let UPPER_CASE` only for C-bridged constants
- **Enum cases**: `camelCase` — `case notStarted`, `case inProgress`
- **Protocol names**: describe capability — `Identifiable`, `Hashable`, `Loadable`
- **Extensions**: name the file `TypeName+CapabilityName.swift`
- Avoid abbreviations; prefer `userIdentifier` over `userId` except for ubiquitous conventions (`url`, `id`)

## Types and Safety

- Prefer `struct` over `class` for value semantics; use `class` when identity or reference sharing is required
- Enable strict concurrency checking — resolve all `Sendable` and actor isolation warnings
- Use `async/await` for all asynchronous code — avoid completion handlers in new code
- Never force-unwrap (`!`) outside of guaranteed non-nil contexts (e.g. `IBOutlet`) — use `guard let` or `if let`
- Prefer `enum` with associated values over multiple optional properties for mutually exclusive states

```swift
// Good — state is unambiguous
enum LoadState<T> {
    case idle
    case loading
    case loaded(T)
    case failed(Error)
}

// Bad — allows impossible combinations
var isLoading: Bool = false
var data: T? = nil
var error: Error? = nil
```

## SwiftUI

- One `View` per file; file name matches the view type name
- Keep `body` under 30 lines — extract sub-views as `private` computed properties or nested `View` types
- Drive all UI state from `@State`, `@StateObject`, or `@EnvironmentObject` — never mutate UI from outside the view hierarchy
- Use `@Observable` (Swift 5.9+ / iOS 17+) or `ObservableObject` for view models
- Separate business logic from views — views only call into a ViewModel or read state; never call networking or persistence directly
- Use `ViewModifier` to encapsulate reusable styling

```swift
// Good — logic lives in ViewModel
struct ProductListView: View {
    @StateObject private var viewModel = ProductListViewModel()

    var body: some View {
        List(viewModel.products) { product in
            ProductRow(product: product)
        }
        .task { await viewModel.loadProducts() }
    }
}
```

## Adaptive Layouts (iPhone + iPad)

- Use `GeometryReader` sparingly — prefer layout containers (`HStack`, `VStack`, `LazyVGrid`, `NavigationSplitView`)
- Use `NavigationSplitView` for two- or three-column layouts on iPad
- Use `@Environment(\.horizontalSizeClass)` to adapt between compact (iPhone / iPad slide-over) and regular (iPad full-screen) layouts
- Avoid hardcoded dimensions — use relative sizing, `frame(maxWidth: .infinity)`, and `padding()` with system spacing
- Test on both compact (iPhone SE) and regular (iPad 12.9") size classes using Xcode Previews and Simulator

## Concurrency

- Mark all `@MainActor` UI-touching code explicitly
- Use structured concurrency — `async let`, `TaskGroup` for parallel work
- Cancel tasks when views disappear: use `.task { }` modifier (auto-cancelled) over `Task { }` (manual cancel required)
- Never call `DispatchQueue.main.async` in new code — use `await MainActor.run { }` or `@MainActor`

## Constants and Configuration

```swift
// Good — namespaced, no magic values
enum Layout {
    static let cardCornerRadius: CGFloat = 12
    static let standardPadding: CGFloat = 16
}

// Bad
.cornerRadius(12)
.padding(16)
```

## Error Handling

- Use `throws` + `try/catch` for recoverable errors; never ignore thrown errors silently
- Define domain-specific error types conforming to `LocalizedError`
- Display user-facing error messages from `localizedDescription`; never expose internal error details in UI

## Memory Management

- Capture lists are mandatory when `self` is captured in a closure that may outlive the calling context: `[weak self]`
- Prefer value types (`struct`) to reduce the need for `[weak self]` entirely
- Avoid retain cycles in delegate patterns — delegates are `weak var`

## Formatting and Tooling

- Format with `swift-format` or enable Xcode's Format on Save
- Run `swiftlint` to enforce style consistently; commit a `.swiftlint.yml` to the repo
- Use Swift Package Manager for all dependencies — avoid CocoaPods in new projects

## Testing

- Use **XCTest** for unit and integration tests; **Swift Testing** (Xcode 16+) for new test suites
- Mirror source structure in `Tests/` target
- Use `XCTestExpectation` or `async/await` for asynchronous test assertions
- Test ViewModels independently of views — no UI test required for business logic
- UI tests with **XCUITest** only for critical user flows (login, checkout, onboarding)
- Test naming: `test_<system>_<condition>_<expectedResult>()`
