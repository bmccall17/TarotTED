import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '22.5%',
        }}
      >
        {/* Star cluster representing tarot mysticism */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        >
          {/* Main star */}
          <path d="M16 4 l1.5 5 l5 1.5 l-5 1.5 l-1.5 5 l-1.5-5 l-5-1.5 l5-1.5 z" fill="#a78bfa" />
          {/* Upper right star */}
          <path d="M24 10 l0.7 2.5 l2.5 0.7 l-2.5 0.7 l-0.7 2.5 l-0.7-2.5 l-2.5-0.7 l2.5-0.7 z" fill="#c4b5fd" />
          {/* Lower left star */}
          <path d="M8 18 l0.7 2.5 l2.5 0.7 l-2.5 0.7 l-0.7 2.5 l-0.7-2.5 l-2.5-0.7 l2.5-0.7 z" fill="#ddd6fe" />
          {/* Lower center star */}
          <path d="M17 22 l0.8 3 l3 0.8 l-3 0.8 l-0.8 3 l-0.8-3 l-3-0.8 l3-0.8 z" fill="#e9d5ff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
