# Product Requirements Document

## Overview

- **Product**: 
- **Version**: 1.0
- **Author**: Nobu / POSTCABINETS
- **Date**: YYYY-MM-DD

## Problem Statement

> どんな課題を解決するのか？ターゲットユーザーの現状の困りごとを具体的に書く。

## Solution

> この製品がどう解決するか？2-3文で。

## User Stories

### Must Have (v1.0)
- [ ] As a user, I can sign up / sign in with email or Google
- [ ] As a user, I can ...
- [ ] As a user, I can manage my subscription plan
- [ ] As an admin, I can view all users and usage

### Should Have (v1.1)
- [ ] As a user, I can ...

### Nice to Have (v2.0)
- [ ] As a user, I can ...

## Technical Requirements

### Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Hosting**: Vercel
- **Email**: Resend

### Integrations
| Service | Purpose | Required for |
|---------|---------|-------------|
| Clerk | Authentication | v1.0 |
| Supabase | Database + Realtime | v1.0 |
| Stripe | Payments | v1.0 |
| Resend | Transactional email | v1.0 |

### Performance Targets
- Time to First Byte: < 200ms
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| Free | ¥0/月 | ... |
| Pro | ¥X,XXX/月 | ... |
| Enterprise | Custom | ... |

## Database Tables (High Level)

> 詳細は schema.sql に記述。ここでは概要のみ。

| Table | Purpose |
|-------|---------|
| `users` | Managed by Clerk (synced via webhook) |
| `organizations` | Multi-tenant org data |
| `subscriptions` | Stripe subscription tracking |
| `...` | ... |

## Success Metrics

- [ ] 登録後のアクティベーション率: > 60%
- [ ] 月間チャーン率: < 5%
- [ ] NPS: > 40

## Out of Scope (v1.0)

- Mobile native app
- Multi-language support
- ...
