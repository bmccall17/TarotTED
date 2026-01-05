import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
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
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <path d="M16 4 l1 4 l4 1 l-4 1 l-1 4 l-1-4 l-4-1 l4-1 z" fill="#818cf8" />
          <path d="M24 12 l0.5 2 l2 0.5 l-2 0.5 l-0.5 2 l-0.5-2 l-2-0.5 l2-0.5 z" fill="#a78bfa" />
          <path d="M8 20 l0.5 2 l2 0.5 l-2 0.5 l-0.5 2 l-0.5-2 l-2-0.5 l2-0.5 z" fill="#c4b5fd" />
          <path d="M18 24 l0.7 2.5 l2.5 0.7 l-2.5 0.7 l-0.7 2.5 l-0.7-2.5 l-2.5-0.7 l2.5-0.7 z" fill="#ddd6fe" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
