/**
 * Simple in-memory rate limiter for API endpoints
 * Tracks requests per key within a time window
 */

const rateLimitMap = new Map<string, number[]>();

/**
 * Check if a request should be rate limited
 * @param key - Identifier for the rate limit (e.g., IP address, user ID)
 * @param limit - Maximum number of requests per window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing requests for this key
  const requests = rateLimitMap.get(key) || [];

  // Filter to only recent requests within the window
  const recentRequests = requests.filter((timestamp) => timestamp > windowStart);

  // Check if limit exceeded
  if (recentRequests.length >= limit) {
    return false; // Rate limited
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);

  return true; // Request allowed
}

/**
 * Get remaining requests for a key
 * @param key - Identifier for the rate limit
 * @param limit - Maximum number of requests per window
 * @param windowMs - Time window in milliseconds
 * @returns Number of remaining requests in the current window
 */
export function getRemainingRequests(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): number {
  const now = Date.now();
  const windowStart = now - windowMs;

  const requests = rateLimitMap.get(key) || [];
  const recentRequests = requests.filter((timestamp) => timestamp > windowStart);

  return Math.max(0, limit - recentRequests.length);
}

/**
 * Clear rate limit data for a key
 * @param key - Identifier to clear
 */
export function clearRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

/**
 * Clean up old entries from the rate limit map
 * Call this periodically to prevent memory leaks
 */
export function cleanupRateLimitMap(windowMs: number = 60000): void {
  const now = Date.now();
  const windowStart = now - windowMs;

  for (const [key, timestamps] of rateLimitMap.entries()) {
    const recentRequests = timestamps.filter((timestamp) => timestamp > windowStart);

    if (recentRequests.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, recentRequests);
    }
  }
}
