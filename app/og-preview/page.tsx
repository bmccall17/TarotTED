import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OG Image Preview - TarotTALKS',
  robots: 'noindex',
};

// Test cards for preview
const testCards = ['knight-of-cups', 'the-fool'];
const backgrounds = ['gradient', 'solid', 'starfield'] as const;

export default function OGPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-4">OG Image Preview</h1>
      <p className="text-gray-400 mb-8">
        Preview the OG images for Twitter/Bluesky social sharing.
        These images are 1200×630 pixels (recommended size for social cards).
      </p>

      <div className="space-y-12">
        {testCards.map((slug) => (
          <div key={slug} className="space-y-4">
            <h2 className="text-2xl font-semibold text-white capitalize">
              {slug.replace(/-/g, ' ')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {backgrounds.map((bg) => (
                <div key={bg} className="space-y-2">
                  <h3 className="text-lg text-gray-300 capitalize">{bg}</h3>
                  <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/og-test/${slug}/${bg}`}
                      alt={`${slug} - ${bg} background`}
                      className="w-full h-auto"
                      style={{ aspectRatio: '1200/630' }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                      /api/og-test/{slug}/{bg}
                    </code>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Decision Point</h3>
        <p className="text-gray-300 mb-4">
          Review the 6 images above and select your preferred background style:
        </p>
        <ul className="text-gray-400 space-y-2 ml-4 list-disc">
          <li><strong>Gradient</strong>: Purple/indigo gradient (matches site theme)</li>
          <li><strong>Solid</strong>: Dark solid color for high contrast</li>
          <li><strong>Starfield</strong>: Gradient + scattered star/sparkle elements</li>
        </ul>
        <p className="text-gray-400 mt-4">
          Once selected, update <code className="bg-gray-700 px-2 py-1 rounded">BACKGROUND_STYLE</code> in{' '}
          <code className="bg-gray-700 px-2 py-1 rounded">app/cards/[slug]/opengraph-image.tsx</code>
        </p>
      </div>

      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Direct URLs</h3>
        <p className="text-gray-300 mb-4">
          Test the actual OG images that will be used in production:
        </p>
        <ul className="text-gray-400 space-y-2">
          <li>
            <a
              href="/cards/knight-of-cups/opengraph-image"
              target="_blank"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              /cards/knight-of-cups/opengraph-image
            </a>
          </li>
          <li>
            <a
              href="/cards/the-fool/opengraph-image"
              target="_blank"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              /cards/the-fool/opengraph-image
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
