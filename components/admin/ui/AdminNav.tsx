'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Video, Link as LinkIcon, AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';
// import { Palette } from 'lucide-react'; // TODO: Uncomment when Theme management is implemented

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const navLinkClass = (path: string) => {
    const base = 'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer';
    const active = 'bg-indigo-600 text-white';
    const inactive = 'text-gray-300 hover:bg-gray-800';
    return `${base} ${isActive(path) ? active : inactive}`;
  };

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-gray-100">TarotTED Admin</h1>
        <p className="text-xs text-gray-500 mt-1">Content Management</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Curation Mode */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
            🎨 Curation
          </h2>
          <div className="space-y-1">
            <div onClick={() => navigate('/admin')} className={navLinkClass('/admin')}>
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
            <div onClick={() => navigate('/admin/cards')} className={navLinkClass('/admin/cards')}>
              <Sparkles className="w-4 h-4" />
              <span>Cards</span>
            </div>
            <div onClick={() => navigate('/admin/talks')} className={navLinkClass('/admin/talks')}>
              <Video className="w-4 h-4" />
              <span>Talks</span>
            </div>
            <div onClick={() => navigate('/admin/mappings')} className={navLinkClass('/admin/mappings')}>
              <LinkIcon className="w-4 h-4" />
              <span>Mappings</span>
            </div>
            {/* TODO: Theme management not yet implemented
            <div onClick={() => navigate('/admin/themes')} className={navLinkClass('/admin/themes')}>
              <Palette className="w-4 h-4" />
              <span>Themes</span>
            </div>
            */}
          </div>
        </div>

        {/* Repair Mode */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
            🔧 Repair
          </h2>
          <div className="space-y-1">
            <div onClick={() => navigate('/admin/validation')} className={navLinkClass('/admin/validation')}>
              <AlertTriangle className="w-4 h-4" />
              <span>Validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Site</span>
        </div>
      </div>
    </nav>
  );
}
