#!/bin/bash
# ============================================================
# Web SaaS Project Scaffolder
# Usage: bash web-saas/scaffold.sh <project-name>
# ============================================================

set -e

PROJECT_NAME="${1:?Usage: bash web-saas/scaffold.sh <project-name>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Creating Web SaaS project: $PROJECT_NAME"

# Create Next.js project
npx create-next-app@latest "$PROJECT_NAME" \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --import-alias "@/*" \
    --use-npm

cd "$PROJECT_NAME"

# Install dependencies
npm install @clerk/nextjs @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright @playwright/test

# Initialize shadcn/ui
npx shadcn@latest init -y

# Copy CLAUDE.md files
cp "$KIT_DIR/shared/CLAUDE.md" ./CLAUDE.md
cat "$SCRIPT_DIR/CLAUDE.md" >> ./CLAUDE.md

# Copy MCP config
cp "$SCRIPT_DIR/.mcp.json" ./.mcp.json

# Create docs directory with templates
mkdir -p docs supabase/migrations
cp "$KIT_DIR/shared/templates/design.md" ./docs/design.md
cp "$KIT_DIR/shared/templates/prd.md" ./docs/prd.md
cp "$KIT_DIR/shared/templates/schema.sql" ./supabase/migrations/00001_initial_schema.sql
cp "$KIT_DIR/shared/prompts/phase-prompts.md" ./docs/phase-prompts.md

# Create directory structure
mkdir -p src/{components/{ui,features},lib/{supabase,stripe},hooks,types}
mkdir -p src/app/{api/{webhooks/{clerk,stripe},stripe/{checkout,portal}},'(marketing)','(auth)/{sign-in/[[...sign-in]],sign-up/[[...sign-up]]}','(dashboard)/{dashboard,settings}'}

# Create .env.example
cat > .env.example << 'EOF'
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

cp .env.example .env.local

# Create lib/utils.ts (cn helper)
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

# Create Supabase client files
cat > src/lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
EOF

cat > src/lib/supabase/server.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Server Component */ }
        },
      },
    }
  );
}
EOF

# Initialize git
git init
git add -A
git commit -m "feat: initial scaffold from POSTCABINETS Dev Kit"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  $PROJECT_NAME created!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. Fill in .env.local with your API keys"
echo "  3. Edit docs/prd.md with your product requirements"
echo "  4. Edit .mcp.json with your Supabase/GitHub/Figma credentials"
echo "  5. Open Claude Code: claude"
echo "  6. Paste Phase 1 prompt from docs/phase-prompts.md"
echo ""
