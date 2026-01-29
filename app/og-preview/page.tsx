import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OG Image Preview - TarotTALKS',
  robots: 'noindex',
};

// Test cards for preview
const testCards = ['knight-of-cups', 'the-fool'];
const layouts = [
  { id: 'minimal', name: 'Minimal', description: 'Brand + Card Name + Keywords only' },
  { id: 'summary', name: 'With Summary', description: 'Adds the card summary text below the name' },
  { id: 'arcana', name: 'Arcana + Tagline', description: 'Shows arcana type, adds tagline & URL' },
] as const;

export default function OGPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-4">OG Image Preview - Layout Variants</h1>
      <p className="text-gray-400 mb-2">
        All images use the <strong className="text-indigo-400">starfield</strong> background.
      </p>
      <p className="text-gray-400 mb-8">
        Compare three layout options across two test cards.
      </p>

      <div className="space-y-16">
        {testCards.map((slug) => (
          <div key={slug} className="space-y-6">
            <h2 className="text-2xl font-semibold text-white capitalize border-b border-gray-700 pb-2">
              {slug.replace(/-/g, ' ')}
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {layouts.map((layout) => (
                <div key={layout.id} className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-white">{layout.name}</h3>
                    <p className="text-sm text-gray-500">{layout.description}</p>
                  </div>
                  <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/og-test/${slug}/starfield/${layout.id}`}
                      alt={`${slug} - ${layout.name}`}
                      className="w-full h-auto"
                      style={{ aspectRatio: '1200/630' }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    <code className="bg-gray-800 px-2 py-1 rounded">
                      /api/og-test/{slug}/starfield/{layout.id}
                    </code>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Layout Options</h3>
          <ul className="space-y-4">
            <li className="border-l-2 border-indigo-500 pl-4">
              <strong className="text-white">Minimal</strong>
              <p className="text-gray-400 text-sm">Clean and focused. Brand, card name, and keywords. No extra text to distract.</p>
            </li>
            <li className="border-l-2 border-purple-500 pl-4">
              <strong className="text-white">With Summary</strong>
              <p className="text-gray-400 text-sm">Includes the card&apos;s summary text. More context for viewers, but busier layout.</p>
            </li>
            <li className="border-l-2 border-pink-500 pl-4">
              <strong className="text-white">Arcana + Tagline</strong>
              <p className="text-gray-400 text-sm">Shows the arcana type (Major/Minor + Suit), plus a call-to-action with the site URL.</p>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Decision Point</h3>
          <p className="text-gray-300 mb-4">
            Review the 6 images above and select your preferred layout:
          </p>
          <div className="space-y-2 text-gray-400">
            <p>Consider:</p>
            <ul className="list-disc ml-6 space-y-1 text-sm">
              <li>How readable is the text at thumbnail sizes?</li>
              <li>Does the summary add value or create clutter?</li>
              <li>Is the tagline/URL helpful for discovery?</li>
              <li>Which feels most &quot;on brand&quot; for TarotTALKS?</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Quick Test URLs</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {testCards.map((slug) =>
            layouts.map((layout) => (
              <a
                key={`${slug}-${layout.id}`}
                href={`/api/og-test/${slug}/starfield/${layout.id}`}
                target="_blank"
                className="text-indigo-400 hover:text-indigo-300 underline truncate"
              >
                {slug.replace(/-/g, ' ')} ({layout.id})
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
