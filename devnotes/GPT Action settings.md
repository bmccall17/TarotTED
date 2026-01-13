Here are your GPT Action settings for connecting to Supabase:

  ---
  Option 1: Direct Supabase REST API (Simplest)

  Authentication Settings

  Click the gear icon next to "None" and configure:
  Field: Authentication Type
  Value: API Key
  ────────────────────────────────────────
  Field: API Key
  Value: Your SUPABASE_ANON_KEY (found in Supabase Dashboard → Settings → API → anon public)
  ────────────────────────────────────────
  Field: Auth Type
  Value: Custom Header
  ────────────────────────────────────────
  Field: Custom Header Name
  Value: apikey
  OpenAPI Schema

  Paste this into the Schema field (replace YOUR_PROJECT_REF with your actual Supabase project reference):

  openapi: 3.1.0
  info:
    title: TarotTALKS Database API
    description: Query card-talk mappings from TarotTALKS
    version: 1.0.0
  servers:
    - url: https://YOUR_PROJECT_REF.supabase.co/rest/v1
  paths:
    /cards:
      get:
        operationId: getCardBySlug
        summary: Get a Tarot card by its slug
        parameters:
          - name: slug
            in: query
            required: true
            schema:
              type: string
            description: "Filter by slug using PostgREST syntax, e.g., eq.the-tower"
          - name: select
            in: query
            schema:
              type: string
              default: "id,slug,name,keywords,summary,upright_meaning,reversed_meaning,advice_when_drawn"
        responses:
          '200':
            description: Card data
            content:
              application/json:
                schema:
                  type: array
                  items:
                    $ref: '#/components/schemas/Card'
    /card_talk_mappings:
      get:
        operationId: getMappingsForCard
        summary: Get all talk mappings for a card
        parameters:
          - name: card_id
            in: query
            required: true
            schema:
              type: string
            description: "Filter by card_id using PostgREST syntax, e.g., eq.uuid-here"
          - name: select
            in: query
            schema:
              type: string
              default: "*,talks(id,slug,title,speaker_name,ted_url,youtube_url,description,duration_seconds)"
          - name: order
            in: query
            schema:
              type: string
              default: "is_primary.desc,strength.desc"
        responses:
          '200':
            description: Mapping data with embedded talks
            content:
              application/json:
                schema:
                  type: array
                  items:
                    $ref: '#/components/schemas/Mapping'
    /talks:
      get:
        operationId: searchTalks
        summary: Search talks by title or speaker
        parameters:
          - name: or
            in: query
            schema:
              type: string
            description: "PostgREST OR filter, e.g., (title.ilike.*vulnerability*,speaker_name.ilike.*brown*)"
          - name: select
            in: query
            schema:
              type: string
              default: "id,slug,title,speaker_name,ted_url,youtube_url,description,duration_seconds"
          - name: is_deleted
            in: query
            schema:
              type: string
              default: "eq.false"
        responses:
          '200':
            description: Talk data
  components:
    schemas:
      Card:
        type: object
        properties:
          id:
            type: string
          slug:
            type: string
          name:
            type: string
          keywords:
            type: string
          summary:
            type: string
          upright_meaning:
            type: string
          reversed_meaning:
            type: string
      Mapping:
        type: object
        properties:
          id:
            type: string
          card_id:
            type: string
          talk_id:
            type: string
          is_primary:
            type: boolean
          strength:
            type: integer
          rationale_short:
            type: string
          rationale_long:
            type: string
          talks:
            $ref: '#/components/schemas/Talk'
      Talk:
        type: object
        properties:
          id:
            type: string
          slug:
            type: string
          title:
            type: string
          speaker_name:
            type: string
          ted_url:
            type: string
          youtube_url:
            type: string
          description:
            type: string
          duration_seconds:
            type: integer

  Privacy Policy

  Use your app's URL: https://tarottalks.app/privacy (or create one)

  ---
  Important: Add this to System Instructions

  Add this section to your GPT's instructions so it knows how to use the API:

  ## USING THE DATABASE API

  When you identify cards from a screenshot, look them up in the database:

  1. **Look up each card by slug:**
     Call getCardBySlug with slug=eq.[card-slug]
     Card slugs are lowercase with hyphens: "the-tower", "the-fool", "ten-of-cups"

  2. **Get the card's talk mappings:**
     Take the card's `id` from step 1
     Call getMappingsForCard with card_id=eq.[card-uuid]
     Results include embedded talk data, sorted by is_primary and strength

  3. **Use the rationale_short from mappings:**
     Each mapping has a rationale_short explaining WHY that talk connects to that card
     Incorporate this into your reading

  4. **Prioritize talks that map to multiple cards in the spread:**
     If a talk appears in mappings for 2+ cards, it's a strong candidate for your recommendation

  ---
  Security Note

  The anon key is safe to use because:
  - It only allows SELECT queries (reading)
  - Your database likely has Row Level Security (RLS) enabled
  - No write operations are exposed

  If you want extra security, you can enable RLS and create a policy that allows public read access to cards, talks, and mappings tables.

  Want me to also create a simpler alternative—a dedicated read-only API endpoint in your Next.js app that the GPT can call?