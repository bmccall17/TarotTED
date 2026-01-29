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

  // Load OpenDyslexic font
  const fontRegular = await fetch(
    new URL('/fonts/OpenDyslexic-Regular.woff', 'https://tarottalks.app')
  ).then((res) => res.arrayBuffer());

  const fontBold = await fetch(
    new URL('/fonts/OpenDyslexic-Bold.woff', 'https://tarottalks.app')
  ).then((res) => res.arrayBuffer());

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
            fontFamily: 'OpenDyslexic',
          }}
        >
          Card Not Found: {slug}
        </div>
      ),
      {
        ...size,
        fonts: [
          { name: 'OpenDyslexic', data: fontRegular, weight: 400 },
          { name: 'OpenDyslexic', data: fontBold, weight: 700 },
        ],
      }
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

  // Full summary (no truncation per user request)
  const fullSummary = cardData.summary || '';

  // Truncate talk title if very long
  const truncatedTalkTitle = primaryTalk?.title && primaryTalk.title.length > 60
    ? primaryTalk.title.slice(0, 57) + '...'
    : primaryTalk?.title;

  const fontOptions = {
    fonts: [
      { name: 'OpenDyslexic', data: fontRegular, weight: 400 as const },
      { name: 'OpenDyslexic', data: fontBold, weight: 700 as const },
    ],
  };

  if (layout === 'a') {
    // Option A: Card RIGHT, Content LEFT, Large talk image bottom-left
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
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Content + Talk */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              paddingRight: 30,
            }}
          >
            {/* Top: Branding + Card Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  fontSize: 22,
                  marginBottom: 10,
                }}
              >
                <span style={{ color: '#9ca3af', fontWeight: 400 }}>Tarot</span>
                <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
              </div>

              {/* Card Name */}
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 38,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                {cardData.name}
              </div>

              {/* Full Summary */}
              <div
                style={{
                  color: '#d1d5db',
                  fontSize: 15,
                  lineHeight: 1.4,
                  marginBottom: 12,
                  maxWidth: 500,
                }}
              >
                {fullSummary}
              </div>

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
                      fontSize: 12,
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom: Large Talk Image + Info */}
            {primaryTalk && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 'auto',
                }}
              >
                {talkThumbnailUrl && (
                  <img
                    src={talkThumbnailUrl}
                    alt=""
                    style={{
                      width: 280,
                      height: 158,
                      borderRadius: 12,
                      objectFit: 'cover',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    }}
                  />
                )}
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginTop: 10,
                    maxWidth: 280,
                  }}
                >
                  {truncatedTalkTitle}
                </div>
                <div style={{ color: '#a5b4fc', fontSize: 14, marginTop: 4 }}>
                  {primaryTalk.speakerName}
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
      { ...size, ...fontOptions }
    );
  }

  if (layout === 'b') {
    // Option B: Card LEFT, Content RIGHT (FLIPPED LAYOUT)
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
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Card Image */}
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

          {/* Right side: Content + Talk */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: 30,
            }}
          >
            {/* Top: Branding + Card Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  fontSize: 22,
                  marginBottom: 10,
                }}
              >
                <span style={{ color: '#9ca3af', fontWeight: 400 }}>Tarot</span>
                <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
              </div>

              {/* Card Name */}
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 38,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                {cardData.name}
              </div>

              {/* Full Summary */}
              <div
                style={{
                  color: '#d1d5db',
                  fontSize: 15,
                  lineHeight: 1.4,
                  marginBottom: 12,
                  maxWidth: 500,
                }}
              >
                {fullSummary}
              </div>

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
                      fontSize: 12,
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Right: Large Talk Image + Info */}
            {primaryTalk && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 'auto',
                  alignItems: 'flex-end',
                }}
              >
                {talkThumbnailUrl && (
                  <img
                    src={talkThumbnailUrl}
                    alt=""
                    style={{
                      width: 280,
                      height: 158,
                      borderRadius: 12,
                      objectFit: 'cover',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    }}
                  />
                )}
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginTop: 10,
                    maxWidth: 280,
                    textAlign: 'right',
                  }}
                >
                  {truncatedTalkTitle}
                </div>
                <div style={{ color: '#a5b4fc', fontSize: 14, marginTop: 4, textAlign: 'right' }}>
                  {primaryTalk.speakerName}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      { ...size, ...fontOptions }
    );
  }

  if (layout === 'c') {
    // Option C: Card RIGHT, Content LEFT, Talk image with OVERLAID text
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
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Content + Talk */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              paddingRight: 30,
            }}
          >
            {/* Top: Branding + Card Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  fontSize: 22,
                  marginBottom: 10,
                }}
              >
                <span style={{ color: '#9ca3af', fontWeight: 400 }}>Tarot</span>
                <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
              </div>

              {/* Card Name */}
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 38,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                {cardData.name}
              </div>

              {/* Full Summary */}
              <div
                style={{
                  color: '#d1d5db',
                  fontSize: 15,
                  lineHeight: 1.4,
                  marginBottom: 12,
                  maxWidth: 500,
                }}
              >
                {fullSummary}
              </div>

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
                      fontSize: 12,
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom: Talk Image with Overlaid Text */}
            {primaryTalk && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 'auto',
                  position: 'relative',
                  width: 320,
                }}
              >
                {talkThumbnailUrl && (
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <img
                      src={talkThumbnailUrl}
                      alt=""
                      style={{
                        width: 320,
                        height: 180,
                        borderRadius: 12,
                        objectFit: 'cover',
                      }}
                    />
                    {/* Gradient overlay for text readability */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                        borderRadius: '0 0 12px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.2,
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        }}
                      >
                        {truncatedTalkTitle}
                      </div>
                      <div
                        style={{
                          color: '#a5b4fc',
                          fontSize: 12,
                          marginTop: 4,
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        {primaryTalk.speakerName}
                      </div>
                    </div>
                  </div>
                )}
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
      { ...size, ...fontOptions }
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
          fontFamily: 'OpenDyslexic',
        }}
      >
        Unknown layout: {layout}. Use a, b, or c.
      </div>
    ),
    { ...size, ...fontOptions }
  );
}
