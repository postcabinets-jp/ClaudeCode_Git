# CLAUDE.md - Android / Cross-Platform App Project

> This file extends the shared CLAUDE.md. Both files are active.

## Tech Stack (Android / Cross-Platform)

- **Framework**: Expo (React Native) with Expo Router
- **Language**: TypeScript (strict)
- **UI**: NativeWind (Tailwind for React Native) + custom components
- **Backend**: Supabase (via @supabase/supabase-js)
- **Auth**: Supabase Auth (email + Google)
- **Payments**: Expo In-App Purchases (RevenueCat) or Stripe web checkout
- **Minimum Target**: Android 13 (API 33) / iOS 16
- **Testing**: Jest + Detox (E2E)
- **Build**: EAS Build

## Directory Structure (Expo)

```
src/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/            # Tab navigation group
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── settings.tsx
│   │   └── _layout.tsx    # Tab bar config
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── _layout.tsx        # Root layout (providers)
│   └── +not-found.tsx
├── components/
│   ├── ui/                # Reusable primitives
│   └── features/          # Feature-specific components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── auth.tsx           # Auth context + hooks
│   └── utils.ts
├── hooks/
├── types/
│   └── database.ts        # Supabase generated types
├── constants/
│   └── theme.ts           # Colors, fonts, spacing
└── assets/
    ├── fonts/
    └── images/
```

## React Native Conventions

- Use `expo-router` for all navigation (file-based routing)
- NativeWind className for styling: `<View className="flex-1 bg-white p-4">`
- No inline styles unless dynamic values
- Use `expo-secure-store` for sensitive data (tokens)
- Use `expo-image` instead of `<Image>` for performance
- Async storage for non-sensitive preferences only

## Supabase Setup (Expo)

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Database } from "@/types/database";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(
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
```

## MCP Visual Loop (Android)

After every UI change:
1. Start Expo dev server (`npx expo start`)
2. Use `android` MCP: Take screenshot from emulator
3. Compare with docs/design.md
4. Fix and repeat

## Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_URL=
```

## Build & Deploy

```bash
# Development
npx expo start

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Store Checklist

### Google Play
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone + tablet)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Japanese store listing

### App Store
- [ ] App icon (1024x1024)
- [ ] Screenshots (6.7", 6.5", 5.5")
- [ ] Privacy policy URL
- [ ] App Review information
- [ ] Japanese localization
