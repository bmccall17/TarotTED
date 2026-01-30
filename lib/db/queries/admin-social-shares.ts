import { db } from '../index';
import { socialShares, cards, talks } from '../schema';
import { eq, desc, ilike, or, and, sql, count, gte, lte } from 'drizzle-orm';

// Types
export type InsertShare = typeof socialShares.$inferInsert;
export type Share = typeof socialShares.$inferSelect;

export type ShareFilters = {
  platform?: 'x' | 'bluesky' | 'threads' | 'linkedin' | 'other';
  status?: 'draft' | 'posted' | 'verified';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
};

export type ShareWithRelations = Share & {
  card?: { id: string; name: string; slug: string } | null;
  talk?: { id: string; title: string; slug: string; speakerName: string } | null;
};

/**
 * Get all shares with optional filters
 */
export async function getAllSharesForAdmin(filters?: ShareFilters): Promise<ShareWithRelations[]> {
  const conditions = [];

  if (filters?.platform) {
    conditions.push(eq(socialShares.platform, filters.platform));
  }

  if (filters?.status) {
    conditions.push(eq(socialShares.status, filters.status));
  }

  if (filters?.dateFrom) {
    conditions.push(gte(socialShares.postedAt, filters.dateFrom));
  }

  if (filters?.dateTo) {
    conditions.push(lte(socialShares.postedAt, filters.dateTo));
  }

  if (filters?.search) {
    const searchPattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(socialShares.notes, searchPattern),
        ilike(socialShares.speakerName, searchPattern),
        ilike(socialShares.speakerHandle, searchPattern)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters?.limit || 50;

  const shares = await db
    .select()
    .from(socialShares)
    .where(whereClause)
    .orderBy(desc(socialShares.postedAt))
    .limit(limit);

  // Get related cards and talks
  const cardIds = shares.filter(s => s.cardId).map(s => s.cardId as string);
  const talkIds = shares.filter(s => s.talkId).map(s => s.talkId as string);

  let cardsMap: Record<string, { id: string; name: string; slug: string }> = {};
  let talksMap: Record<string, { id: string; title: string; slug: string; speakerName: string }> = {};

  if (cardIds.length > 0) {
    const cardResults = await db
      .select({ id: cards.id, name: cards.name, slug: cards.slug })
      .from(cards)
      .where(sql`${cards.id} IN (${sql.join(cardIds.map(id => sql`${id}::uuid`), sql`, `)})`);
    cardsMap = Object.fromEntries(cardResults.map(c => [c.id, c]));
  }

  if (talkIds.length > 0) {
    const talkResults = await db
      .select({ id: talks.id, title: talks.title, slug: talks.slug, speakerName: talks.speakerName })
      .from(talks)
      .where(sql`${talks.id} IN (${sql.join(talkIds.map(id => sql`${id}::uuid`), sql`, `)})`);
    talksMap = Object.fromEntries(talkResults.map(t => [t.id, t]));
  }

  return shares.map(share => ({
    ...share,
    card: share.cardId ? cardsMap[share.cardId] || null : null,
    talk: share.talkId ? talksMap[share.talkId] || null : null,
  }));
}

/**
 * Get single share by ID
 */
export async function getShareById(id: string): Promise<ShareWithRelations | null> {
  const [share] = await db
    .select()
    .from(socialShares)
    .where(eq(socialShares.id, id))
    .limit(1);

  if (!share) return null;

  let card = null;
  let talk = null;

  if (share.cardId) {
    const [cardResult] = await db
      .select({ id: cards.id, name: cards.name, slug: cards.slug })
      .from(cards)
      .where(eq(cards.id, share.cardId))
      .limit(1);
    card = cardResult || null;
  }

  if (share.talkId) {
    const [talkResult] = await db
      .select({ id: talks.id, title: talks.title, slug: talks.slug, speakerName: talks.speakerName })
      .from(talks)
      .where(eq(talks.id, share.talkId))
      .limit(1);
    talk = talkResult || null;
  }

  return { ...share, card, talk };
}

/**
 * Create a new share
 */
export async function createShare(data: InsertShare): Promise<Share> {
  const [result] = await db
    .insert(socialShares)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result;
}

/**
 * Update an existing share
 */
export async function updateShare(id: string, data: Partial<InsertShare>): Promise<Share | null> {
  const [result] = await db
    .update(socialShares)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(socialShares.id, id))
    .returning();

  return result || null;
}

/**
 * Delete a share
 */
export async function deleteShare(id: string): Promise<void> {
  await db.delete(socialShares).where(eq(socialShares.id, id));
}

/**
 * Get share statistics for dashboard
 */
export async function getShareStats(): Promise<{ today: number; thisWeek: number; total: number }> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [totalResult] = await db.select({ count: count() }).from(socialShares);
  const [todayResult] = await db
    .select({ count: count() })
    .from(socialShares)
    .where(gte(socialShares.postedAt, todayStart));
  const [weekResult] = await db
    .select({ count: count() })
    .from(socialShares)
    .where(gte(socialShares.postedAt, weekStart));

  return {
    today: todayResult?.count || 0,
    thisWeek: weekResult?.count || 0,
    total: totalResult?.count || 0,
  };
}

/**
 * Resolve a TarotTALKS URL to card or talk
 */
export async function resolveSharedUrl(url: string): Promise<{
  type: 'card' | 'talk' | null;
  cardId?: string;
  talkId?: string;
  name?: string;
}> {
  // Match /cards/[slug] or /talks/[slug]
  const cardMatch = url.match(/tarottalks\.app\/cards\/([a-z0-9-]+)/i);
  const talkMatch = url.match(/tarottalks\.app\/talks\/([a-z0-9-]+)/i);

  if (cardMatch) {
    const slug = cardMatch[1];
    const [card] = await db
      .select({ id: cards.id, name: cards.name })
      .from(cards)
      .where(eq(cards.slug, slug))
      .limit(1);
    if (card) {
      return { type: 'card', cardId: card.id, name: card.name };
    }
  }

  if (talkMatch) {
    const slug = talkMatch[1];
    const [talk] = await db
      .select({ id: talks.id, title: talks.title, speakerName: talks.speakerName })
      .from(talks)
      .where(eq(talks.slug, slug))
      .limit(1);
    if (talk) {
      return { type: 'talk', talkId: talk.id, name: `${talk.title} (${talk.speakerName})` };
    }
  }

  return { type: null };
}
