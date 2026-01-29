import { ImageResponse } from 'next/og';
import { getCardWithMappings } from '@/lib/db/queries/cards';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'TarotTALKS Card';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let cardData = null;
  try {
    cardData = await getCardWithMappings(slug);
  } catch (error) {
    console.error('Error fetching card data:', error);
  }

  if (!cardData) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            color: 'white',
            fontSize: 48,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Card Not Found: {slug}
        </div>
      ),
      { ...size }
    );
  }

  const keywords: string[] = cardData.keywords ? JSON.parse(cardData.keywords) : [];
  const displayKeywords = keywords.slice(0, 4);

  const cardImageUrl = cardData.imageUrl.startsWith('http')
    ? cardData.imageUrl
    : `https://tarottalks.app${cardData.imageUrl}`;

  // Get primary talk
  const primaryMapping = cardData.mappings.find(m => m.mapping.isPrimary);
  const primaryTalk = primaryMapping?.talk;

  const talkThumbnailUrl = primaryTalk?.thumbnailUrl?.startsWith('http')
    ? primaryTalk.thumbnailUrl
    : primaryTalk?.thumbnailUrl
    ? `https://tarottalks.app${primaryTalk.thumbnailUrl}`
    : null;

  const fullSummary = cardData.summary || '';

  const truncatedTalkTitle = primaryTalk?.title && primaryTalk.title.length > 55
    ? primaryTalk.title.slice(0, 52) + '...'
    : primaryTalk?.title;

  // Generate sparkles with inline calculation
  const sparkles: Array<{ x: number; y: number; s: number; o: number }> = [];
  let seed = Date.now();
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const sparkleCount = 12 + Math.floor(random() * 4);
  for (let i = 0; i < sparkleCount; i++) {
    sparkles.push({
      x: Math.floor(random() * 1150) + 25,
      y: Math.floor(random() * 580) + 25,
      s: Math.floor(random() * 3) + 3,
      o: 0.4 + random() * 0.5,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          padding: 36,
          paddingBottom: 80,
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Sparkles */}
        {sparkles.map((sp, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: sp.x,
              top: sp.y,
              width: sp.s,
              height: sp.s,
              background: `rgba(255, 255, 255, ${sp.o})`,
              borderRadius: '50%',
            }}
          />
        ))}

        {/* Left Column: Brand + Talk */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 320,
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', fontSize: 32 }}>
            <span style={{ color: '#9ca3af' }}>Tarot</span>
            <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
          </div>

          {/* Talk */}
          {primaryTalk && talkThumbnailUrl && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <img
                src={talkThumbnailUrl}
                alt=""
                width={300}
                height={150}
                style={{
                  borderRadius: 12,
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 20,
                  fontWeight: 700,
                  marginTop: 10,
                  maxWidth: 300,
                }}
              >
                {truncatedTalkTitle}
              </div>
              <div style={{ color: '#a5b4fc', fontSize: 16, marginTop: 4 }}>
                {primaryTalk.speakerName}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Content + Card */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            paddingLeft: 24,
          }}
        >
          {/* Text Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: 20,
            }}
          >
            {/* Card Name */}
            <div
              style={{
                color: '#ffffff',
                fontSize: 48,
                fontWeight: 700,
                marginBottom: 14,
                textTransform: 'uppercase',
              }}
            >
              {cardData.name}
            </div>

            {/* Summary */}
            <div
              style={{
                color: '#d1d5db',
                fontSize: 20,
                marginBottom: 16,
                maxWidth: 420,
                textAlign: 'right',
              }}
            >
              {fullSummary}
            </div>

            {/* Keywords */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
              {displayKeywords.map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    background: 'rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 16,
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Card Image */}
          <div
            style={{
              width: 260,
              height: 514,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={cardImageUrl}
              alt={cardData.name}
              width={260}
              height={514}
              style={{
                borderRadius: 14,
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
