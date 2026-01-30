import { ImageResponse } from 'next/og';
import { getTalkWithMappedCards } from '@/lib/db/queries/talks';
import { getThumbnailUrl } from '@/lib/utils/thumbnails';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'TarotTALKS Talk';

// Load OpenDyslexic font from local filesystem
async function loadFonts() {
  try {
    const fontsDir = join(process.cwd(), 'public', 'fonts');
    const [regular, bold] = await Promise.all([
      readFile(join(fontsDir, 'OpenDyslexic-Regular.woff')),
      readFile(join(fontsDir, 'OpenDyslexic-Bold.woff')),
    ]);

    return {
      regular: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength),
      bold: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength),
    };
  } catch (error) {
    console.error('Failed to load fonts from filesystem:', error);
    return null;
  }
}

// Generate sparkles for visual effect
function generateSparkles() {
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
  return sparkles;
}

// Helper to truncate text
function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Load fonts and talk data in parallel
  const [fonts, talkData] = await Promise.all([
    loadFonts(),
    getTalkWithMappedCards(slug).catch((error) => {
      console.error('Error fetching talk data:', error);
      return null;
    }),
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

  // Fallback for talk not found
  if (!talkData) {
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
          Talk Not Found: {slug}
        </div>
      ),
      { ...size, ...fontOptions }
    );
  }

  // Get primary mapped card
  const primaryMapping = talkData.mappedCards.find(m => m.mapping.isPrimary) || talkData.mappedCards[0];
  const primaryCard = primaryMapping?.card;
  const rationaleShort = truncate(primaryMapping?.mapping.rationaleShort, 150);

  // Get thumbnail URL
  const thumbnailUrl = getThumbnailUrl(talkData.thumbnailUrl, talkData.youtubeVideoId);
  const fullThumbnailUrl = thumbnailUrl?.startsWith('http')
    ? thumbnailUrl
    : thumbnailUrl
    ? `https://tarottalks.app${thumbnailUrl}`
    : null;

  // Get card image URL
  const cardImageUrl = primaryCard?.imageUrl?.startsWith('http')
    ? primaryCard.imageUrl
    : primaryCard?.imageUrl
    ? `https://tarottalks.app${primaryCard.imageUrl}`
    : null;

  const sparkles = generateSparkles();
  const truncatedTitle = truncate(talkData.title, 70);
  const eventYear = [talkData.eventName, talkData.year].filter(Boolean).join(' ');
  const duration = talkData.durationSeconds
    ? `${Math.floor(talkData.durationSeconds / 60)} min`
    : null;

  // Layout A: Three-Column
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
          fontFamily,
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

        {/* Brand */}
        <div style={{ position: 'absolute', top: 36, left: 36, display: 'flex', fontSize: 32 }}>
          <span style={{ color: '#9ca3af' }}>Tarot</span>
          <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', width: '100%', marginTop: 60, gap: 24 }}>
          {/* Left: Talk Thumbnail */}
          <div style={{ display: 'flex', flexDirection: 'column', width: 420 }}>
            {fullThumbnailUrl ? (
              <img
                src={fullThumbnailUrl}
                alt=""
                width={420}
                height={236}
                style={{ borderRadius: 12, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 420,
                  height: 236,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: 24,
                }}
              >
                TED Talk
              </div>
            )}
          </div>

          {/* Center: Text Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingRight: 16,
            }}
          >
            {/* Title */}
            <div
              style={{
                color: '#ffffff',
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              {truncatedTitle}
            </div>

            {/* Speaker */}
            <div style={{ color: '#a5b4fc', fontSize: 22, marginBottom: 12 }}>
              by {talkData.speakerName}
            </div>

            {/* Metadata badges */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {eventYear && (
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    padding: '6px 12px',
                    borderRadius: 16,
                    fontSize: 14,
                  }}
                >
                  {eventYear}
                </span>
              )}
              {duration && (
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    padding: '6px 12px',
                    borderRadius: 16,
                    fontSize: 14,
                  }}
                >
                  {duration}
                </span>
              )}
            </div>

            {/* Rationale */}
            {rationaleShort && (
              <div
                style={{
                  color: '#d1d5db',
                  fontSize: 16,
                  fontStyle: 'italic',
                  maxWidth: 380,
                }}
              >
                &ldquo;{rationaleShort}&rdquo;
              </div>
            )}
          </div>

          {/* Right: Card Image */}
          {cardImageUrl ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={cardImageUrl}
                alt={primaryCard?.name || 'Card'}
                width={160}
                height={316}
                style={{ borderRadius: 12, objectFit: 'contain' }}
              />
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size, ...fontOptions }
  );
}
