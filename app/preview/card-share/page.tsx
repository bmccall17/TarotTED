'use client';

import { useEffect, useState } from 'react';

interface CardData {
  name: string;
  summary: string;
  keywords: string[];
  imageUrl: string;
  talk?: {
    title: string;
    speakerName: string;
    thumbnailUrl: string | null;
  };
}

// Sparkle component
function Sparkle({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `rgba(255, 255, 255, ${opacity})`,
        boxShadow: `0 0 ${size * 2}px ${size}px rgba(255, 255, 255, ${opacity * 0.5})`,
      }}
    />
  );
}

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

// Brand component - fixed baseline alignment using single text block
function Brand({ fontSize = 32 }: { fontSize?: number }) {
  return (
    <p style={{ fontSize, lineHeight: 1, margin: 0 }}>
      <span style={{ color: '#9ca3af', fontWeight: 400 }}>Tarot</span>
      <span style={{ color: '#EB0028', fontWeight: 700 }}>TALKS</span>
    </p>
  );
}

// Layout A1: Brand top-left of content, talk bottom-left
function LayoutA1({ card }: { card: CardData }) {
  return (
    <div
      className="relative flex"
      style={{
        width: 1200,
        height: 630,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: 36,
      }}
    >
      {sparkles.map((s, i) => <Sparkle key={i} {...s} />)}

      {/* Left: Talk */}
      <div className="flex flex-col justify-end" style={{ width: 320 }}>
        {card.talk?.thumbnailUrl && (
          <div className="flex flex-col">
            <img
              src={card.talk.thumbnailUrl}
              alt=""
              className="rounded-xl object-cover"
              style={{ width: 300, height: 169, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            />
            <div className="text-white font-bold mt-3" style={{ fontSize: 22, lineHeight: 1.2, maxWidth: 300 }}>
              {card.talk.title}
            </div>
            <div style={{ color: '#a5b4fc', fontSize: 18, marginTop: 6 }}>
              {card.talk.speakerName}
            </div>
          </div>
        )}
      </div>

      {/* Right: Brand + Content + Card */}
      <div className="flex-1 flex flex-col pl-6">
        <div className="mb-3">
          <Brand fontSize={28} />
        </div>
        <div className="flex flex-1">
          {/* Text - right justified, top aligned */}
          <div className="flex-1 flex flex-col justify-start items-end text-right pr-5">
            <div className="text-white font-bold uppercase" style={{ fontSize: 48, lineHeight: 1.1, marginBottom: 14 }}>
              {card.name}
            </div>
            <div style={{ color: '#d1d5db', fontSize: 20, lineHeight: 1.4, marginBottom: 16, maxWidth: 420 }}>
              {card.summary}
            </div>
            <div className="flex flex-wrap gap-2.5 justify-end">
              {card.keywords.slice(0, 4).map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full"
                  style={{
                    background: 'rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    padding: '8px 16px',
                    fontSize: 16,
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          {/* Card image */}
          <div className="flex items-center justify-center" style={{ width: 260, height: 520 }}>
            <img
              src={card.imageUrl}
              alt={card.name}
              className="rounded-2xl object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Layout A3: Brand top-left corner, talk bottom-left
function LayoutA3({ card }: { card: CardData }) {
  return (
    <div
      className="relative flex"
      style={{
        width: 1200,
        height: 630,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: 36,
      }}
    >
      {sparkles.map((s, i) => <Sparkle key={i} {...s} />)}

      {/* Left: Brand + Talk */}
      <div className="flex flex-col justify-between" style={{ width: 320 }}>
        <Brand fontSize={32} />
        {card.talk?.thumbnailUrl && (
          <div className="flex flex-col">
            <img
              src={card.talk.thumbnailUrl}
              alt=""
              className="rounded-xl object-cover"
              style={{ width: 300, height: 169, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            />
            <div className="text-white font-bold mt-3" style={{ fontSize: 22, lineHeight: 1.2, maxWidth: 300 }}>
              {card.talk.title}
            </div>
            <div style={{ color: '#a5b4fc', fontSize: 18, marginTop: 6 }}>
              {card.talk.speakerName}
            </div>
          </div>
        )}
      </div>

      {/* Right: Content + Card */}
      <div className="flex-1 flex pl-6">
        {/* Text - right justified */}
        <div className="flex-1 flex flex-col justify-center items-end text-right pr-5">
          <div className="text-white font-bold uppercase" style={{ fontSize: 48, lineHeight: 1.1, marginBottom: 14 }}>
            {card.name}
          </div>
          <div style={{ color: '#d1d5db', fontSize: 20, lineHeight: 1.4, marginBottom: 16, maxWidth: 420 }}>
            {card.summary}
          </div>
          <div className="flex flex-wrap gap-2.5 justify-end">
            {card.keywords.slice(0, 4).map((kw, i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  background: 'rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  padding: '8px 16px',
                  fontSize: 16,
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
        {/* Card image */}
        <div className="flex items-center justify-center" style={{ width: 260, height: 558 }}>
          <img
            src={card.imageUrl}
            alt={card.name}
            className="rounded-2xl object-contain"
            style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
          />
        </div>
      </div>
    </div>
  );
}

// Layout C1: Brand top-left, talk with overlay text
function LayoutC1({ card }: { card: CardData }) {
  return (
    <div
      className="relative flex"
      style={{
        width: 1200,
        height: 630,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: 36,
      }}
    >
      {sparkles.map((s, i) => <Sparkle key={i} {...s} />)}

      {/* Left: Brand + Talk with overlay */}
      <div className="flex flex-col justify-between" style={{ width: 340 }}>
        <Brand fontSize={32} />
        {card.talk?.thumbnailUrl && (
          <div className="relative" style={{ width: 320 }}>
            <img
              src={card.talk.thumbnailUrl}
              alt=""
              className="rounded-xl object-cover"
              style={{ width: 320, height: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            />
            {/* Overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-3.5"
              style={{
                height: 110,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                borderRadius: '0 0 12px 12px',
              }}
            >
              <div className="text-white font-bold" style={{ fontSize: 18, lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {card.talk.title}
              </div>
              <div style={{ color: '#a5b4fc', fontSize: 15, marginTop: 6, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {card.talk.speakerName}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Content + Card */}
      <div className="flex-1 flex pl-6">
        {/* Text - right justified */}
        <div className="flex-1 flex flex-col justify-center items-end text-right pr-5">
          <div className="text-white font-bold uppercase" style={{ fontSize: 48, lineHeight: 1.1, marginBottom: 14 }}>
            {card.name}
          </div>
          <div style={{ color: '#d1d5db', fontSize: 20, lineHeight: 1.4, marginBottom: 16, maxWidth: 420 }}>
            {card.summary}
          </div>
          <div className="flex flex-wrap gap-2.5 justify-end">
            {card.keywords.slice(0, 4).map((kw, i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  background: 'rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  padding: '8px 16px',
                  fontSize: 16,
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
        {/* Card image */}
        <div className="flex items-center justify-center" style={{ width: 260, height: 558 }}>
          <img
            src={card.imageUrl}
            alt={card.name}
            className="rounded-2xl object-contain"
            style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
          />
        </div>
      </div>
    </div>
  );
}

// Sample data for preview
const sampleCards: Record<string, CardData> = {
  'the-fool': {
    name: 'The Fool',
    summary: 'The Fool represents new beginnings, innocence, and a free spirit. This card encourages you to embrace the unknown with optimism and trust in the journey ahead.',
    keywords: ['beginnings', 'innocence', 'spontaneity', 'leap of faith'],
    imageUrl: 'https://tarottalks.app/cards/the-fool.jpg',
    talk: {
      title: 'The Power of Vulnerability',
      speakerName: 'Brene Brown',
      thumbnailUrl: 'https://tarottalks.app/thumbnails/brene-brown-vulnerability.jpg',
    },
  },
  'knight-of-cups': {
    name: 'Knight of Cups',
    summary: 'The Knight of Cups is a romantic dreamer, guided by emotions and imagination. This card represents following your heart and pursuing creative or romantic endeavors.',
    keywords: ['romance', 'creativity', 'charm', 'idealism'],
    imageUrl: 'https://tarottalks.app/cards/knight-of-cups.jpg',
    talk: {
      title: 'Your Elusive Creative Genius',
      speakerName: 'Elizabeth Gilbert',
      thumbnailUrl: 'https://tarottalks.app/thumbnails/elizabeth-gilbert-genius.jpg',
    },
  },
};

export default function CardSharePreview() {
  const [cardData, setCardData] = useState<Record<string, CardData>>(sampleCards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const [foolRes, knightRes] = await Promise.all([
          fetch('/api/preview/card-data?slug=the-fool'),
          fetch('/api/preview/card-data?slug=knight-of-cups'),
        ]);

        if (foolRes.ok && knightRes.ok) {
          const fool = await foolRes.json();
          const knight = await knightRes.json();
          setCardData({
            'the-fool': fool,
            'knight-of-cups': knight,
          });
        }
      } catch (e) {
        console.error('Failed to fetch card data, using samples', e);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Loading...</h1>
      </div>
    );
  }

  const fool = cardData['the-fool'];
  const knight = cardData['knight-of-cups'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Card Share Image Layouts</h1>
      <p className="text-gray-400 mb-8">Each layout shown at 1200x630 (OG image size). Scaled to 50% for viewing.</p>

      {/* The Fool */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-indigo-400">The Fool</h2>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Layout A1: Brand in content area</h3>
          <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: -315 }}>
            <LayoutA1 card={fool} />
          </div>
        </div>

        <div className="mb-8" style={{ marginTop: 340 }}>
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Layout A3: Brand top-left corner</h3>
          <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: -315 }}>
            <LayoutA3 card={fool} />
          </div>
        </div>

        <div className="mb-8" style={{ marginTop: 340 }}>
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Layout C1: Talk with overlay text</h3>
          <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: -315 }}>
            <LayoutC1 card={fool} />
          </div>
        </div>
      </section>

      {/* Knight of Cups */}
      <section className="mb-16" style={{ marginTop: 340 }}>
        <h2 className="text-2xl font-bold mb-6 text-indigo-400">Knight of Cups</h2>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Layout A1: Brand in content area</h3>
          <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: -315 }}>
            <LayoutA1 card={knight} />
          </div>
        </div>

        <div className="mb-8" style={{ marginTop: 340 }}>
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Layout A3: Brand top-left corner</h3>
          <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: -315 }}>
            <LayoutA3 card={knight} />
          </div>
        </div>

        <div className="mb-8" style={{ marginTop: 340 }}>
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Layout C1: Talk with overlay text</h3>
          <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: -315 }}>
            <LayoutC1 card={knight} />
          </div>
        </div>
      </section>
    </div>
  );
}
