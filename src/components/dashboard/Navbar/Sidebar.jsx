'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathName = usePathname();
  const isActive = (href) =>
  pathName === href || pathName.startsWith(href + '/');

  useEffect(() => {
    const prev = document.querySelector('nav .__active');
    if (prev) prev.classList.remove('__active');
    const newActive = document.querySelector(`nav a[href="${pathName}"] li`);
    if (newActive) newActive.classList.add('__active');
  }, [pathName]);

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
        {[
          { icon: 'ri-dashboard-line', label: 'Leads', href: '/leads' },
          { icon: 'ri-bank-card-line', label: 'Payments', href: '/payments' },
          { icon: 'ri-stack-line', label: 'Batches', href: '/batches' },
          { icon: 'ri-briefcase-line', label: 'Placement', href: '/placements' },
          { icon: 'ri-receipt-line', label: 'Invoices', href: '/invoices' },
          { icon: 'ri-building-line', label: 'Branches', href: '/branches' },
          { icon: 'ri-wallet-3-line', label: 'Expenses', href: '/expenses' },
        ].map(({ icon, label, href }, i) => {
          const active = isActive(href);

          return (
            <Link key={i} href={href}>
              <div
                className={`relative group h-11 flex items-center gap-3 px-4 mx-2 my-1 rounded-lg text-sm cursor-pointer transition
                ${
                  active
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <i className={`${icon} text-[18px] min-w-[20px]`} />

                {!collapsed && <span className="whitespace-nowrap">{label}</span>}

                {/* Tooltip (collapsed) */}
                {collapsed && (
                  <span
                    className="pointer-events-none absolute left-full top-1/2 z-50 ml-4
                    -translate-y-1/2 scale-95 whitespace-nowrap rounded-xl
                    bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-white
                    shadow-lg border border-slate-100 backdrop-blur
                    opacity-0 transition-all duration-200 delay-150
                    group-hover:opacity-100 group-hover:scale-100"
                  >
                    {label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
