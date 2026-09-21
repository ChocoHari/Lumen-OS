'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/notes', label: 'Notes Vault' },
  { href: '/rewrite', label: 'Rewrite Studio' },
  { href: '/study', label: 'AI Study Room' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/focus', label: 'Focus Timer' }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 rounded-xl3 border border-gray-100 bg-white p-5">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
          L
        </div>
        <span className="text-lg font-semibold">Lumen</span>
      </div>
      <nav className="space-y-1 text-sm">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl2 px-3 py-2 ${
                active ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
