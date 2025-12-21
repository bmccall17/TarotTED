import { NextRequest, NextResponse } from 'next/server';
import {
  getAllTalksForAdmin,
  searchTalksForAdmin,
  createTalk,
  type InsertTalk,
} from '@/lib/db/queries/admin-talks';

/**
 * GET /api/admin/talks
 * Query params:
 *   - includeDeleted: boolean (default: false)
 *   - search: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const searchQuery = searchParams.get('search');

    let talks;
    if (searchQuery) {
      talks = await searchTalksForAdmin(searchQuery, includeDeleted);
    } else {
      talks = await getAllTalksForAdmin(includeDeleted);
    }

    return NextResponse.json({ talks });
  } catch (error) {
    console.error('Error fetching talks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/talks
 * Body: InsertTalk (without slug)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.speakerName) {
      return NextResponse.json(
        { error: 'Title and speaker name are required' },
        { status: 400 }
      );
    }

    // Ensure at least one URL is provided
    if (!body.tedUrl && !body.youtubeUrl) {
      return NextResponse.json(
        { error: 'At least one URL (tedUrl or youtubeUrl) is required' },
        { status: 400 }
      );
    }

    const talk = await createTalk(body);

    return NextResponse.json({ talk }, { status: 201 });
  } catch (error) {
    console.error('Error creating talk:', error);
    return NextResponse.json(
      { error: 'Failed to create talk' },
      { status: 500 }
    );
  }
}
