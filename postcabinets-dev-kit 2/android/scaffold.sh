#!/bin/bash
# ============================================================
# Android / Cross-Platform (Expo) Project Scaffolder
# Usage: bash android/scaffold.sh <project-name>
# ============================================================

set -e

PROJECT_NAME="${1:?Usage: bash android/scaffold.sh <project-name>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Creating Expo (Android/iOS) project: $PROJECT_NAME"

# Create Expo project
npx create-expo-app@latest "$PROJECT_NAME" --template tabs

cd "$PROJECT_NAME"

# Install dependencies
npm install @supabase/supabase-js expo-secure-store expo-image
npm install nativewind tailwindcss react-native-reanimated
npm install -D @types/react jest @testing-library/react-native

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
mkdir -p src/{components/{ui,features},lib,hooks,types,constants,assets/{fonts,images}}

# Create Supabase client
cat > src/lib/supabase.ts << 'EOF'
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
EOF

# Create theme constants
cat > src/constants/theme.ts << 'EOF'
export const colors = {
  primary: "#3B82F6",
  secondary: "#6B7280",
  background: "#FFFFFF",
  surface: "#F8F9FA",
  text: "#1A1A1A",
  muted: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48,
} as const;

export const radius = {
  sm: 6, md: 8, lg: 12, xl: 16, full: 9999,
} as const;
EOF

# Create .env.example
cat > .env.example << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_URL=
EOF

# Create EAS config
cat > eas.json << 'EOF'
{
  "cli": { "version": ">= 14.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
EOF

# Initialize git
git init
git add -A
git commit -m "feat: initial Expo scaffold from POSTCABINETS Dev Kit"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  $PROJECT_NAME (Expo) created!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. Fill in .env with your Supabase keys"
echo "  3. Edit docs/prd.md with your product requirements"
echo "  4. Edit .mcp.json with your credentials"
echo "  5. Open Claude Code: claude"
echo "  6. Paste Phase 1 prompt from docs/phase-prompts.md"
echo ""
