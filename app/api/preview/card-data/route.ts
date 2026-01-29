import { NextRequest, NextResponse } from 'next/server';
import { getCardWithMappings } from '@/lib/db/queries/cards';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const cardData = await getCardWithMappings(slug);

  if (!cardData) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // Get primary talk
  const primaryMapping = cardData.mappings.find(m => m.mapping.isPrimary);
  const primaryTalk = primaryMapping?.talk;

  // Parse keywords
  const keywords: string[] = cardData.keywords ? JSON.parse(cardData.keywords) : [];

  // Build response
  const response = {
    name: cardData.name,
    summary: cardData.summary || '',
    keywords,
    imageUrl: cardData.imageUrl.startsWith('http')
      ? cardData.imageUrl
      : `https://tarottalks.app${cardData.imageUrl}`,
    talk: primaryTalk
      ? {
          title: primaryTalk.title,
          speakerName: primaryTalk.speakerName,
          thumbnailUrl: primaryTalk.thumbnailUrl?.startsWith('http')
            ? primaryTalk.thumbnailUrl
            : primaryTalk.thumbnailUrl
            ? `https://tarottalks.app${primaryTalk.thumbnailUrl}`
            : null,
        }
      : undefined,
  };

  return NextResponse.json(response);
}
