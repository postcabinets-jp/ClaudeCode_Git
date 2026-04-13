# Design Specification

> このファイルを埋めてからClaude Codeに渡す。空欄は Claude に「この部分を提案して」と依頼可能。

## Product Overview

- **Product name**: 
- **One-line description**: 
- **Target user**: 
- **Core value proposition**: 

## Design Tokens

### Colors
```
primary:    #           (メインアクション、CTA)
secondary:  #           (サブアクション)
accent:     #           (ハイライト)
background: #FFFFFF     (ベース背景)
surface:    #F8F9FA     (カード背景)
text:       #1A1A1A     (本文)
muted:      #6B7280     (補助テキスト)
border:     #E5E7EB     (ボーダー)
error:      #EF4444
success:    #22C55E
warning:    #F59E0B
```

### Typography
```
font-family: "Inter", "Noto Sans JP", sans-serif
heading-1:   32px / 700 / 1.2
heading-2:   24px / 600 / 1.3
heading-3:   20px / 600 / 1.4
body:        16px / 400 / 1.6
caption:     14px / 400 / 1.5
small:       12px / 400 / 1.5
```

### Spacing
```
xs: 4px    sm: 8px    md: 16px    lg: 24px    xl: 32px    2xl: 48px
```

### Border Radius
```
sm: 6px    md: 8px    lg: 12px    xl: 16px    full: 9999px
```

## Screens

### 1. Landing Page (`/`)
- **Purpose**: 新規ユーザー獲得
- **Components**:
  - Hero section (headline, subtitle, CTA button)
  - Features grid (3-4 features with icons)
  - Pricing table
  - Footer
- **Notes**: 

### 2. Auth (`/sign-in`, `/sign-up`)
- **Purpose**: 認証
- **Components**:
  - Clerk <SignIn /> / <SignUp /> component
  - Or custom form if not using Clerk
- **Notes**: 

### 3. Dashboard (`/dashboard`)
- **Purpose**: メインワークスペース
- **Components**:
  - Sidebar navigation
  - Header with user menu
  - Main content area
  - Stats cards (if applicable)
- **Notes**: 

### 4. Settings (`/settings`)
- **Purpose**: アカウント・プラン管理
- **Components**:
  - Profile form
  - Plan/billing section (Stripe portal link)
  - Notification preferences
- **Notes**: 

<!-- 追加画面はここに記述 -->

## Component Library

Using `shadcn/ui` as base. Custom components:

| Component | Description | Used in |
|-----------|-------------|---------|
| `<AppSidebar>` | メインナビゲーション | Dashboard, Settings |
| `<StatsCard>` | 数値表示カード | Dashboard |
| `<PricingTable>` | 料金プラン表 | Landing, Settings |

## Responsive Breakpoints

```
mobile:  < 768px   (1 column, bottom nav)
tablet:  768-1024px (2 column, sidebar collapsed)
desktop: > 1024px  (full layout, sidebar expanded)
```

## Accessibility Requirements

- All interactive elements keyboard accessible
- Color contrast ratio ≥ 4.5:1
- Alt text on all images
- Form labels on all inputs
- Focus indicators visible
