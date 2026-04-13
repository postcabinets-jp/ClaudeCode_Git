# CLAUDE.md - iOS App Project

> This file extends the shared CLAUDE.md. Both files are active.

## Tech Stack (iOS)

- **Language**: Swift 6 (strict concurrency)
- **UI**: SwiftUI
- **Architecture**: MVVM + Repository pattern
- **Backend**: Supabase (via supabase-swift SDK)
- **Auth**: Supabase Auth (or Clerk if shared with web)
- **Payments**: StoreKit 2 (in-app purchases) or Stripe (web checkout)
- **Minimum Target**: iOS 17.0
- **Testing**: XCTest + XCUITest
- **CI**: Xcode Cloud or GitHub Actions + Fastlane

## Directory Structure (iOS)

```
MyApp/
├── App/
│   ├── MyAppApp.swift            # @main entry point
│   ├── ContentView.swift
│   └── AppState.swift            # Global app state
├── Features/
│   ├── Auth/
│   │   ├── Views/
│   │   ├── ViewModels/
│   │   └── Models/
│   ├── Dashboard/
│   │   ├── Views/
│   │   ├── ViewModels/
│   │   └── Models/
│   └── Settings/
│       ├── Views/
│       ├── ViewModels/
│       └── Models/
├── Core/
│   ├── Network/
│   │   ├── SupabaseClient.swift
│   │   └── APIError.swift
│   ├── Storage/
│   │   └── UserDefaults+Extensions.swift
│   └── Extensions/
├── Design/
│   ├── Theme.swift               # Colors, fonts, spacing
│   ├── Components/               # Reusable UI components
│   └── Assets.xcassets
├── Resources/
│   └── Localizable.xcstrings     # Japanese + English
└── Tests/
    ├── UnitTests/
    └── UITests/
```

## SwiftUI Conventions

- Views are pure: no business logic, no network calls
- ViewModels are `@Observable` classes (iOS 17+)
- Use `@Environment` for dependency injection
- Prefer `NavigationStack` with typed navigation paths
- Use `AsyncImage` for remote images
- Task cancellation: always use `.task { }` modifier (auto-cancels)

## Supabase iOS Setup

```swift
// Core/Network/SupabaseClient.swift
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "YOUR_SUPABASE_URL")!,
    supabaseKey: "YOUR_ANON_KEY"
)
```

## MCP Visual Loop (iOS)

After every UI change:
1. `xcode` MCP: Build the project (`simulator build`)
2. `xcode` MCP: Run on simulator (`simulator build-and-run`)
3. `ios-sim` MCP: Take screenshot
4. Compare with docs/design.md
5. Fix and repeat

## Naming Conventions (Swift)

- Types: `PascalCase`
- Properties/methods: `camelCase`
- Protocols: `PascalCase` + `-able`, `-ible`, or `-Protocol` suffix
- Files: Match primary type name (`DashboardView.swift`)
- Feature folders: `PascalCase`

## App Store Checklist

- [ ] App icon (1024x1024)
- [ ] Launch screen
- [ ] Privacy manifest (PrivacyInfo.xcprivacy)
- [ ] App Tracking Transparency (if needed)
- [ ] Japanese localization complete
- [ ] Accessibility labels on all interactive elements
- [ ] Dark mode support
