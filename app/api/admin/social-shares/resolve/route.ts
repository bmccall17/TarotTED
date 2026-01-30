import { NextRequest, NextResponse } from 'next/server';
import { resolveSharedUrl } from '@/lib/db/queries/admin-social-shares';

/**
 * POST /api/admin/social-shares/resolve
 * Body: { url: string }
 *
 * Resolves a TarotTALKS URL to its card or talk reference
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await resolveSharedUrl(body.url);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error resolving URL:', error);
    return NextResponse.json(
      { error: 'Failed to resolve URL' },
      { status: 500 }
    );
  }
}
