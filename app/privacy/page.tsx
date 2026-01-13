import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | TarotTALKS',
  description: 'How TarotTALKS handles your data and protects your privacy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to TarotTALKS
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-light text-gray-100">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 text-sm">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Overview</h2>
            <p>
              TarotTALKS is a free tool that maps Tarot cards to TED talks. We respect your privacy
              and collect minimal data. This policy explains what we collect and why.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">What We Collect</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium text-gray-100 mb-2">Anonymous Analytics</h3>
                <p className="text-sm text-gray-400">
                  We use privacy-focused analytics to understand how people use TarotTALKS.
                  This includes page views, button clicks, and general usage patterns.
                  No personal information is collected or stored.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium text-gray-100 mb-2">Session Storage</h3>
                <p className="text-sm text-gray-400">
                  Your current card spread is temporarily stored in your browser so you don&apos;t
                  lose it if you navigate away. This data stays on your device and is automatically
                  cleared after 30 minutes or when you close your browser.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium text-gray-100 mb-2">No Account Required</h3>
                <p className="text-sm text-gray-400">
                  TarotTALKS does not require registration. We don&apos;t collect names,
                  email addresses, or any personally identifiable information.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Third-Party Services</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium text-gray-100 mb-2">TED Talks</h3>
                <p className="text-sm text-gray-400">
                  When you click to watch a talk, you&apos;ll be directed to TED.com or YouTube.
                  Those platforms have their own privacy policies that govern your experience there.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium text-gray-100 mb-2">Vercel Hosting</h3>
                <p className="text-sm text-gray-400">
                  TarotTALKS is hosted on Vercel. Standard web server logs (IP addresses,
                  browser type) may be collected for security and performance purposes.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium text-gray-100 mb-2">GPT Spread Reader</h3>
                <p className="text-sm text-gray-400">
                  If you use our optional GPT-powered spread reader, your card images and
                  questions are processed by OpenAI. We do not store this data.
                  See OpenAI&apos;s privacy policy for how they handle data.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">What We Don&apos;t Do</h2>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>We don&apos;t sell your data to anyone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>We don&apos;t use tracking cookies for advertising</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>We don&apos;t store your Tarot readings or questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>We don&apos;t require an account or personal information</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Contact</h2>
            <p className="text-gray-400">
              Questions about this policy? Reach out via our{' '}
              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>

          <section className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              TarotTALKS is an independent project and is not affiliated with TED Conferences LLC.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
