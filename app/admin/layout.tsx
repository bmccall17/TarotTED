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
        {/* Back Button - Only on Edit pages */}
        {isEditPage && (
          <div className="bg-indigo-900/40 border-b border-indigo-500/30 px-6 py-4 flex items-center gap-4">
            <a
              href="/admin/talks"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              ← BACK TO TALKS
            </a>
            <span className="text-gray-400 text-sm">
              (Temporary workaround - click this to return to Talks list when done editing)
            </span>
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
