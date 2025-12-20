ADMIN_PORTAL_ADDITIONS.md (v2)

  🔴 RED FLAGS (Critical Issues)

  1. Middleware doesn't protect API routes properly

  // Current plan (line 127-135):
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    // ...
  }

  Problem: The middleware checks cookies, but API routes should also accept tokens via Authorization header for programmatic access and CSRF protection.

  Fix: Add header-based auth as fallback:
  const token = request.cookies.get('admin_token')?.value
             || request.headers.get('Authorization')?.replace('Bearer ', '');

  ---
  2. Login page is inside protected route

  /app/admin/login/page.tsx

  Problem: The middleware redirects to /admin/login if no token, but /admin/login is ALSO protected by the /admin/* matcher. This creates an infinite redirect loop.

  Fix: Either:
  - Move login to /login (outside /admin)
  - Or exclude /admin/login from middleware:
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {

  ---
  3. No validation that at least one URL exists

  tedUrl: string | null;   // TED.com URL (nullable)
  youtubeUrl: string | null; // YouTube URL (nullable)

  Problem: Both can be null at database level. A talk with no URLs is useless.

  Fix: Add a CHECK constraint in PostgreSQL:
  ALTER TABLE talks ADD CONSTRAINT chk_at_least_one_url
  CHECK (ted_url IS NOT NULL OR youtube_url IS NOT NULL);

  ---
  4. Missing slug uniqueness validation on create/update

  The plan mentions generateSlug() but doesn't mention:
  - Checking for slug collisions before insert
  - Handling the unique constraint error gracefully

  Fix: Add to createTalk():
  // Check slug exists, append -2, -3, etc. if collision
  const existingSlug = await db.select().from(talks).where(eq(talks.slug, slug));
  if (existingSlug.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  ---
  5. Hard delete cascade behavior undefined

  hardDeleteTalk(id: string)      // Actually removes from DB

  Problem: If a talk is hard-deleted, what happens to its mappings? The schema likely has ON DELETE CASCADE, but this isn't documented or verified.

  Fix: Document expected behavior and ensure schema has:
  FOREIGN KEY (talk_id) REFERENCES talks(id) ON DELETE CASCADE

  ---
  🟡 YELLOW FLAGS (Concerns to Consider)

  1. Token storage in plain cookie

  const token = request.cookies.get('admin_token')?.value;

  Concern: If cookie is not HttpOnly and Secure, it's vulnerable to XSS theft.

  Recommendation: When setting the cookie in login:
  cookies().set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  ---
  2. No rate limiting on metadata fetch endpoints

  POST /api/admin/talks/[id]/fetch-metadata

  Concern: Each call hits YouTube/TED APIs. A malicious or buggy client could exhaust your YouTube API quota (10,000 units/day default).

  Recommendation: Add simple in-memory rate limiting or use a token bucket:
  const RATE_LIMIT = 10; // per minute
  const rateLimitMap = new Map<string, number[]>();

  ---
  3. Transaction not explicitly mentioned for primary mapping swap

  // Transaction: UPDATE ... SET isPrimary=false WHERE cardId=X AND isPrimary=true
  // then INSERT/UPDATE new mapping

  Concern: If these aren't in a transaction, a failure between UPDATE and INSERT leaves the card with NO primary.

  Recommendation: Use Drizzle transaction:
  await db.transaction(async (tx) => {
    await tx.update(cardTalkMappings).set({ isPrimary: false }).where(...);
    await tx.insert(cardTalkMappings).values({ ..., isPrimary: true });
  });

  ---
  4. Soft delete doesn't filter public queries automatically

  The plan says:
  Public queries filter WHERE isDeleted = false

  Concern: Every public query must remember to add this filter. Easy to forget.

  Recommendation: Create a reusable base query or use Drizzle's .where() chain:
  // lib/db/queries/talks.ts
  const activeFilter = eq(talks.isDeleted, false);
  export const activeTalks = db.select().from(talks).where(activeFilter);

  ---
  5. No audit logging for destructive actions

  No mention of logging who deleted what, when.

  Recommendation: Add an audit_log table or at minimum console.log:
  console.log(`[AUDIT] Talk ${id} hard-deleted by admin at ${new Date().toISOString()}`);

  ---
  6. YouTube API key exposed to client risk

  POST /api/admin/talks/[id]/fetch-metadata

  Concern: The API key should ONLY be used server-side. Plan looks correct (API route fetches), but ensure the key is never sent to client.

  Verify: YOUTUBE_API_KEY is only read in API routes, not in client components.

  ---
  7. Partial index syntax may vary by PostgreSQL version

  CREATE UNIQUE INDEX idx_one_primary_per_card
  ON card_talk_mappings (card_id)
  WHERE is_primary = true;

  Concern: Supabase (PostgreSQL 15+) supports this, but verify the Drizzle migration syntax.

  Recommendation: Test in a Supabase SQL editor first:
  -- Test in Supabase dashboard before committing migration

  ---
  8. No backup/export before schema migration

  Phase 0 modifies the schema but doesn't mention backing up first.

  Recommendation: Add to Phase 0:
  1. Run `/scripts/export-db-to-seed-files.ts` before migration
  2. Store backup in `/lib/db/backups/YYYY-MM-DD/`

  ---
  9. Error handling for external API failures not specified

  What happens when:
  - YouTube API returns 403 (quota exceeded)?
  - TED oEmbed returns 404 (talk removed)?
  - Network timeout?

  Recommendation: Add error handling section to Phase 2:
  try {
    const tedData = await fetchTedOembed(url);
  } catch (error) {
    if (error.status === 404) {
      return { ted: null, error: 'Talk not found on TED.com' };
    }
    throw error;
  }

  ---
  10. Mobile responsive mentioned but admin tables are complex

  The MappingEditor layout shows a two-column design that won't work on mobile.

  Recommendation: Add to Phase 5:
  - Stack columns on mobile
  - Use tabs or accordion for card selection on small screens
  - Or accept admin is desktop-only (document this decision)

  ---
  Summary

  | Category        | Count | Status                             |
  |-----------------|-------|------------------------------------|
  | 🔴 Red Flags    | 5     | Must fix before implementation     |
  | 🟡 Yellow Flags | 10    | Should address, prioritize by risk |

  Immediate Actions Required:

  1. Fix login page redirect loop (move to /login or exclude from middleware)
  2. Add header-based auth to middleware
  3. Add database constraint for at least one URL
  4. Document cascade delete behavior
  5. Add slug collision handling

  Recommended Before Production:

  1. HttpOnly/Secure cookie settings
  2. Rate limiting on metadata fetch
  3. Explicit transactions for mapping swap
  4. Audit logging for deletes
  5. Backup before migration


--- previous additions left for reference:
1. 🔴 Minimum viable protection (still lightweight):
	Add a single admin secret (e.g. ADMIN_TOKEN) and require it:
	  * in middleware for `/admin/*`
	  * and in headers for `/api/admin/*`
	This is a tiny step that avoids catastrophic edits before “real auth.”

2. 🔴 Safer pattern for deleting talks:
	* default to soft delete (isDeleted, deletedAt) and hide from public views
	* allow “hard delete” only behind a second confirmation (“type DELETE”)

3. 🔴 Primary mapping constraint must be enforced at the database level
	UI validation is not enough. You need a DB guarantee of only one isPrimary=true per cardId.
	Do this with a unique partial index (or equivalent constraint) so you can never end up with two primaries due to race conditions or manual edits.

4. 🟡 “tedUrl can be TED.com or YouTube URL (user decides)” conflicts with your validation goals
	You currently plan to flag “YouTube URLs in tedUrl” as a problem, but you also say it’s allowed.
	im now sure what to do here... seems like maybe we need a `canonicalUrl` field or something to allow for both URLs to be present if they both exist. if the talk does NOT existing on TED.com then the `tedUrl` could be left null and that flags the system to use the YoutubeURL

5. 🟡 TED oEmbed may not reliably provide the fields you want
	TED oEmbed is good for title/thumbnail-ish data, but duration/year/description can be inconsistent depending on what TED exposes.
	if the full information is NOT avialable from TED, then scrape the rest of the information from the Youtube metadata. aim to fill ALL fields using Youtube as a fallback when TED does not reveal all the information

6. Make “Admin” feel like two modes:
	1. Curation mode: Talks + Mappings + Themes
	2. Repair mode: Validation dashboard with guided fixes
	That’s the mental model that will keep it fast for you long-term.