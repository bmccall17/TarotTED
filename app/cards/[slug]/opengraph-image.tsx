import { ImageResponse } from 'next/og';
import { getCardBySlug } from '@/lib/db/queries/cards';

// Use nodejs runtime since our database client isn't edge-compatible
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

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);

  if (!card) {
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
          }}
        >
          Card Not Found
        </div>
      ),
      { ...size }
    );
  }

  const keywords: string[] = card.keywords ? JSON.parse(card.keywords) : [];
  const displayKeywords = keywords.slice(0, 4);

  // Ensure the image URL is absolute
  const cardImageUrl = card.imageUrl.startsWith('http')
    ? card.imageUrl
    : `https://tarottalks.app${card.imageUrl}`;

  // Truncate summary for display
  const truncatedSummary = card.summary && card.summary.length > 120
    ? card.summary.slice(0, 117) + '...'
    : card.summary;

  // Sparkle positions for starfield effect
  const sparkles = [
    { x: 50, y: 80, size: 4, opacity: 0.8 },
    { x: 150, y: 150, size: 3, opacity: 0.6 },
    { x: 80, y: 350, size: 5, opacity: 0.7 },
    { x: 200, y: 500, size: 3, opacity: 0.5 },
    { x: 350, y: 100, size: 4, opacity: 0.6 },
    { x: 450, y: 280, size: 3, opacity: 0.4 },
    { x: 550, y: 450, size: 5, opacity: 0.7 },
    { x: 650, y: 120, size: 3, opacity: 0.5 },
    { x: 750, y: 380, size: 4, opacity: 0.6 },
    { x: 1050, y: 100, size: 4, opacity: 0.7 },
    { x: 1100, y: 300, size: 3, opacity: 0.5 },
    { x: 1130, y: 500, size: 5, opacity: 0.6 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          padding: 50,
          position: 'relative',
        }}
      >
        {/* Starfield sparkles */}
        {sparkles.map((sparkle, i) => (
          <Sparkle key={i} {...sparkle} />
        ))}

        {/* Left side: Branding + Card Name + Summary + Keywords */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: 40,
          }}
        >
          {/* Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: 28,
              marginBottom: 24,
            }}
          >
            <span style={{ color: '#9ca3af', fontWeight: 300 }}>Tarot</span>
            <span
              style={{
                color: '#EB0028',
                fontWeight: 700,
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              TALKS
            </span>
          </div>

          {/* Card Name */}
          <div
            style={{
              color: '#ffffff',
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            {card.name}
          </div>

          {/* Summary */}
          {truncatedSummary && (
            <div
              style={{
                color: '#d1d5db',
                fontSize: 20,
                lineHeight: 1.4,
                marginBottom: 20,
                maxWidth: 500,
              }}
            >
              {truncatedSummary}
            </div>
          )}

          {/* Keywords */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {displayKeywords.map((keyword, index) => (
              <span
                key={index}
                style={{
                  background: 'rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  padding: '10px 20px',
                  borderRadius: 24,
                  fontSize: 18,
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Right side: Card Image - full card, no cropping */}
        <div
          style={{
            width: 340,
            height: 530,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImageUrl}
            alt={card.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
