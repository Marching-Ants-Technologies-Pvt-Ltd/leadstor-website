'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    leadSettings: false,
    // Add more sections here if needed in future
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/');

  // Auto-open sections if current path matches a child
  useEffect(() => {
    if (pathname.startsWith('/settings/statuses') || 
        pathname.startsWith('/settings/courses') || 
        pathname.startsWith('/settings/sources') || 
        // add other sub-paths
        pathname.startsWith('/settings')) {
      setOpenSections((prev) => ({ ...prev, leadSettings: true }));
    }
  }, [pathname]);

  const menuItems = [
    { icon: 'ri-dashboard-line', label: 'Leads', href: '/leads' },
    { icon: 'ri-bank-card-line', label: 'Payments', href: '/payments' },
    { icon: 'ri-stack-line', label: 'Batches', href: '/batches' },
    {
      icon: 'ri-briefcase-line', 
      label: 'Placement',
      isParent: true,
      sectionKey: 'placement',
      children: [
        { label: 'Placement Ready', href: '/placements' },
        { label: 'Job Posting', href: '/jobs' },
      ],
    },
    { icon: 'ri-receipt-line', label: 'Invoices', href: '/invoices' },
    { icon: 'ri-building-line', label: 'Branches', href: '/branches' },
    { icon: 'ri-wallet-3-line', label: 'Expenses', href: '/expenses' },
    
  ];

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
      <nav className="pt-2 pb-4 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
        {menuItems.map((item, index) => {
          if (item.isParent) {
            const isOpen = openSections[item.sectionKey];
            const hasActiveChild = item.children.some((child) => isActive(child.href));
            const isActiveParent = hasActiveChild || isActive('/settings'); // adjust base path

            return (
              <div key={index}>
                {/* Parent row - clickable to toggle */}
                <div
                  onClick={() => !collapsed && toggleSection(item.sectionKey)}
                  className={`relative group h-11 flex items-center justify-between gap-3 px-4 mx-2 my-1 rounded-lg text-sm cursor-pointer transition
                    ${
                      isActiveParent
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`${item.icon} text-[18px] min-w-[20px]`} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </div>

                  {/* Chevron indicator */}
                  {!collapsed && (
                    <i
                      className={`ri-arrow-down-s-line text-lg transition-transform duration-200
                        ${isOpen ? 'rotate-180' : ''}`}
                    />
                  )}

                  {/* Tooltip when collapsed */}
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

                {/* Submenu items - indented */}
                {!collapsed && isOpen && (
                  <div className="ml-10 space-y-0.5 mt-1 mb-2">
                    {item.children.map((child, idx) => {
                      const active = isActive(child.href);
                      return (
                        <Link key={idx} href={child.href}>
                          <div
                            className={`h-9 flex items-center px-4 rounded-lg text-sm transition
                              ${
                                active
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                          >
                            <span className="whitespace-nowrap">{child.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular flat item
          return (
            <Link key={index} href={item.href}>
              <div
                className={`relative group h-11 flex items-center gap-3 px-4 mx-2 my-1 rounded-lg text-sm cursor-pointer transition
                ${
                  isActive(item.href)
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <i className={`${item.icon} text-[18px] min-w-[20px]`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}

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

        {/* Optional Back button at bottom - like in your screenshot */}
        {!collapsed && (
          <div className="mt-auto px-4 pb-4">
            <button
              onClick={() => {/* handle back logic - e.g. router.back() */}}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-sm font-medium transition"
            >
              <i className="ri-arrow-left-line"></i>
              <span>← Back</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}