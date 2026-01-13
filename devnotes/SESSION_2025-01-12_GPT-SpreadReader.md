# Session Notes: January 12, 2025

## Summary
Designed a GPT-based spread reader feature and supporting infrastructure.

---

## Completed

### 1. Feature Request Document: "One TED Talk Per Reading"
**Saved to:** `devnotes/FRD.OneTalkPerReading.md` (user copied manually)

Key decisions made:
- **Trigger:** "Read My Spread" button appears after 2+ cards revealed
- **Positioning Framework:** Aware Self / Supporting Shadow / Emerging Path (not past/present/future)
- **AI Strategy:** Ultra-free architecture using scoring algorithm + curated rationales (no per-request LLM costs)
- **Re-reading:** One reading per spread only
- **UI:** Subtle text link, not intrusive like "Draw New Cards" button

### 2. GPT Creator Instructions
**Saved to:** Plan file contains full instructions at `/home/brett/.claude/plans/recursive-finding-sketch.md`

Includes:
- GPT name: "TarotTALKS Spread Reader"
- Full system prompt with reading style, position meanings, example interaction
- 4 conversation starters
- Capabilities to enable (Web Browsing, Image Upload)
- Knowledge files recommendations

### 3. Privacy Policy Page
**Created:** `app/privacy/page.tsx`
**Live at:** https://tarottalks.app/privacy

Covers:
- Anonymous analytics
- Session storage (30-min expiry)
- No account required
- Third-party services (TED, YouTube, Vercel, GPT)
- What we don't do (no selling data, no ad tracking)

---

## Explored but Not Implemented

### 4. GPT Action / API Endpoint
Two approaches were explored for connecting the GPT to the database:

**Option A: Direct Supabase REST API**
- Uses PostgREST with `anon` key
- OpenAPI schema provided but not configured

**Option B: Custom Next.js API Endpoint** (plan drafted)
- `GET /api/gpt/cards?slugs=the-tower,the-star`
- Rate limited, cached, CORS-enabled
- Full implementation code in plan file

**Status:** User chose to manually configure GPT for now. Can revisit API endpoint later.

---

## Files Created/Modified This Session

| File | Status |
|------|--------|
| `app/privacy/page.tsx` | Created |
| `devnotes/FRD.OneTalkPerReading.md` | User saved separately |
| `/home/brett/.claude/plans/recursive-finding-sketch.md` | Contains GPT instructions + API plan |

---

## Next Steps (When Ready)

1. **Configure GPT manually** — User is doing this now
2. **Consider API endpoint** — If direct Supabase doesn't work well, implement `/api/gpt/cards`
3. **Data enrichment** — For full "One TED Talk Per Reading" feature:
   - Add `themes_json` to cards and talks tables
   - Add positional meanings to cards
   - Run one-time AI script to generate themes

---

## Key Design Insight

> "The AI is in the curation, not the API calls."

The card-talk mappings already contain wisdom through `rationaleShort` and `strength` ratings. A smart scoring algorithm can synthesize spreads without expensive per-request LLM calls.
