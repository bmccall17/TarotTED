import { ImageResponse } from 'next/og';
import { getCardBySlug } from '@/lib/db/queries/cards';

export const runtime = 'nodejs';

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

// Layout variants
type LayoutVariant = 'minimal' | 'summary' | 'arcana';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; bg: string; layout: string }> }
) {
  const { slug, bg, layout } = await params;
  const card = await getCardBySlug(slug);

  const size = { width: 1200, height: 630 };
  const backgroundStyle = bg as 'gradient' | 'solid' | 'starfield';
  const layoutVariant = (layout || 'minimal') as LayoutVariant;

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
          Card Not Found: {slug}
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

  // Get background based on style
  let background: string;
  switch (backgroundStyle) {
    case 'solid':
      background = '#1a1a2e';
      break;
    case 'gradient':
    case 'starfield':
    default:
      background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)';
  }

  // Sparkle positions for starfield effect
  const sparkles = backgroundStyle === 'starfield' ? [
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
  ] : [];

  // Arcana label for the 'arcana' variant
  const arcanaLabel = card.arcanaType === 'major'
    ? 'Major Arcana'
    : card.suit
      ? `${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)} · Minor Arcana`
      : 'Minor Arcana';

  // Truncate summary for display
  const truncatedSummary = card.summary && card.summary.length > 120
    ? card.summary.slice(0, 117) + '...'
    : card.summary;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background,
          padding: 50,
          position: 'relative',
        }}
      >
        {/* Starfield sparkles */}
        {sparkles.map((sparkle, i) => (
          <Sparkle key={i} {...sparkle} />
        ))}

        {/* Left side: Content based on layout variant */}
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
              marginBottom: layoutVariant === 'arcana' ? 12 : 24,
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

          {/* Arcana label (only for 'arcana' variant) */}
          {layoutVariant === 'arcana' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 2,
                  background: 'linear-gradient(90deg, #818cf8, transparent)',
                }}
              />
              <span
                style={{
                  color: '#a5b4fc',
                  fontSize: 18,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 500,
                }}
              >
                {arcanaLabel}
              </span>
            </div>
          )}

          {/* Card Name */}
          <div
            style={{
              color: '#ffffff',
              fontSize: layoutVariant === 'summary' ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: layoutVariant === 'summary' ? 16 : 24,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            {card.name}
          </div>

          {/* Summary (only for 'summary' variant) */}
          {layoutVariant === 'summary' && truncatedSummary && (
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
                  fontSize: layoutVariant === 'summary' ? 18 : 22,
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}
              >
                {keyword}
              </span>
            ))}
          </div>

          {/* Tagline (only for 'arcana' variant) */}
          {layoutVariant === 'arcana' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 28,
                color: '#6b7280',
                fontSize: 16,
              }}
            >
              <span>Discover TED talks that embody this card&apos;s wisdom</span>
              <div
                style={{
                  marginLeft: 12,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#818cf8', marginRight: 4 }}>→</span>
                <span style={{ color: '#9ca3af' }}>tarottalks.app</span>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Card Image */}
        <div
          style={{
            width: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImageUrl}
            alt={card.name}
            width={280}
            height={392}
            style={{
              width: 280,
              height: 392,
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
