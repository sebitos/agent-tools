# Mobile Development Playbook

Workflow rules for building mobile apps targeting iOS (iPhone + iPad) and Android (phone + tablet).

---

## Core Principle

**Design for the smallest screen first, then expand.**

Start with iPhone SE / compact-width Android. A layout that works at 375pt/360dp will adapt up to a 12.9" iPad gracefully. The reverse is almost never true.

---

## Milestone Structure

```
1. Core Screens (phone layout only, hardcoded data)
2. Real Data + Navigation
3. Tablet / Large-screen Adaptation
4. Offline Support + Edge Cases
5. App Store / Play Store Submission Prep
6. Launch
```

- Never skip Milestone 3 — tablet support added post-launch costs 3× more than built-in
- Accessibility (Dynamic Type, TalkBack/VoiceOver) must be verified at Milestone 2, not Milestone 5

---

## Adaptive Layout Rules

- **Never** use `if deviceModel == "iPad"` or `UIDevice.current.userInterfaceIdiom == .pad` to choose layouts — use size classes (iOS) or `WindowSizeClass` (Android)
- **Never** hardcode pixel/point dimensions for layout boundaries
- Every screen must be verified in at least three configurations:
  - Compact width (iPhone portrait / Slide Over on iPad / Android phone portrait)
  - Medium width (iPhone landscape / small Android tablet)
  - Expanded width (iPad full-screen / large Android tablet / foldable unfolded)
- Interactive targets: minimum 44×44pt (iOS) / 48×48dp (Android)
- Use `NavigationSplitView` (iOS) or `ListDetailPaneScaffold` (Android) for list-detail flows on large screens

---

## Accessibility — Non-Negotiable from Day One

- All images have an accessibility label or are explicitly marked decorative
- All interactive controls have an accessibility label distinct from their visual appearance
- Dynamic Type (iOS) / font scale (Android) tested at maximum size — no truncation, no overflow
- Colour contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- VoiceOver (iOS) and TalkBack (Android) navigable without visual reference
- Never rely on colour alone to convey information

---

## State Persistence

- All form / text input saved on entering background — users must never lose in-progress work
- Navigation state (selected tab, scroll position) restored on cold launch
- Use `@AppStorage` / `DataStore` for lightweight settings; Room / Core Data for structured data

---

## Offline Behaviour

- Every screen must have an explicit state for: loading, success, empty, error, offline
- Display stale cached data with a "last updated" timestamp when offline rather than a blank screen
- Retry logic: exponential backoff, max 3 retries, surfaced to user after the last attempt

---

## Performance Checkpoints

Before each milestone review:
- [ ] App cold-start < 2 seconds on the supported minimum device
- [ ] List scrolling at 60fps (use Instruments / Android GPU profiler to verify)
- [ ] No memory leaks (Instruments Leaks / Android Studio Memory Profiler)
- [ ] Image assets: use vector where possible; provide 2× and 3× rasters (iOS) or mdpi–xxxhdpi (Android)
- [ ] App binary size reviewed — no unintentional large asset or library included

---

## Testing Protocol

| Layer | Tool (iOS) | Tool (Android) | When |
|-------|-----------|----------------|------|
| Unit (ViewModels, use cases) | XCTest / Swift Testing | JUnit 5 + kotlinx-coroutines-test | Every PR |
| UI (critical flows) | XCUITest | Compose UI Test | Every PR |
| Device matrix | Xcode Simulator (SE, Pro Max, iPad mini, iPad Pro) | Android Emulator (Resizable) | Per milestone |
| Real device | Physical iPhone + iPad | Physical Android phone + tablet | Before submission |
| Accessibility | Accessibility Inspector + VoiceOver | Accessibility Scanner + TalkBack | Per milestone |

---

## App Store / Play Store Submission Checklist

**iOS (App Store)**:
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) completed
- [ ] All `NSUsageDescription` keys in `Info.plist`
- [ ] App icon set complete (all required sizes)
- [ ] Tested on minimum deployment target iOS version
- [ ] VoiceOver tested end-to-end
- [ ] TestFlight beta ≥ 1 week before submission
- [ ] App Review Guidelines reviewed for any feature using payments, health, or UGC

**Android (Google Play)**:
- [ ] Target SDK = current Play Store requirement
- [ ] App signed with Play App Signing
- [ ] All permissions declared with justification
- [ ] Privacy policy URL configured in Play Console
- [ ] Content rating questionnaire completed
- [ ] Adaptive icon provided
- [ ] Tested on compact, medium, and expanded WindowSizeClass emulators
- [ ] Internal test track ≥ 1 week before production rollout

---

## Common Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| Hardcoding device model checks | Use size classes / WindowSizeClass |
| Requesting all permissions at launch | Request just-in-time, one at a time |
| Storing tokens in UserDefaults / SharedPreferences | Use Keychain / EncryptedSharedPreferences |
| `DispatchQueue.global().async` without structured scope | Use async/await + actors (iOS) / coroutines (Android) |
| Adding tablet support as a last-minute port | Design adaptive from Milestone 1 |
| Skipping accessibility until QA | Implement labels and contrast from the first screen |
