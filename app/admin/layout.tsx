'use client';

import { AdminNav } from '@/components/admin/ui/AdminNav';
import { Monitor } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditPage = pathname?.includes('/edit');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {/* Diagnostic Banner - Only on Edit pages */}
        {isEditPage && (
          <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 flex gap-4 items-center">
            <button
              onClick={() => alert('Regular button works!')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-bold"
            >
              🔧 TEST 1: Button
            </button>
            <a
              href="/admin/talks"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
            >
              🔧 TEST 2: Regular &lt;a&gt; tag
            </a>
            <button
              onClick={() => window.location.href = '/admin/talks'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold"
            >
              🔧 TEST 3: window.location
            </button>
          </div>
        )}

        {/* Mobile Notice - shown only on small screens */}
        <div className="lg:hidden bg-amber-500/20 border-b border-amber-500/30 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-300 text-sm">
            <Monitor className="w-4 h-4 flex-shrink-0" />
            <span>Admin portal is optimized for desktop. Some features may be limited on mobile.</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
