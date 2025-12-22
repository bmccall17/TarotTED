import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { talks, cardTalkMappings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Validation fix actions:
// - resolve-duplicate-youtube: Remove YouTube ID from specified talk
// - set-primary-mapping: Set a mapping as primary for a card
// - restore-talk: Restore a soft-deleted talk
// - update-thumbnail: Fetch and set thumbnail from TED/YouTube
// - update-field: Quick field update (description, tedUrl, youtubeUrl)

interface FixRequest {
  action: 'resolve-duplicate-youtube' | 'set-primary-mapping' | 'restore-talk' | 'update-thumbnail' | 'update-field';
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: FixRequest = await request.json();
    const { action } = body;

    switch (action) {
      case 'resolve-duplicate-youtube': {
        const { talkId } = body;
        if (!talkId) {
          return NextResponse.json(
            { error: 'talkId is required' },
            { status: 400 }
          );
        }

        // Clear the YouTube video ID for this talk
        await db
          .update(talks)
          .set({ youtubeVideoId: null })
          .where(eq(talks.id, talkId));

        return NextResponse.json({ success: true, message: 'YouTube ID removed' });
      }

      case 'set-primary-mapping': {
        const { cardId, talkId } = body;
        if (!cardId || !talkId) {
          return NextResponse.json(
            { error: 'cardId and talkId are required' },
            { status: 400 }
          );
        }

        // First, set all mappings for this card to non-primary
        await db
          .update(cardTalkMappings)
          .set({ isPrimary: false })
          .where(eq(cardTalkMappings.cardId, cardId));

        // Then set the specified mapping as primary
        await db
          .update(cardTalkMappings)
          .set({ isPrimary: true })
          .where(
            and(
              eq(cardTalkMappings.cardId, cardId),
              eq(cardTalkMappings.talkId, talkId)
            )
          );

        return NextResponse.json({ success: true, message: 'Primary mapping updated' });
      }

      case 'restore-talk': {
        const { talkId } = body;
        if (!talkId) {
          return NextResponse.json(
            { error: 'talkId is required' },
            { status: 400 }
          );
        }

        // Restore the talk by setting isDeleted to false and clearing deletedAt
        await db
          .update(talks)
          .set({ isDeleted: false, deletedAt: null })
          .where(eq(talks.id, talkId));

        return NextResponse.json({ success: true, message: 'Talk restored' });
      }

      case 'update-thumbnail': {
        const { talkId, thumbnailUrl } = body;
        if (!talkId || !thumbnailUrl) {
          return NextResponse.json(
            { error: 'talkId and thumbnailUrl are required' },
            { status: 400 }
          );
        }

        // Update the thumbnail URL
        await db
          .update(talks)
          .set({ thumbnailUrl })
          .where(eq(talks.id, talkId));

        return NextResponse.json({ success: true, message: 'Thumbnail updated' });
      }

      case 'update-field': {
        const { talkId, field, value } = body;
        if (!talkId || !field) {
          return NextResponse.json(
            { error: 'talkId and field are required' },
            { status: 400 }
          );
        }

        // Validate field is one of the allowed fields
        const allowedFields = ['description', 'tedUrl', 'youtubeUrl', 'title', 'speakerName'];
        if (!allowedFields.includes(field)) {
          return NextResponse.json(
            { error: `Field ${field} is not allowed for quick updates` },
            { status: 400 }
          );
        }

        // Update the field
        const updateData: any = {};
        updateData[field] = value;

        await db
          .update(talks)
          .set(updateData)
          .where(eq(talks.id, talkId));

        return NextResponse.json({ success: true, message: `${field} updated` });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing validation fix:', error);
    return NextResponse.json(
      { error: 'Failed to process validation fix' },
      { status: 500 }
    );
  }
}
