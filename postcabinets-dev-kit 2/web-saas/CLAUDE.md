# CLAUDE.md - Web SaaS Project

> This file extends the shared CLAUDE.md. Both files are active.
> If there's a conflict, this file takes precedence.

## Tech Stack (Web SaaS)

- **Framework**: Next.js 15+ (App Router, Server Components default)
- **Language**: TypeScript (strict)
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL + Realtime + Edge Functions)
- **Payments**: Stripe (Checkout + Customer Portal + Webhooks)
- **Email**: Resend
- **Hosting**: Vercel
- **Testing**: Vitest (unit) + Playwright (E2E)

## Directory Structure (Web SaaS)

```
src/
├── app/
│   ├── (marketing)/         # Landing, pricing (public)
│   │   ├── page.tsx
│   │   └── pricing/page.tsx
│   ├── (auth)/              # Sign in/up (public)
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/         # Protected app pages
│   │   ├── layout.tsx       # Sidebar + auth check
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/route.ts
│   │   │   └── stripe/route.ts
│   │   └── stripe/
│   │       ├── checkout/route.ts
│   │       └── portal/route.ts
│   ├── layout.tsx           # Root: ClerkProvider, fonts, metadata
│   └── globals.css
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── features/            # App-specific components
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client (with cookies)
│   │   └── admin.ts         # Service role client (webhooks only)
│   ├── stripe/
│   │   ├── client.ts
│   │   └── plans.ts
│   └── utils.ts             # cn() helper, etc.
├── hooks/
├── types/
│   └── database.ts          # Auto-generated from Supabase
└── middleware.ts             # Clerk auth middleware
```

## Route Groups

- `(marketing)` — Public pages, no auth required. Server-rendered, SEO optimized.
- `(auth)` — Clerk pages. Redirect to dashboard if already signed in.
- `(dashboard)` — Protected. Redirect to sign-in if not authenticated.

## Middleware Pattern

```typescript
// middleware.ts — Clerk protects (dashboard) routes
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/settings(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

## Environment Variables Required

```env
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
```

## Deployment Checklist (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Set all env vars in Vercel dashboard
4. Configure Clerk webhook: `https://your-app.vercel.app/api/webhooks/clerk`
5. Configure Stripe webhook: `https://your-app.vercel.app/api/webhooks/stripe`
6. Verify Supabase RLS policies are active
