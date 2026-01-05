import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function StarIcon({ size }: { size: number }) {
  const scale = size / 180;
  const starScale = 120 * scale;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        borderRadius: size > 100 ? '22.5%' : '0',
      }}
    >
      <svg
        width={starScale}
        height={starScale}
        viewBox="0 0 32 32"
        style={{ filter: size > 100 ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : undefined }}
      >
        <path d="M16 4 l1.5 5 l5 1.5 l-5 1.5 l-1.5 5 l-1.5-5 l-5-1.5 l5-1.5 z" fill="#a78bfa" />
        <path d="M24 10 l0.7 2.5 l2.5 0.7 l-2.5 0.7 l-0.7 2.5 l-0.7-2.5 l-2.5-0.7 l2.5-0.7 z" fill="#c4b5fd" />
        <path d="M8 18 l0.7 2.5 l2.5 0.7 l-2.5 0.7 l-0.7 2.5 l-0.7-2.5 l-2.5-0.7 l2.5-0.7 z" fill="#ddd6fe" />
        <path d="M17 22 l0.8 3 l3 0.8 l-3 0.8 l-0.8 3 l-0.8-3 l-3-0.8 l3-0.8 z" fill="#e9d5ff" />
      </svg>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  const size = sizeParam ? parseInt(sizeParam, 10) : 192;

  // Validate size
  const validSizes = [32, 64, 128, 180, 192, 512];
  const finalSize = validSizes.includes(size) ? size : 192;

  return new ImageResponse(<StarIcon size={finalSize} />, {
    width: finalSize,
    height: finalSize,
  });
}
