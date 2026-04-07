// components/Sidebar.tsx

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { menuItems } from '@/lib/sidebarConfig'; // adjust path


export default function Sidebar({ collapsed, setCollapsed, userRole }) {
  const pathname = usePathname();

  const isActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Normalize userRole to always be an array of strings
  const userRoles = Array.isArray(userRole)
    ? userRole.map(r => String(r).trim())
    : [String(userRole || '').trim()].filter(Boolean);

  // Filter menu items - show if user has AT LEAST ONE matching role
  const visibleItems = menuItems.filter((item) =>
    item.allowedRoles.some((allowedRole) =>
      userRoles.includes(allowedRole)
    )
  );

  useEffect(() => {
    // Clean up previous active class
    document.querySelector('nav .__active')?.classList.remove('__active');

    // Highlight current item (only if it's visible for this role)
    const currentItem = visibleItems.find((item) => isActive(item.href));
    if (currentItem) {
      const el = document.querySelector(`nav a[href="${currentItem.href}"] div`);
      el?.classList.add('__active');
    }
  }, [pathname, visibleItems]);

  return (
    <aside
      className={`bg-white transition-all duration-400 ease-in-out shrink-0 border-r border-slate-100/80
        ${collapsed ? 'w-16' : 'w-[220px]'}`}
    >
      {/* LOGO */}
      <div className="h-14 flex items-center gap-3 px-4 font-semibold text-slate-800 border-b border-transparent shadow-sm z-30">
        <Image src="/icons/leadstor.png" alt="logo" width={38} height={38} />
        {!collapsed && <span>LeadStor</span>}
      </div>

      {/* NAV */}
      <nav className="pt-2">
        {visibleItems.map((item, i) => {
          const active = isActive(item.href);

          return (
            <Link key={i} href={item.href}>
              <div
                className={`relative group h-11 flex items-center gap-3 px-4 mx-2 my-1 rounded-lg text-sm cursor-pointer transition
                  ${active
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md __active'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <i className={`${item.icon} text-[18px] min-w-[20px] ${active ? 'text-white' : ''}`} />

                {!collapsed && <span className={`whitespace-nowrap ${active ? 'text-white font-medium' : ''}`}>{item.label}</span>}

                {collapsed && (
                  <span
                    className="pointer-events-none absolute left-full top-1/2 z-50 ml-4
                    -translate-y-1/2 scale-95 whitespace-nowrap rounded-xl
                    bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-white
                    shadow-lg border border-slate-100 backdrop-blur
                    opacity-0 transition-all duration-200 delay-150
                    group-hover:opacity-100 group-hover:scale-100"
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {visibleItems.length === 0 && (
          <div className="px-4 py-6 text-center text-slate-400 text-sm">
            No menu items available for your role
          </div>
        )}
      </nav>
    </aside>
  );
}