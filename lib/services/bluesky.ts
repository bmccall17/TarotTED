/**
 * Bluesky AT Protocol API Service
 *
 * Handles all interactions with Bluesky's API for:
 * - Fetching post metrics (likes, reposts, replies)
 * - Checking follow relationships
 * - Searching for domain mentions (requires authentication)
 *
 * Public endpoints work without auth. Search requires BLUESKY_IDENTIFIER
 * and BLUESKY_APP_PASSWORD environment variables.
 */

import { BskyAgent } from '@atproto/api';

const BSKY_PUBLIC_API = 'https://public.api.bsky.app';
const TAROTTALKS_HANDLE = 'tarottalks.bsky.social';

// Cached authenticated agent for search operations
let authenticatedAgent: BskyAgent | null = null;

/**
 * Get an authenticated Bluesky agent for search operations
 * Caches the agent to avoid re-authenticating on every request
 */
async function getAuthenticatedAgent(): Promise<BskyAgent | null> {
  // Return cached agent if available and session is valid
  if (authenticatedAgent?.session) {
    return authenticatedAgent;
  }

  const identifier = process.env.BLUESKY_IDENTIFIER;
  const password = process.env.BLUESKY_APP_PASSWORD;

  console.log('[Bluesky Auth] Checking credentials...');
  console.log('[Bluesky Auth] BLUESKY_IDENTIFIER:', identifier ? `${identifier.substring(0, 10)}...` : 'NOT SET');
  console.log('[Bluesky Auth] BLUESKY_APP_PASSWORD:', password ? `${password.substring(0, 4)}...` : 'NOT SET');

  if (!identifier || !password) {
    console.error('[Bluesky Auth] Missing credentials - cannot authenticate');
    return null;
  }

  try {
    console.log('[Bluesky Auth] Attempting login...');
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    await agent.login({ identifier, password });
    authenticatedAgent = agent;
    console.log('[Bluesky Auth] Login successful for:', agent.session?.handle);
    return agent;
  } catch (error: unknown) {
    const err = error as Error & { status?: number; message?: string };
    console.error('[Bluesky Auth] Login failed:', {
      message: err.message,
      status: err.status,
      name: err.name,
    });
    return null;
  }
}

export type PostMetrics = {
  likeCount: number;
  repostCount: number;
  replyCount: number;
};

export type MentionPost = {
  uri: string;
  postUrl: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName: string;
  text: string;
  createdAt: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
};

/**
 * Parse a Bluesky post URL to extract handle/DID and rkey
 * Input: https://bsky.app/profile/user.bsky.social/post/3abc123
 * Output: { actor: 'user.bsky.social', rkey: '3abc123' }
 */
export function parseBlueskyUrl(postUrl: string): { actor: string; rkey: string } | null {
  const match = postUrl.match(/bsky\.app\/profile\/([^\/]+)\/post\/([a-z0-9]+)/i);
  if (!match) return null;
  return { actor: match[1], rkey: match[2] };
}

/**
 * Resolve a handle to its DID
 */
export async function resolveHandleToDid(handle: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${BSKY_PUBLIC_API}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.did || null;
  } catch {
    return null;
  }
}

/**
 * Convert a bsky.app URL to an AT URI
 * Input: https://bsky.app/profile/user.bsky.social/post/3abc123
 * Output: at://did:plc:xxx/app.bsky.feed.post/3abc123
 */
export async function extractAtUriFromPostUrl(postUrl: string): Promise<string | null> {
  const parsed = parseBlueskyUrl(postUrl);
  if (!parsed) return null;

  const { actor, rkey } = parsed;

  // If actor is already a DID, use it directly
  if (actor.startsWith('did:')) {
    return `at://${actor}/app.bsky.feed.post/${rkey}`;
  }

  // Resolve handle to DID
  const did = await resolveHandleToDid(actor);
  if (!did) return null;

  return `at://${did}/app.bsky.feed.post/${rkey}`;
}

/**
 * Get engagement metrics for a post
 */
export async function getPostMetrics(atUri: string): Promise<PostMetrics | null> {
  try {
    const res = await fetch(
      `${BSKY_PUBLIC_API}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=0`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const post = data.thread?.post;
    if (!post) return null;

    return {
      likeCount: post.likeCount ?? 0,
      repostCount: post.repostCount ?? 0,
      replyCount: post.replyCount ?? 0,
    };
  } catch {
    return null;
  }
}

export type FullPostData = {
  uri: string;
  text: string;
  createdAt: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
};

/**
 * Get full post data including text, author info, and metrics
 */
export async function getFullPostData(atUri: string): Promise<FullPostData | null> {
  try {
    console.log('[Bluesky] Fetching post thread for:', atUri);
    const res = await fetch(
      `${BSKY_PUBLIC_API}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=0`
    );
    if (!res.ok) {
      console.error('[Bluesky] API returned error:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    const post = data.thread?.post;
    if (!post) {
      console.error('[Bluesky] No post found in response');
      return null;
    }

    console.log('[Bluesky] Got post from API, text length:', (post.record as { text?: string })?.text?.length);

    return {
      uri: post.uri,
      text: (post.record as { text?: string })?.text || '',
      createdAt: (post.record as { createdAt?: string })?.createdAt || post.indexedAt,
      authorDid: post.author.did,
      authorHandle: post.author.handle,
      authorDisplayName: post.author.displayName || post.author.handle,
      likeCount: post.likeCount ?? 0,
      repostCount: post.repostCount ?? 0,
      replyCount: post.replyCount ?? 0,
    };
  } catch (error) {
    console.error('[Bluesky] Error fetching post:', error);
    return null;
  }
}

/**
 * Get full post data from a bsky.app URL
 */
export async function getFullPostDataFromUrl(postUrl: string): Promise<FullPostData | null> {
  console.log('[Bluesky] Extracting AT URI from:', postUrl);
  const atUri = await extractAtUriFromPostUrl(postUrl);
  if (!atUri) {
    console.error('[Bluesky] Failed to extract AT URI');
    return null;
  }
  console.log('[Bluesky] Got AT URI:', atUri);
  return getFullPostData(atUri);
}

/**
 * Check if @tarottalks.bsky.social follows a given handle
 * Returns: true (following), false (not following), null (error/unknown)
 */
export async function checkFollowStatus(speakerHandle: string): Promise<boolean | null> {
  // Clean handle - remove @ prefix if present
  const cleanHandle = speakerHandle.replace(/^@/, '');

  // Skip if handle doesn't look like a Bluesky handle
  if (!cleanHandle.includes('.')) {
    return null;
  }

  try {
    const res = await fetch(
      `${BSKY_PUBLIC_API}/xrpc/app.bsky.graph.getRelationships?actor=${encodeURIComponent(TAROTTALKS_HANDLE)}&others=${encodeURIComponent(cleanHandle)}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const relationship = data.relationships?.[0];
    if (!relationship) return null;

    return relationship.following === true;
  } catch {
    return null;
  }
}

/**
 * Search for posts mentioning tarottalks.app domain
 * Requires authentication - uses BLUESKY_IDENTIFIER and BLUESKY_APP_PASSWORD
 * Returns array of discovered mentions
 */
export async function searchMentions(limit: number = 100): Promise<MentionPost[]> {
  try {
    const agent = await getAuthenticatedAgent();

    if (!agent) {
      console.error('Cannot search mentions: Bluesky authentication failed or not configured');
      return [];
    }

    const response = await agent.app.bsky.feed.searchPosts({
      q: 'tarottalks.app',
      sort: 'latest',
      limit,
    });

    const posts = response.data.posts || [];

    return posts.map((post) => ({
      uri: post.uri,
      postUrl: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
      authorDid: post.author.did,
      authorHandle: post.author.handle,
      authorDisplayName: post.author.displayName || post.author.handle,
      text: (post.record as { text?: string })?.text || '',
      createdAt: (post.record as { createdAt?: string })?.createdAt || post.indexedAt,
      likeCount: post.likeCount ?? 0,
      repostCount: post.repostCount ?? 0,
      replyCount: post.replyCount ?? 0,
    }));
  } catch (error) {
    console.error('Error searching Bluesky mentions:', error);
    return [];
  }
}

/**
 * Get metrics for a post given its bsky.app URL
 * Convenience function that handles URL -> AT URI conversion
 */
export async function getMetricsFromUrl(postUrl: string): Promise<PostMetrics | null> {
  const atUri = await extractAtUriFromPostUrl(postUrl);
  if (!atUri) return null;
  return getPostMetrics(atUri);
}

/**
 * Check if a URL is a Bluesky post URL
 */
export function isBlueskyUrl(url: string): boolean {
  return /bsky\.app\/profile\/[^\/]+\/post\/[a-z0-9]+/i.test(url);
}
