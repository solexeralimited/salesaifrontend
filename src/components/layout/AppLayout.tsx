'use client';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const nav = [
  { section: 'Overview', items: [{ href: '/dashboard', label: 'Dashboard', icon: '⬡' }] },
  {
    section: 'Sales',
    items: [
      { href: '/leads', label: 'Leads', icon: '👥' },
      { href: '/conversations', label: 'Conversations', icon: '💬' },
      { href: '/calendar', label: 'Calendar', icon: '📅' },
    ],
  },
  {
    section: 'Automation',
    items: [
      { href: '/workflow', label: 'Workflows', icon: '⚡' },
      { href: '/knowledge-base', label: 'Knowledge base', icon: '📚' },
    ],
  },
  {
    section: 'Reporting',
    items: [{ href: '/analytics', label: 'Analytics', icon: '📊' }],
  },
  {
    section: 'System',
    items: [{ href: '/settings', label: 'Settings', icon: '⚙️' }],
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200
        md:static md:translate-x-0 md:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">S</div>
          <span className="font-semibold text-sm text-gray-800">SalesAI</span>
          <button
            className="ml-auto md:hidden text-gray-400 hover:text-gray-600 text-lg leading-none"
            onClick={() => setSidebarOpen(false)}
          >✕</button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {nav.map((section) => (
            <div key={section.section} className="mb-1">
              <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.section}
              </div>
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
              {user.name?.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 truncate">{user.name}</div>
              <div className="text-[10px] text-gray-400 capitalize">{user.role}</div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-gray-600 text-xs" title="Sign out">↩</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 text-xl leading-none"
            aria-label="Open menu"
          >☰</button>
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">S</div>
          <span className="font-semibold text-sm text-gray-800">SalesAI</span>
        </div>
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
