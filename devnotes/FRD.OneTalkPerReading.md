 Feature Request Document: One TED Talk Per Reading

 Overview

 Feature Name: One TED Talk Per Reading
 Priority: Enhancement
 Status: Draft for Review

 Elevator Pitch

 After revealing 2+ cards in their spread, users can optionally ask a question and receive a single,
 curated TED or TED-like talk recommendation that synthesizes the meaning of their entire spread—not just
 individual cards, but the story they tell together.

 ---
 Problem Statement

 Currently, each card in the ritual displays its own primary TED talk mapping. While useful, this
 approach:
 - Treats cards as isolated entities rather than a cohesive narrative
 - Doesn't account for the relationships between cards in a spread
 - Misses the opportunity for personalized guidance based on what the user is actually seeking
 - Provides 3 separate recommendations when users may want one decisive action

 The Tarot reading experience is about synthesis—the cards speak to each other. This feature honors
 that tradition.

 ---
 Feature Specification

 Trigger Condition

 A new "Read My Spread" button appears when:
 - Minimum 2 cards are revealed (positions 0+1, or 0+2, or 1+2, or all three)
 - Button remains available after all 3 cards are revealed

 User Flow

 [User reveals 2+ cards]
         ↓
 [Subtle "Read My Spread" text-link appears below cards]
         ↓
 [User taps → Modal/drawer opens with optional question field]
         ↓
 [User optionally types: "I'm struggling with a career decision"]
         ↓
 [User taps "Find My Talk" → Loading state with mystical copy]
         ↓
 [AI analyzes: cards + positions + question + talk database]
         ↓
 [Single TED or TED-like talk recommendation with personalized rationale]

 Non-Intrusiveness Requirement

 The "Draw New Cards" button is described as intrusive because it:
 - Uses prominent button styling (px-6 py-3, icon + text)
 - Appears with noticeable animation
 - Commands attention after ritual completion

 "Read My Spread" should be the opposite:
 - Styled as a subtle text link, not a button
 - Uses muted gray color (text-gray-400) with gentle hover state
 - Positioned above the Draw New Cards button (or in a separate visual zone)
 - Appears with a fade-in only (no translate/slide)
 - Optional sparkle icon (✨) or subtle indicator

 Suggested styling:
 <button className="text-gray-400 hover:text-gray-200 text-sm transition-colors">
   ✨ Read My Spread
 </button>

 ---
 Technical Architecture

 Component Structure

 components/ritual/
 ├── CardCascade.tsx          # Add spread reading trigger
 ├── SpreadReading/
 │   ├── SpreadReadingTrigger.tsx    # Subtle text-link button
 │   ├── SpreadReadingModal.tsx      # Question input + submission
 │   ├── SpreadReadingResult.tsx     # AI recommendation display
 │   └── index.ts

 New API Endpoint

 POST /api/spread-reading

 Request:
 {
   "cards": [
     { "slug": "the-tower", "position": "aware_self" },
     { "slug": "the-star", "position": "supporting_shadow" },
     { "slug": "the-fool", "position": "emerging_path" }
   ],
   "question": "How do I navigate this career transition?"  // optional
 }

 Response:
 {
   "talk": {
     "id": "uuid",
     "title": "How to make hard choices",
     "speaker": "Ruth Chang",
     "slug": "ruth-chang-how-to-make-hard-choices",
     "thumbnailUrl": "...",
     "duration": 890,
     "tedUrl": "..."
   },
   "rationale": "How to make hard choices by Ruth Chang speaks to the heart of your spread. The Tower
 in your Aware Self reveals what you already know: something has shifted dramatically. The Star as
 your Supporting Shadow whispers of hope you may not yet see. And The Fool in your Emerging Path
 invites you to leap. This talk offers a framework for seeing your crossroads not as a problem to
 solve, but as an opportunity to define who you are.",
   "score": 28,
   "matchReasons": [
     { "type": "multi_card", "description": "Connects to 2 cards in your spread" },
     { "type": "theme_overlap", "themes": ["transformation", "decision-making"] }
   ]
 }

 ---
 AI System Design

 Constraint: Ultra-Free Architecture

 The system must be cost-free while still feeling intelligent. This rules out per-request LLM API
 calls. Instead, we'll build a knowledge-rich scoring engine that leverages the existing curated data.

 The Intelligence Engine: Semantic Scoring + Curated Rationales

 The "AI" lives in the curation, not the API calls. Here's how:

 Step 1: Enrich the Database (One-Time Investment)

 Expand card and talk metadata to enable intelligent matching:

 // Enhanced cards table additions
 cards: {
   // Existing: name, keywords, meanings, journaling_prompts

   // New: Positional meanings for the 3-position spread
   meaning_aware_self: text,       // "Aware Self" position interpretation
   meaning_supporting_shadow: text, // "Supporting Shadow" position interpretation
   meaning_emerging_path: text,     // "Emerging Path" position interpretation

   // New: Thematic tags for cross-card synthesis
   themes_json: jsonb,  // ["transformation", "crisis", "breakthrough", "resilience"]
   archetypes_json: jsonb, // ["destroyer", "liberator", "truth-teller"]
 }

 // Enhanced talks table additions
 talks: {
   // Existing: title, speaker, duration, thumbnail_url

   // New: Thematic tags mirroring card themes
   themes_json: jsonb,  // ["change", "courage", "decision-making"]
   core_message: text,  // 1-2 sentence distillation
 }

 // Enhanced mappings: pre-written synthesis rationales
 card_talk_mappings: {
   // Existing: strength, rationale_short, rationale_long

   // New: Position-specific rationales (optional, for key pairings)
   rationale_aware_self: text,
   rationale_supporting_shadow: text,
   rationale_emerging_path: text,
 }

 This data comes from:
 - Tarot bibliography knowledge (books you mentioned)
 - Your curatorial expertise (the mappings already have rationales)
 - One-time AI-assisted generation (use Claude/GPT once to generate themes for all 78 cards and all
 talks, then store forever)

 Step 2: The Scoring Algorithm

 // lib/spread-reading/score-talks.ts

 interface ScoredTalk {
   talk: Talk;
   score: number;
   matchReasons: MatchReason[];
 }

 export function scoreTalksForSpread(
   cards: SpreadCard[],        // [{card, position: 'aware_self' | 'supporting_shadow' |
 'emerging_path'}]
   candidateTalks: TalkWithMappings[],
   question?: string
 ): ScoredTalk[] {

   return candidateTalks.map(talk => {
     let score = 0;
     const matchReasons: MatchReason[] = [];

     // 1. MAPPING STRENGTH (0-15 points)
     // Sum of strength ratings for each card this talk maps to
     const mappedCards = talk.mappings.filter(m =>
       cards.some(c => c.card.id === m.cardId)
     );
     const strengthScore = mappedCards.reduce((sum, m) => sum + m.strength, 0);
     score += strengthScore;

     // 2. MULTI-CARD BONUS (0-10 points)
     // Talks that connect multiple cards get bonus
     if (mappedCards.length >= 2) score += 5;
     if (mappedCards.length >= 3) score += 5;  // Rare: talk maps to all 3!

     // 3. THEME OVERLAP (0-10 points)
     // Compare talk.themes_json with combined card themes
     const spreadThemes = new Set(cards.flatMap(c => c.card.themes_json || []));
     const talkThemes = new Set(talk.themes_json || []);
     const themeOverlap = [...spreadThemes].filter(t => talkThemes.has(t)).length;
     score += Math.min(themeOverlap * 2, 10);

     // 4. PRIMARY TALK BONUS (0-3 points)
     // If this talk is primary for any spread card
     if (mappedCards.some(m => m.isPrimary)) score += 3;

     // 5. QUESTION KEYWORD MATCH (0-5 points) - Simple text matching
     if (question) {
       const questionWords = question.toLowerCase().split(/\s+/);
       const talkKeywords = [talk.title, talk.speaker, talk.core_message]
         .join(' ')
         .toLowerCase();
       const keywordMatches = questionWords.filter(w =>
         w.length > 3 && talkKeywords.includes(w)
       ).length;
       score += Math.min(keywordMatches, 5);
     }

     return { talk, score, matchReasons };
   })
   .sort((a, b) => b.score - a.score);
 }

 Step 3: Rationale Generation (Template-Based)

 Pre-build eloquent templates that feel personal:

 // lib/spread-reading/generate-rationale.ts

 export function generateRationale(
   cards: SpreadCard[],
   selectedTalk: Talk,
   mappings: CardTalkMapping[]
 ): string {
   const cardNames = cards.map(c => c.card.name);
   const positions = cards.map(c => POSITION_LABELS[c.position]);

   // Find the strongest connection
   const strongestMapping = mappings
     .filter(m => cards.some(c => c.card.id === m.cardId))
     .sort((a, b) => b.strength - a.strength)[0];

   // Template selection based on spread characteristics
   if (mappings.length >= 2) {
     return TEMPLATES.multiCardConnection(cardNames, selectedTalk, strongestMapping);
   } else if (strongestMapping?.strength >= 4) {
     return TEMPLATES.strongSingleConnection(cards, selectedTalk, strongestMapping);
   } else {
     return TEMPLATES.thematicConnection(cards, selectedTalk);
   }
 }

 const TEMPLATES = {
   multiCardConnection: (cardNames, talk, mapping) =>
     `${talk.title} by ${talk.speaker} speaks to the heart of your spread. ` +
     `${mapping.rationaleShort} ` +
     `As ${cardNames[0]} illuminates your Aware Self and ${cardNames[1]} reveals your Supporting
 Shadow, ` +
     `this talk offers a bridge to the Emerging Path before you.`,

   // ... more templates
 };

 Step 4: Position-Aware Synthesis

 The three positions add narrative structure:
 ┌──────────────────┬──────────────────────────┬─────────────────────────────────────────────────────┐
 │     Position     │           Role           │                 Question It Answers                 │
 ├──────────────────┼──────────────────────────┼─────────────────────────────────────────────────────┤
 │ Aware Self       │ What you consciously     │ "What do I already understand about this            │
 │                  │ know                     │ situation?"                                         │
 ├──────────────────┼──────────────────────────┼─────────────────────────────────────────────────────┤
 │ Supporting       │ Hidden influences        │ "What am I not seeing that's affecting me?"         │
 │ Shadow           │                          │                                                     │
 ├──────────────────┼──────────────────────────┼─────────────────────────────────────────────────────┤
 │ Emerging Path    │ What's becoming possible │ "Where is this leading me?"                         │
 └──────────────────┴──────────────────────────┴─────────────────────────────────────────────────────┘
 The algorithm weights position meanings:
 - If a talk strongly maps to the "Emerging Path" card, it's forward-looking
 - If it maps to "Supporting Shadow," it reveals hidden truths
 - Multi-position matches tell a complete story

 Why This Works Without Per-Request AI

 1. Intelligence is baked in: The curated mappings, themes, and rationales contain your wisdom
 2. Algorithm is the reader: The scoring system mimics how a Tarot reader weighs card interactions
 3. Templates feel personal: Well-written templates with dynamic card names feel crafted
 4. One-time AI investment: Use Claude/GPT once to generate themes and positional meanings for all
 cards, then never pay again

 Future Enhancement: Hybrid Approach

 If budget allows later, add optional LLM enhancement:
 - Cache LLM-generated rationales for common spreads
 - Use LLM only when user provides a question (higher-intent user)
 - Offer "Deep Reading" premium tier with live AI synthesis

 ---
 Database Considerations

 New Query: Get Candidate Talks for Spread

 // lib/db/queries/spread-reading.ts

 export async function getCandidateTalksForSpread(cardSlugs: string[]) {
   // Get all talks mapped to any of the spread cards
   // Include: talk details, mapping strength, rationale_short
   // Deduplicate talks that map to multiple cards (boost their score)
   // Return top 10-15 candidates for LLM consideration
 }

 Consider: Spread-Level Mappings (Future)

 A spread_talk_mappings table could store:
 - Common 2-card or 3-card combinations with pre-curated recommendations
 - Reduces LLM calls for common spreads
 - Enables editorial control over popular combinations

 ---
 UI/UX Details

 Trigger Button Placement

 ┌─────────────────────────────────────────┐
 │                                         │
 │     [Card 1]    [Card 2]    [Card 3]    │
 │                                         │
 │         ✨ Read My Spread               │  ← Subtle text link
 │                                         │
 │         [🔄 Draw New Cards]             │  ← Existing button
 │                                         │
 └─────────────────────────────────────────┘

 Question Input Modal

 Design:
 - Slide-up drawer on mobile, centered modal on desktop
 - Optional—user can submit immediately without typing
 - Placeholder text: "What's on your mind? (optional)"
 - Character limit: 200 characters
 - "Skip & Find My Talk" secondary action

 Copy:
 - Header: "Read Your Spread"
 - Subtext: "The cards have spoken. Add a question to personalize your recommendation, or let the
 spread guide you."

 Result Display

 Design:
 - Full-screen takeover or large modal
 - TED talk thumbnail prominently displayed
 - Synthesized rationale in elegant typography
 - "Watch on TED" primary CTA
 - "Try Another Question" secondary option
 - Dismiss to return to spread

 Loading State:
 - Mystical loading copy: "Consulting the cards...", "Finding your talk...", "The spread reveals..."
 - Animated sparkles or card shuffle effect
 - ~2-4 second expected wait time

 ---
 Cost & Performance

 Runtime Costs: Zero

 With the knowledge-rich scoring approach:
 - No per-request LLM API calls
 - All computation is deterministic and in-memory
 - Response time: <100ms (database query + scoring)

 One-Time Data Enrichment Cost

 - Use Claude/GPT once to generate themes for 78 cards + ~200 talks
 - Estimated: ~$5-10 total (one-time, store forever)
 - Can be done manually with AI assistance over 1-2 sessions

 Rate Limiting (Optional, Abuse Prevention)

 // lib/utils/rate-limit.ts (extend existing)

 const spreadReadingLimiter = new RateLimiter({
   windowMs: 60 * 60 * 1000, // 1 hour
   max: 20, // 20 readings per hour per IP (generous since it's free)
 });

 Caching

 - Deterministic algorithm means identical inputs always produce identical outputs
 - Can cache at CDN level if desired
 - Low priority since computation is cheap

 ---
 Privacy Considerations

 - User questions should NOT be logged with identifying info
 - Consider ephemeral processing—don't store question text
 - If analytics needed, store only: card combinations, had_question (boolean), selected_talk_id

 ---
 Success Metrics

 1. Engagement: % of users who tap "Read My Spread" after revealing 2+ cards
 2. Completion: % who complete the flow (submit question or skip)
 3. Watch Rate: % who click "Watch on TED" from recommendation
 4. Repeat Usage: Users who return and use feature again
 5. Question Usage: % who type a question vs. skip

 ---
 Implementation Phases

 Phase 0: Data Enrichment (Pre-requisite)

 - Add themes_json, archetypes_json columns to cards table
 - Add meaning_aware_self, meaning_supporting_shadow, meaning_emerging_path columns to cards table
 - Add themes_json, core_message columns to talks table
 - Run one-time AI script to generate themes for all 78 cards (using Claude/GPT, store forever)
 - Run one-time AI script to generate themes and core_message for all talks
 - Generate positional meanings for each card using Tarot bibliography knowledge

 Phase 1: Core Flow (MVP)

 - SpreadReadingTrigger component (subtle "Read My Spread" text link)
 - SpreadReadingModal with optional question input
 - Scoring algorithm (lib/spread-reading/score-talks.ts)
 - Template-based rationale generator (lib/spread-reading/generate-rationale.ts)
 - POST /api/spread-reading endpoint (deterministic, no LLM)
 - SpreadReadingResult display component
 - Integration with CardCascade.tsx (trigger after 2+ cards revealed)

 Phase 2: Polish

 - Loading state with mystical copy ("Consulting the cards...")
 - Mobile drawer vs. desktop modal
 - Smooth animations for result reveal
 - Error handling (fallback to highest-strength primary talk)
 - Hide "Read My Spread" after reading is complete (one per spread)
 - Analytics events (reading_started, reading_completed, talk_watched)

 Phase 3: Enhancement

 - Refine rationale templates based on user feedback
 - Add more template variants for different spread archetypes
 - "Share my reading" functionality
 - Consider premium tier with live LLM synthesis (optional, future)

 ---
 Design Decisions (Resolved)
 Question: AI Provider
 Decision: Ultra-free: No per-request LLM. Use knowledge-rich scoring + curated rationales. One-time
 AI
    for data enrichment only.
 ────────────────────────────────────────
 Question: Position Meanings
 Decision: Yes. Use Aware Self / Supporting Shadow / Emerging Path narrative arc (not time-based).
 ────────────────────────────────────────
 Question: Quick Path (no question)
 Decision: Same scoring algorithm, just without question keyword bonus. Still feels intelligent.
 ────────────────────────────────────────
 Question: Re-reading
 Decision: No. One reading per spread. Draw new cards for a new reading.
 Open Questions (Remaining)

 1. Data Enrichment Sprint: When should we do the one-time AI-assisted generation of themes/positional
  meanings for all 78 cards and talks?
 2. Question Input UX: Should the question field appear inline (below cards) or in a modal/drawer?
 3. Result Persistence: Should the reading result be saveable/shareable, or ephemeral?

 ---
 Files to Modify

 Database Schema
 File: lib/db/schema.ts
 Changes: Add new columns: themes_json, archetypes_json, positional meanings to cards; themes_json,
   core_message to talks
 ────────────────────────────────────────
 File: lib/db/migrations/
 Changes: New migration file for schema changes
 Spread Reading Engine
 ┌──────────────────────────────────────────┬───────────────────────────────────────────────┐
 │                   File                   │                    Changes                    │
 ├──────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ lib/spread-reading/score-talks.ts        │ New: Scoring algorithm for spread synthesis   │
 ├──────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ lib/spread-reading/generate-rationale.ts │ New: Template-based rationale generator       │
 ├──────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ lib/spread-reading/types.ts              │ New: TypeScript interfaces for spread reading │
 ├──────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ lib/db/queries/spread-reading.ts         │ New: Candidate talk fetching with themes      │
 └──────────────────────────────────────────┴───────────────────────────────────────────────┘
 Components
 File: components/ritual/CardCascade.tsx
 Changes: Add SpreadReadingTrigger, track reading state
 ────────────────────────────────────────
 File: components/ritual/SpreadReading/SpreadReadingTrigger.tsx
 Changes: New: Subtle "Read My Spread" text link
 ────────────────────────────────────────
 File: components/ritual/SpreadReading/SpreadReadingModal.tsx
 Changes: New: Question input + submission
 ────────────────────────────────────────
 File: components/ritual/SpreadReading/SpreadReadingResult.tsx
 Changes: New: Talk recommendation display
 ────────────────────────────────────────
 File: components/ritual/SpreadReading/index.ts
 Changes: New: Barrel export
 API
 ┌─────────────────────────────────┬───────────────────────────────────────┐
 │              File               │                Changes                │
 ├─────────────────────────────────┼───────────────────────────────────────┤
 │ app/api/spread-reading/route.ts │ New: POST endpoint for spread reading │
 └─────────────────────────────────┴───────────────────────────────────────┘
 Scripts (One-Time)
 ┌───────────────────────────────┬─────────────────────────────────────────────┐
 │             File              │                   Changes                   │
 ├───────────────────────────────┼─────────────────────────────────────────────┤
 │ scripts/enrich-card-themes.ts │ New: AI-assisted theme generation for cards │
 ├───────────────────────────────┼─────────────────────────────────────────────┤
 │ scripts/enrich-talk-themes.ts │ New: AI-assisted theme generation for talks │
 └───────────────────────────────┴─────────────────────────────────────────────┘
 ---
 Summary

 "One TED Talk Per Reading" transforms the ritual from a card-by-card lookup into a synthesized,
 personalized experience. By building intelligence into the data layer rather than relying on
 expensive per-request AI calls, we create a system that:

 1. Feels magical — The scoring algorithm considers card relationships, themes, and user questions
 2. Costs nothing to run — All intelligence is pre-computed and stored in the database
 3. Honors Tarot tradition — The "Aware Self / Supporting Shadow / Emerging Path" positions create
 narrative structure
 4. Respects the user — A subtle "Read My Spread" text link that invites rather than demands

 The key insight: The AI is in the curation, not the API calls. Your existing card-talk mappings
 already contain wisdom. This feature surfaces that wisdom through smart scoring and eloquent
 templates.

 Critical Path

 1. Phase 0 (Data Enrichment) must happen first — generate themes and positional meanings for all
 cards/talks
 2. Phase 1 (Core Flow) can then be built on top of the enriched data
 3. Phase 2+ is polish and enhancement