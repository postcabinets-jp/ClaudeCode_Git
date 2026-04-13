#!/bin/bash
# ============================================================
# iOS App Project Scaffolder
# Usage: bash ios/scaffold.sh <project-name> [org-identifier]
# ============================================================

set -e

PROJECT_NAME="${1:?Usage: bash ios/scaffold.sh <project-name> [org-identifier]}"
ORG_ID="${2:-com.postcabinets}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_DIR="$(dirname "$SCRIPT_DIR")"
BUNDLE_ID="${ORG_ID}.${PROJECT_NAME}"

echo "Creating iOS project: $PROJECT_NAME ($BUNDLE_ID)"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Copy CLAUDE.md files
cp "$KIT_DIR/shared/CLAUDE.md" ./CLAUDE.md
cat "$SCRIPT_DIR/CLAUDE.md" >> ./CLAUDE.md

# Copy MCP config
cp "$SCRIPT_DIR/.mcp.json" ./.mcp.json

# Create docs with templates
mkdir -p docs
cp "$KIT_DIR/shared/templates/design.md" ./docs/design.md
cp "$KIT_DIR/shared/templates/prd.md" ./docs/prd.md
cp "$KIT_DIR/shared/prompts/phase-prompts.md" ./docs/phase-prompts.md

# Create directory structure
mkdir -p "$PROJECT_NAME"/{App,Features/{Auth/{Views,ViewModels,Models},Dashboard/{Views,ViewModels,Models},Settings/{Views,ViewModels,Models}},Core/{Network,Storage,Extensions},Design/{Components},Resources,Tests/{UnitTests,UITests}}

# Create Package.swift for SPM dependencies
cat > Package.swift << EOF
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "$PROJECT_NAME",
    platforms: [.iOS(.v17)],
    dependencies: [
        .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.0.0"),
    ],
    targets: [
        .target(
            name: "$PROJECT_NAME",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
            ]
        ),
    ]
)
EOF

# Create initial app files
cat > "$PROJECT_NAME/App/${PROJECT_NAME}App.swift" << EOF
import SwiftUI

@main
struct ${PROJECT_NAME}App: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
        }
    }
}
EOF

cat > "$PROJECT_NAME/App/AppState.swift" << EOF
import SwiftUI
import Observation

@Observable
final class AppState {
    var isAuthenticated = false
    var currentUser: User?

    struct User: Codable, Sendable {
        let id: String
        let email: String
        let displayName: String?
    }
}
EOF

cat > "$PROJECT_NAME/App/ContentView.swift" << EOF
import SwiftUI

struct ContentView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        Group {
            if appState.isAuthenticated {
                // DashboardView()
                Text("Dashboard")
            } else {
                // AuthView()
                Text("Sign In")
            }
        }
    }
}
EOF

# Create Theme
cat > "$PROJECT_NAME/Design/Theme.swift" << EOF
import SwiftUI

enum Theme {
    // Colors - update from docs/design.md
    static let primary = Color(hex: "3B82F6")
    static let secondary = Color(hex: "6B7280")
    static let background = Color(hex: "FFFFFF")
    static let surface = Color(hex: "F8F9FA")
    static let textPrimary = Color(hex: "1A1A1A")
    static let textSecondary = Color(hex: "6B7280")

    // Spacing
    static let spacingXS: CGFloat = 4
    static let spacingSM: CGFloat = 8
    static let spacingMD: CGFloat = 16
    static let spacingLG: CGFloat = 24
    static let spacingXL: CGFloat = 32

    // Corner Radius
    static let radiusSM: CGFloat = 6
    static let radiusMD: CGFloat = 8
    static let radiusLG: CGFloat = 12
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r)/255, green: Double(g)/255, blue: Double(b)/255, opacity: Double(a)/255)
    }
}
EOF

# Create Supabase client
cat > "$PROJECT_NAME/Core/Network/SupabaseClient.swift" << EOF
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "YOUR_SUPABASE_URL")!,
    supabaseKey: "YOUR_ANON_KEY"
)
EOF

# Initialize git
git init
git add -A
git commit -m "feat: initial iOS scaffold from POSTCABINETS Dev Kit"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  $PROJECT_NAME (iOS) created!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. Open in Xcode to generate .xcodeproj"
echo "     (or use XcodeBuildMCP via Claude Code)"
echo "  3. Edit docs/prd.md with your product requirements"
echo "  4. Edit .mcp.json with your credentials"
echo "  5. Open Claude Code: claude"
echo "  6. Paste Phase 1 prompt from docs/phase-prompts.md"
echo ""
