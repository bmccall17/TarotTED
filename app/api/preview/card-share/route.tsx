import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getCardWithMappings } from '@/lib/db/queries/cards';

export const runtime = 'nodejs';

const size = { width: 1200, height: 630 };

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'the-fool';
  const layout = searchParams.get('layout') || 'a';

  const cardData = await getCardWithMappings(slug);

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
          }}
        >
          Card Not Found: {slug}
        </div>
      ),
      { ...size }
    );
  }

  const keywords: string[] = cardData.keywords ? JSON.parse(cardData.keywords) : [];
  const displayKeywords = keywords.slice(0, 3);

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

  // Truncate talk title
  const truncatedTalkTitle = primaryTalk?.title && primaryTalk.title.length > 50
    ? primaryTalk.title.slice(0, 47) + '...'
    : primaryTalk?.title;

  // Truncate summary based on layout
  const summaryMaxLength = layout === 'c' ? 80 : 100;
  const truncatedSummary = cardData.summary && cardData.summary.length > summaryMaxLength
    ? cardData.summary.slice(0, summaryMaxLength - 3) + '...'
    : cardData.summary;

  if (layout === 'a') {
    // Option A: Compact Talk Strip
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: 40,
            position: 'relative',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingRight: 30,
            }}
          >
            {/* Top section */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                <span style={{ color: '#9ca3af', fontWeight: 300 }}>Tarot</span>
                <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
              </div>

              {/* Card Name */}
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 44,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                }}
              >
                {cardData.name}
              </div>

              {/* Summary */}
              {truncatedSummary && (
                <div
                  style={{
                    color: '#d1d5db',
                    fontSize: 18,
                    lineHeight: 1.4,
                    marginBottom: 16,
                    maxWidth: 480,
                  }}
                >
                  {truncatedSummary}
                </div>
              )}

              {/* Keywords */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {displayKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(99, 102, 241, 0.3)',
                      color: '#a5b4fc',
                      padding: '8px 16px',
                      borderRadius: 20,
                      fontSize: 14,
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom: Talk Strip */}
            {primaryTalk && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 12,
                  padding: 12,
                  gap: 14,
                  marginTop: 20,
                }}
              >
                {talkThumbnailUrl && (
                  <img
                    src={talkThumbnailUrl}
                    alt=""
                    style={{
                      width: 70,
                      height: 52,
                      borderRadius: 6,
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: 15,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      marginBottom: 4,
                    }}
                  >
                    {truncatedTalkTitle}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 13 }}>
                    {primaryTalk.speakerName}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side: Card Image */}
          <div
            style={{
              width: 300,
              height: 550,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={cardImageUrl}
              alt={cardData.name}
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
      { ...size }
    );
  }

  if (layout === 'b') {
    // Option B: Glass Card Overlay
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: 40,
            position: 'relative',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              paddingRight: 30,
            }}
          >
            {/* Top section */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                <span style={{ color: '#9ca3af', fontWeight: 300 }}>Tarot</span>
                <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
              </div>

              {/* Card Name */}
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 44,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                }}
              >
                {cardData.name}
              </div>

              {/* Summary */}
              {truncatedSummary && (
                <div
                  style={{
                    color: '#d1d5db',
                    fontSize: 18,
                    lineHeight: 1.4,
                    marginBottom: 16,
                    maxWidth: 480,
                  }}
                >
                  {truncatedSummary}
                </div>
              )}

              {/* Keywords */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {displayKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(99, 102, 241, 0.3)',
                      color: '#a5b4fc',
                      padding: '8px 16px',
                      borderRadius: 20,
                      fontSize: 14,
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom: Glass Card */}
            {primaryTalk && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  padding: 16,
                  gap: 16,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  marginTop: 20,
                }}
              >
                {talkThumbnailUrl && (
                  <img
                    src={talkThumbnailUrl}
                    alt=""
                    style={{
                      width: 100,
                      height: 75,
                      borderRadius: 8,
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div
                    style={{
                      color: '#a5b4fc',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 4,
                    }}
                  >
                    Featured Talk
                  </div>
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      marginBottom: 4,
                    }}
                  >
                    {truncatedTalkTitle}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>
                    {primaryTalk.speakerName}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side: Card Image */}
          <div
            style={{
              width: 300,
              height: 550,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={cardImageUrl}
              alt={cardData.name}
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
      { ...size }
    );
  }

  if (layout === 'c') {
    // Option C: Full-Width Footer Banner
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            position: 'relative',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Main content area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              padding: 40,
              paddingBottom: 20,
            }}
          >
            {/* Left side: Content */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingRight: 30,
              }}
            >
              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                <span style={{ color: '#9ca3af', fontWeight: 300 }}>Tarot</span>
                <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
              </div>

              {/* Card Name */}
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 42,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                }}
              >
                {cardData.name}
              </div>

              {/* Summary */}
              {truncatedSummary && (
                <div
                  style={{
                    color: '#d1d5db',
                    fontSize: 17,
                    lineHeight: 1.4,
                    marginBottom: 14,
                    maxWidth: 450,
                  }}
                >
                  {truncatedSummary}
                </div>
              )}

              {/* Keywords */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {displayKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(99, 102, 241, 0.3)',
                      color: '#a5b4fc',
                      padding: '6px 14px',
                      borderRadius: 16,
                      fontSize: 13,
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Right side: Card Image */}
            <div
              style={{
                width: 280,
                height: 440,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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

          {/* Footer Banner */}
          {primaryTalk && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '16px 40px',
                gap: 20,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {talkThumbnailUrl && (
                <img
                  src={talkThumbnailUrl}
                  alt=""
                  style={{
                    width: 90,
                    height: 68,
                    borderRadius: 8,
                    objectFit: 'cover',
                  }}
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 17,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  {truncatedTalkTitle}
                </div>
                <div style={{ color: '#9ca3af', fontSize: 14 }}>
                  {primaryTalk.speakerName}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#a5b4fc',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Watch on TarotTALKS
              </div>
            </div>
          )}
        </div>
      ),
      { ...size }
    );
  }

  // Default fallback
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e1b4b',
          color: 'white',
          fontSize: 32,
        }}
      >
        Unknown layout: {layout}. Use a, b, or c.
      </div>
    ),
    { ...size }
  );
}
