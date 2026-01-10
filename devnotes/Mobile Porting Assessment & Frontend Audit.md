Mobile Porting Assessment & Frontend Audit

  Current Architecture Summary

  | Layer     | Technology                                | Mobile Portability                           |
  |-----------|-------------------------------------------|----------------------------------------------|
  | Framework | Next.js 15 + React 19                     | ❌ Web-only (must rebuild UI)                |
  | Styling   | Tailwind CSS + custom animations          | ⚠️ Partial (need platform alternatives)      |
  | State     | React hooks + sessionStorage/localStorage | ✅ Hooks portable; storage needs abstraction |
  | API       | REST endpoints (/api/*)                   | ✅ Fully reusable as-is                      |
  | Database  | Supabase PostgreSQL + Drizzle ORM         | ✅ Fully reusable                            |
  | Audio     | HTMLAudioElement + AudioContext           | ❌ Needs native replacement                  |
  | Assets    | /public/sounds/, Supabase storage         | ✅ Bundleable or fetch from same CDN         |

  ---
  Porting Options (Ranked by Ease)

  Option 1: Progressive Web App (PWA) — Easiest

  Keep the webapp, add installability.
  - Add service worker, manifest.json, offline caching
  - Users "Add to Home Screen" on iOS/Android
  - Pro: Zero code changes to core app
  - Con: Limited native features, no App Store presence, iOS PWA limitations

  Option 2: Capacitor (Ionic) — Low Effort

  Wrap the existing Next.js app in a native shell.
  - Uses WebView to render your existing React code
  - Native plugins for audio, storage, haptics
  - Pro: Reuse 90%+ of existing code
  - Con: WebView performance ceiling, "feels like a website"

  Option 3: React Native + Expo — Moderate Effort ⭐ Recommended

  Rebuild UI with shared API/data layer.
  - Reuse TypeScript types, API contracts, business logic
  - Rebuild components using React Native primitives
  - Expo handles audio, storage, animations natively
  - Pro: True native feel, App Store ready, shared React mental model
  - Con: UI rebuild required (~60% effort of new app)

  Option 4: Flutter — High Effort

  Full rebuild in Dart.
  - Excellent animation and performance
  - Pro: One codebase, iOS + Android, beautiful UX
  - Con: Complete rewrite, different language, no code reuse

  ---
  Recommended Path: React Native + Expo

  This gives you the best balance of code reuse and native experience:

  | What You Keep                 | What You Rebuild                        |
  |-------------------------------|-----------------------------------------|
  | All API endpoints (unchanged) | UI components (React Native primitives) |
  | Database schema & queries     | CSS → StyleSheet/NativeWind             |
  | TypeScript types & interfaces | Animations (Reanimated or Moti)         |
  | Business logic in hooks       | Audio (expo-av)                         |
  | Supabase integration          | Navigation (React Navigation)           |
  | Admin portal (stays web-only) | Storage (AsyncStorage/SecureStore)      |

  ---
  Preparation Steps for Mobile Port

  Phase 1: API Extraction (1-2 days)

  1. Create standalone API documentation - Document all /api/* endpoints with request/response types
  2. Add CORS for mobile - Update next.config.ts to allow requests from mobile app origins
  3. Consider hosting API separately - If needed, extract to standalone Express/Fastify server (optional)

  Phase 2: Abstract Platform-Specific Code (1 day)

  1. Create abstraction interfaces in shared types:
  // lib/platform/storage.ts
  interface StorageAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
  }

  // lib/platform/audio.ts
  interface AudioAdapter {
    preload(sounds: string[]): Promise<void>;
    play(sound: string): Promise<void>;
    setMuted(muted: boolean): void;
  }
  2. Refactor hooks to accept adapters:
  // Web implementation uses localStorage
  // Native implementation uses AsyncStorage

  Phase 3: Asset Preparation (1 day)

  1. Audio files - Already in /public/sounds/, copy to mobile bundle
  2. Card back image - Already WebP, may need PNG fallback
  3. Font handling - Ensure any custom fonts are bundled
  4. Image URLs - Supabase storage URLs work cross-platform

  Phase 4: Type Extraction (1 day)

  1. Extract shared types to standalone package:
  packages/
  └── shared-types/
      ├── card.ts
      ├── talk.ts
      ├── mapping.ts
      ├── theme.ts
      └── api.ts
  2. API response types - Ensure mobile app uses identical types

  Phase 5: Mobile App Scaffold (Expo + React Native)

  1. npx create-expo-app tarottalks-mobile --template tabs
  2. Install dependencies:
    - expo-av (audio)
    - @react-native-async-storage/async-storage
    - react-native-reanimated (animations)
    - nativewind (Tailwind for RN) or StyleSheet
  3. Copy TypeScript types from shared package

  Phase 6: Component Port (Main Effort)

  | Web Component         | React Native Equivalent                     |
  |-----------------------|---------------------------------------------|
  | CardCascade.tsx       | CardCascade.tsx (rewrite with Animated API) |
  | RitualCard.tsx        | Use react-native-reanimated for 3D flip     |
  | SparkleBackground.tsx | Use Skia or SVG for particle effects        |
  | BottomNav.tsx         | React Navigation bottom tabs                |
  | CardsGrid.tsx         | FlatList with grid layout                   |
  | Tailwind classes      | NativeWind or StyleSheet                    |

  ---
  Quick Reference: Critical Files to Port

  REUSE (API layer stays on web):
  ├── app/api/ritual-cards/route.ts     ✅ Keep serving mobile requests
  ├── app/api/search/route.ts           ✅ Keep serving mobile requests
  ├── lib/db/schema.ts                  ✅ Copy types to shared package
  ├── lib/db/queries/*.ts               ✅ Stay server-side
  └── Supabase storage                  ✅ URLs work everywhere

  REBUILD (client-side for mobile):
  ├── components/ritual/*               🔄 Core ritual experience
  ├── components/cards/*                🔄 Card views
  ├── components/talks/*                🔄 Talk views
  ├── lib/hooks/useCardSounds.ts        🔄 Replace with expo-av
  ├── lib/hooks/useRitualState.ts       🔄 Replace with AsyncStorage
  └── app/globals.css                   🔄 Animations to Reanimated

  ---
  Summary

  | Approach     | Effort   | Native Feel | Code Reuse | App Store |
  |--------------|----------|-------------|------------|-----------|
  | PWA          | ⭐       | ❌          | 100%       | ❌        |
  | Capacitor    | ⭐⭐     | ⚠️          | 90%        | ✅        |
  | React Native | ⭐⭐⭐   | ✅          | 40-50%     | ✅        |
  | Flutter      | ⭐⭐⭐⭐ | ✅          | 10%        | ✅        |

  My recommendation: Start with Capacitor for quick App Store presence, then migrate to React Native if you need better performance or native features. Your admin portal stays exactly as-is on the web.
