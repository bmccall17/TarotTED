import { ImageResponse } from 'next/og';
import { getCardWithMappings } from '@/lib/db/queries/cards';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'TarotTALKS Card';

// Sparkle component for starfield effect
function Sparkle({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        background: `rgba(255, 255, 255, ${opacity})`,
        borderRadius: '50%',
        boxShadow: `0 0 ${size * 2}px ${size}px rgba(255, 255, 255, ${opacity * 0.5})`,
      }}
    />
  );
}

// Generate unique sparkles based on card slug
function generateSparkles(slug: string) {
  // Simple hash function to create seed from slug
  let seed = 0;
  for (let i = 0; i < slug.length; i++) {
    seed = ((seed << 5) - seed) + slug.charCodeAt(i);
    seed = seed & seed;
  }

  // Seeded random function
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Generate 12-15 sparkles with random positions
  const count = 12 + Math.floor(seededRandom() * 4);
  const sparkles = [];

  for (let i = 0; i < count; i++) {
    sparkles.push({
      x: Math.floor(seededRandom() * 1150) + 25,
      y: Math.floor(seededRandom() * 580) + 25,
      size: Math.floor(seededRandom() * 3) + 3,
      opacity: 0.4 + seededRandom() * 0.5,
    });
  }

  return sparkles;
}

// Load OpenDyslexic font
async function loadFonts() {
  const baseUrl = 'https://tarottalks.app';
  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch(`${baseUrl}/fonts/OpenDyslexic-Regular.woff`),
      fetch(`${baseUrl}/fonts/OpenDyslexic-Bold.woff`),
    ]);

    if (!regularRes.ok || !boldRes.ok) {
      return null;
    }

    return {
      regular: await regularRes.arrayBuffer(),
      bold: await boldRes.arrayBuffer(),
    };
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Load fonts and card data in parallel
  const [fonts, cardData] = await Promise.all([
    loadFonts(),
    getCardWithMappings(slug),
  ]);

  const fontFamily = fonts ? 'OpenDyslexic' : 'system-ui, sans-serif';
  const fontOptions = fonts
    ? {
        fonts: [
          { name: 'OpenDyslexic', data: fonts.regular, weight: 400 as const },
          { name: 'OpenDyslexic', data: fonts.bold, weight: 700 as const },
        ],
      }
    : {};

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
            fontFamily,
          }}
        >
          Card Not Found
        </div>
      ),
      { ...size, ...fontOptions }
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

  // Full summary
  const fullSummary = cardData.summary || '';

  // Truncate talk title if very long
  const truncatedTalkTitle = primaryTalk?.title && primaryTalk.title.length > 55
    ? primaryTalk.title.slice(0, 52) + '...'
    : primaryTalk?.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          padding: 36,
          paddingBottom: 80, // Safe buffer for Twitter overlay
          position: 'relative',
          fontFamily,
        }}
      >
        {generateSparkles(slug).map((sparkle, i) => (
          <Sparkle key={i} {...sparkle} />
        ))}

        {/* Left: Brand + Talk */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 320,
          }}
        >
          {/* Brand - top left (baseline aligned) */}
          <div style={{ fontSize: 32, lineHeight: 1 }}>
            <span style={{ color: '#9ca3af', fontWeight: 400 }}>Tarot</span>
            <span style={{ color: '#EB0028', fontWeight: 700, position: 'relative', top: -1 }}>TALKS</span>
          </div>

          {/* Talk - bottom left (with buffer for overlay) */}
          {primaryTalk && talkThumbnailUrl && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={talkThumbnailUrl}
                alt=""
                style={{
                  width: 300,
                  height: 150,
                  borderRadius: 12,
                  objectFit: 'cover',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.2,
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

        {/* Right: Content + Card */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            paddingLeft: 24,
          }}
        >
          {/* Text - right justified, vertically centered */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              textAlign: 'right',
              paddingRight: 20,
            }}
          >
            {/* Card Name */}
            <div
              style={{
                color: '#ffffff',
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 14,
                textTransform: 'uppercase',
              }}
            >
              {cardData.name}
            </div>

            {/* Full Summary */}
            <div
              style={{
                color: '#d1d5db',
                fontSize: 20,
                lineHeight: 1.4,
                marginBottom: 16,
                maxWidth: 420,
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
                    border: '1px solid rgba(99, 102, 241, 0.4)',
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImageUrl}
              alt={cardData.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: 14,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size, ...fontOptions }
  );
}
