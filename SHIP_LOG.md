# 🚢 TarotTALKS Ship Log

A chronological record of major releases and feature deployments for TarotTALKS.

> **Note:** Each version has its own detailed release notes in [`devnotes/releases/`](devnotes/releases/).

---

## Pending for Next Release

Features and changes staged for the next version:

- **Talk Social Share Images (v1.3.5)**: Dynamic OG images for talk pages
  - Large talk thumbnail (700x394) spanning left side
  - Card image overlaying bottom-right corner with drop shadow
  - Title and speaker aligned at top right
  - Full rationale text positioned right of card
  - OpenDyslexic fonts + sparkle background effects
  - Preview page at `/preview/talk-share`
  - Files: `app/talks/[slug]/opengraph-image.tsx`, `app/talks/[slug]/twitter-image.tsx`

- **Enhanced Card Social Share Images (v1.3.4)**: Major upgrade to card OG images
  - Layout A3: Brand top-left, talk thumbnail bottom-left, card info right-justified
  - Primary talk integration: Shows mapped TED talk thumbnail, title, and speaker
  - OpenDyslexic font for accessibility
  - Time-seeded starfield: Unique sparkle pattern on every load (Date.now() seed)
  - 80px bottom safe buffer for Twitter/platform overlays
  - **Critical fix**: Resolved metadata inheritance bug preventing images from appearing on Twitter/BlueSky
  - **Preview page**: Added `/preview/card-share` for testing OG image generation
  - Files: `app/cards/[slug]/twitter-image.tsx`, `app/cards/[slug]/opengraph-image.tsx`, `app/cards/[slug]/page.tsx`, `app/preview/card-share/page.tsx`
- **Behavioral Analytics Dashboard**: New `/admin/behavior` page tracking user engagement
  - Events: `session_start`, `card_flip`, `spread_ready`, `read_spread_click`, `talk_click`, `card_detail_click`
  - Metrics: Sessions, bounce rate, time to first flip, flip distribution, landing funnel, Read My Spread CTR, device breakdown
  - Zero-cost: Uses existing Vercel Postgres with batched event ingestion
  - Files: `lib/hooks/useAnalytics.ts`, `app/api/events/route.ts`, `app/admin/behavior/page.tsx`, `lib/db/queries/admin-behavior.ts`
- **Read My Spread Button**: New button appears when 2+ cards are revealed, links to TarotTALKS Spread Reader GPT
- **Spread Share Modal**: Mobile-friendly modal for copying spread data before opening GPT
  - Mobile: Auto-copies spread text ("Aware Self: X, Supporting Shadow: Y, Emerging Path: Z")
  - Desktop: Optional checkbox to copy text (for users who already took a screenshot)
- **Buy Me a Coffee**: Support message and button added to landing page bottom
  - "Free forever. No ads. Help keep it alive..." with link to Buy Me a Coffee
- **Linktree Icon**: Added standalone SVG icon for external profile links (`public/linktree-icon.svg`)
- **Files changed**: `app/page.tsx`, `components/ritual/CardCascade.tsx`, `components/ritual/SpreadShareModal.tsx` (new)

---

## Recent Releases

| Version | Title | Date |
|---------|-------|------|
| [v1.3.3](devnotes/releases/v1.3.3.md) | Branded Social Card Images 🎴 | Jan 29, 2026 |
| [v1.3.2](devnotes/releases/v1.3.2.md) | Security Patch: React Server Components 🔒 | Jan 12, 2026 |
| [v1.3.1](devnotes/releases/v1.3.1.md) | Admin Portal Improvements 🔧 | Jan 10, 2026 |
| [v1.3.0](devnotes/releases/v1.3.0.md) | TarotTALKS Rebrand 🎨 | Jan 9, 2026 |
| [v1.2.2](devnotes/releases/v1.2.2.md) | PWA Share Button + Dynamic OG Images 📤 | Jan 5, 2026 |
| [v1.2.1](devnotes/releases/v1.2.1.md) | Zero-Cost Image Delivery + Social Sharing 🖼️ | Jan 5, 2026 |
| [v1.2.0](devnotes/releases/v1.2.0.md) | Home Screen Ready 📱 | Jan 5, 2026 |
| [v1.1.4](devnotes/releases/v1.1.4.md) | Ritual State Preservation 🔮 | Jan 4, 2026 |
| [v1.1.3](devnotes/releases/v1.1.3.md) | Landing Page Mobile QOL Improvements 📱 | Jan 3, 2026 |
| [v1.1.2](devnotes/releases/v1.1.2.md) | Ritual-First Landing Page 🔮 | Dec 31, 2025 |

---

## All Releases

### 1.x Series (Current)

| Version | Title | Date |
|---------|-------|------|
| [v1.3.3](devnotes/releases/v1.3.3.md) | Branded Social Card Images 🎴 | Jan 29, 2026 |
| [v1.3.2](devnotes/releases/v1.3.2.md) | Security Patch: React Server Components 🔒 | Jan 12, 2026 |
| [v1.3.1](devnotes/releases/v1.3.1.md) | Admin Portal Improvements 🔧 | Jan 10, 2026 |
| [v1.3.0](devnotes/releases/v1.3.0.md) | TarotTALKS Rebrand 🎨 | Jan 9, 2026 |
| [v1.2.2](devnotes/releases/v1.2.2.md) | PWA Share Button + Dynamic OG Images 📤 | Jan 5, 2026 |
| [v1.2.1](devnotes/releases/v1.2.1.md) | Zero-Cost Image Delivery + Social Sharing 🖼️ | Jan 5, 2026 |
| [v1.2.0](devnotes/releases/v1.2.0.md) | Home Screen Ready 📱 | Jan 5, 2026 |
| [v1.1.4](devnotes/releases/v1.1.4.md) | Ritual State Preservation 🔮 | Jan 4, 2026 |
| [v1.1.3](devnotes/releases/v1.1.3.md) | Landing Page Mobile QOL Improvements 📱 | Jan 3, 2026 |
| [v1.1.2](devnotes/releases/v1.1.2.md) | Ritual-First Landing Page 🔮 | Dec 31, 2025 |
| [v1.1.0](devnotes/releases/v1.1.0.md) | YouTube API Integration & Metadata Enhancement | Dec 11, 2025 |
| [v1.0.6](devnotes/releases/v1.0.6.md) | Admin Portal Enhancement & UX Improvements ⚡ | Dec 28, 2024 |
| [v1.0.5](devnotes/releases/v1.0.5.md) | Supabase Storage Integration ☁️ | Dec 26, 2024 |
| [v1.0.4](devnotes/releases/v1.0.4.md) | Local Image Storage & Admin UX Improvements 🖼️ | Dec 25, 2024 |
| [v1.0.2](devnotes/releases/v1.0.2.md) | Security Hardening & Performance Optimization 🔒 | Dec 24, 2024 |
| [v1.0.1](devnotes/releases/v1.0.1.md) | Analytics & Production Polish 📊 | Dec 23, 2024 |
| [v1.0.0](devnotes/releases/v1.0.0.md) | Initial Launch 🎉 | Dec 11, 2025 |

### 0.x Series (Pre-release)

| Version | Title | Date |
|---------|-------|------|
| [v0.3.0](devnotes/releases/v0.3.0.md) | Advanced Search & Inline Validation Fixes 🔍 | Dec 22, 2024 |
| [v0.2.0](devnotes/releases/v0.2.0.md) | Admin Portal & Data Management 🛠️ | Dec 22, 2024 |
| [v0.1.0](devnotes/releases/v0.1.0.md) | Initial Public Prototype 🎉 | Dec 20, 2024 |
| [v0.0.3](devnotes/releases/v0.0.3.md) | Complete Metadata & Upsert Workflows | Dec 12, 2025 |

---

## Archive

Duplicate/superseded release notes are stored in [`devnotes/releases/archive/`](devnotes/releases/archive/).
