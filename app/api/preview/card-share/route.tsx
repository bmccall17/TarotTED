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

// Fixed branding component - ensures baseline alignment
function Brand({ fontSize = 32 }: { fontSize?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        lineHeight: 1,
      }}
    >
      <span style={{ color: '#9ca3af', fontWeight: 400, fontSize }}>Tarot</span>
      <span style={{ color: '#EB0028', fontWeight: 700, fontSize }}>TALKS</span>
    </div>
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
  const layout = searchParams.get('layout') || 'a1';

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

  // Full summary
  const fullSummary = cardData.summary || '';

  // Truncate talk title if very long
  const truncatedTalkTitle = primaryTalk?.title && primaryTalk.title.length > 55
    ? primaryTalk.title.slice(0, 52) + '...'
    : primaryTalk?.title;

  const fontOptions = {
    fonts: [
      { name: 'OpenDyslexic', data: fontRegular, weight: 400 as const },
      { name: 'OpenDyslexic', data: fontBold, weight: 700 as const },
    ],
  };

  // ============================================
  // LAYOUT A1: Brand TOP-LEFT, content right-justified
  // ============================================
  if (layout === 'a1') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: 36,
            position: 'relative',
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Talk Image */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              width: 320,
            }}
          >
            {primaryTalk && talkThumbnailUrl && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  src={talkThumbnailUrl}
                  alt=""
                  style={{
                    width: 300,
                    height: 169,
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                />
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginTop: 12,
                    maxWidth: 300,
                  }}
                >
                  {truncatedTalkTitle}
                </div>
                <div style={{ color: '#a5b4fc', fontSize: 18, marginTop: 6 }}>
                  {primaryTalk.speakerName}
                </div>
              </div>
            )}
          </div>

          {/* Right side: Brand + Card Info + Card Image */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              paddingLeft: 24,
            }}
          >
            {/* Brand - TOP LEFT of right section */}
            <div style={{ width: '100%', marginBottom: 12 }}>
              <Brand fontSize={28} />
            </div>

            {/* Content row: text + card */}
            <div style={{ display: 'flex', flex: 1, width: '100%' }}>
              {/* Text content - right justified */}
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
                  height: 520,
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
          </div>
        </div>
      ),
      { ...size, ...fontOptions }
    );
  }

  // ============================================
  // LAYOUT A2: Brand TOP-RIGHT (above card), content right-justified
  // ============================================
  if (layout === 'a2') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: 36,
            position: 'relative',
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Talk Image */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              width: 320,
            }}
          >
            {primaryTalk && talkThumbnailUrl && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  src={talkThumbnailUrl}
                  alt=""
                  style={{
                    width: 300,
                    height: 169,
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                />
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginTop: 12,
                    maxWidth: 300,
                  }}
                >
                  {truncatedTalkTitle}
                </div>
                <div style={{ color: '#a5b4fc', fontSize: 18, marginTop: 6 }}>
                  {primaryTalk.speakerName}
                </div>
              </div>
            )}
          </div>

          {/* Right side: Content + Card Image */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: 24,
            }}
          >
            {/* Content row: text + card with brand */}
            <div style={{ display: 'flex', flex: 1, width: '100%' }}>
              {/* Text content - right justified */}
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

              {/* Card column with brand above */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Brand - TOP RIGHT above card */}
                <div style={{ marginBottom: 10 }}>
                  <Brand fontSize={26} />
                </div>

                {/* Card Image */}
                <div
                  style={{
                    width: 260,
                    height: 500,
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
            </div>
          </div>
        </div>
      ),
      { ...size, ...fontOptions }
    );
  }

  // ============================================
  // LAYOUT A3: Brand BOTTOM-LEFT (near talk), content right-justified
  // ============================================
  if (layout === 'a3') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: 36,
            position: 'relative',
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Brand on top, Talk Image below */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 320,
            }}
          >
            {/* Brand - TOP LEFT */}
            <Brand fontSize={32} />

            {primaryTalk && talkThumbnailUrl && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  src={talkThumbnailUrl}
                  alt=""
                  style={{
                    width: 300,
                    height: 169,
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                />
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginTop: 12,
                    maxWidth: 300,
                  }}
                >
                  {truncatedTalkTitle}
                </div>
                <div style={{ color: '#a5b4fc', fontSize: 18, marginTop: 6 }}>
                  {primaryTalk.speakerName}
                </div>
              </div>
            )}
          </div>

          {/* Right side: Content + Card Image */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              paddingLeft: 24,
            }}
          >
            {/* Text content - right justified */}
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
                height: 558,
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
        </div>
      ),
      { ...size, ...fontOptions }
    );
  }

  // ============================================
  // LAYOUT C1: Overlay text on talk, Brand TOP-LEFT
  // ============================================
  if (layout === 'c1') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: 36,
            position: 'relative',
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Brand + Talk Image with overlay */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 340,
            }}
          >
            {/* Brand - TOP LEFT */}
            <Brand fontSize={32} />

            {primaryTalk && talkThumbnailUrl && (
              <div style={{ position: 'relative', display: 'flex', width: 320 }}>
                <img
                  src={talkThumbnailUrl}
                  alt=""
                  style={{
                    width: 320,
                    height: 180,
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                />
                {/* Gradient overlay for text */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 110,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    borderRadius: '0 0 12px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {truncatedTalkTitle}
                  </div>
                  <div
                    style={{
                      color: '#a5b4fc',
                      fontSize: 15,
                      marginTop: 6,
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}
                  >
                    {primaryTalk.speakerName}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side: Content + Card Image */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              paddingLeft: 24,
            }}
          >
            {/* Text content - right justified */}
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
                height: 558,
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
        </div>
      ),
      { ...size, ...fontOptions }
    );
  }

  // ============================================
  // LAYOUT C2: Overlay text on talk, Brand TOP-RIGHT (above card)
  // ============================================
  if (layout === 'c2') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
            padding: 36,
            position: 'relative',
            fontFamily: 'OpenDyslexic',
          }}
        >
          {sparkles.map((sparkle, i) => (
            <Sparkle key={i} {...sparkle} />
          ))}

          {/* Left side: Talk Image with overlay */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              width: 340,
            }}
          >
            {primaryTalk && talkThumbnailUrl && (
              <div style={{ position: 'relative', display: 'flex', width: 320 }}>
                <img
                  src={talkThumbnailUrl}
                  alt=""
                  style={{
                    width: 320,
                    height: 180,
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                />
                {/* Gradient overlay for text */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 110,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    borderRadius: '0 0 12px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {truncatedTalkTitle}
                  </div>
                  <div
                    style={{
                      color: '#a5b4fc',
                      fontSize: 15,
                      marginTop: 6,
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}
                  >
                    {primaryTalk.speakerName}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side: Content + Card with brand */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              paddingLeft: 24,
            }}
          >
            {/* Text content - right justified */}
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

            {/* Card column with brand above */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Brand - TOP RIGHT above card */}
              <div style={{ marginBottom: 10 }}>
                <Brand fontSize={26} />
              </div>

              {/* Card Image */}
              <div
                style={{
                  width: 260,
                  height: 510,
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
          flexDirection: 'column',
          background: '#1e1b4b',
          color: 'white',
          fontSize: 28,
          fontFamily: 'OpenDyslexic',
          gap: 20,
        }}
      >
        <div>Unknown layout: {layout}</div>
        <div style={{ fontSize: 20, color: '#a5b4fc' }}>
          Available: a1, a2, a3, c1, c2
        </div>
      </div>
    ),
    { ...size, ...fontOptions }
  );
}
