# CLAUDE.md - POSTCABINETS Dev Kit (Shared Core)

## Identity

You are the development agent for POSTCABINETS projects. You build production-grade applications following these rules strictly.

## Language

- Code: English (variable names, comments, commit messages)
- UI text / copy: Japanese (unless specified otherwise)
- This file: English (for Claude Code compatibility)

## Core Principles

1. **One feature per session.** Complete implementation + test before moving to the next feature.
2. **Never modify architecture without asking.** If you think the directory structure, DB schema, or tech stack should change, explain why and wait for approval.
3. **Read before writing.** Always read existing files before editing. Never assume file contents.
4. **Test what you build.** Every feature must have at least one test. Use the appropriate MCP tool to verify visually when possible.
5. **Commit atomically.** One feature = one commit. Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`.

## Project Structure Convention

```
src/
├── app/                  # Routes / pages
├── components/
│   ├── ui/              # Reusable primitives (Button, Input, Card)
│   └── features/        # Feature-specific composed components
├── lib/
│   ├── supabase/        # Supabase client, types, helpers
│   ├── stripe/          # Stripe helpers
│   └── utils/           # Pure utility functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── styles/              # Global styles only
```

## Coding Standards

### TypeScript
- Strict mode always (`"strict": true`)
- No `any` — use `unknown` and narrow with type guards
- Prefer `interface` for object shapes, `type` for unions/intersections
- Export types from a central `types/` directory

### React / Next.js
- Server Components by default. Add `"use client"` only when needed (hooks, events, browser APIs)
- Use `shadcn/ui` components as base — don't reinvent
- Tailwind CSS for styling — no CSS modules, no styled-components
- `cn()` helper (from `lib/utils`) for conditional classes

### Database (Supabase)
- All schema changes via migration files: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- Always enable RLS on new tables
- Use Supabase generated types: `supabase gen types typescript --project-id $REF > src/types/database.ts`
- Never expose service_role key to client

### Naming
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- DB tables: `snake_case` (plural)
- DB columns: `snake_case`

## MCP Tool Usage

You have access to these MCP servers. Use them proactively:

| Server | When to use |
|--------|------------|
| `supabase` | DB queries, migrations, edge functions, checking table structure |
| `playwright` | Visual verification of UI, E2E testing, screenshot comparison |
| `github` | Creating issues, PRs, checking CI status |
| `figma` | Pulling design tokens, component specs, layout info |
| `context7` | Looking up latest API docs for any library |
| `xcode` | Building, testing, deploying iOS apps (iOS projects only) |
| `ios-sim` | Screenshots, tap/swipe on iOS simulator (iOS projects only) |
| `android` | Android emulator interaction (Android projects only) |
| `thinking` | Complex architectural decisions, multi-step reasoning |

### Visual Verification Loop
After implementing any UI change:
1. Use `playwright` (web) or `xcode`/`ios-sim`/`android` (mobile) to take a screenshot
2. Compare against the design spec in `docs/design.md`
3. Fix discrepancies automatically
4. Take another screenshot to confirm

## File References

- `docs/design.md` — UI specification and design tokens
- `docs/prd.md` — Product requirements document
- `supabase/seed.sql` — Seed data for development
- `supabase/migrations/` — Database migration files
- `.env.local` — Environment variables (NEVER commit this)

## Error Handling

- Use `try/catch` with specific error types
- User-facing errors: Japanese, friendly, actionable
- Log errors: English, structured, include context
- Never swallow errors silently

## Security Checklist (verify before committing)

- [ ] No secrets in code or commits
- [ ] RLS policies on all Supabase tables
- [ ] Input validation on all user inputs
- [ ] CSRF protection on mutations
- [ ] Rate limiting on API routes
