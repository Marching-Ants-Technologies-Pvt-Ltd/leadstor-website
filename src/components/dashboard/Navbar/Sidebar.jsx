'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import { useState } from 'react';
import {
  Contact,
  Wallet,
  BriefcaseBusiness,
  Users,
  FileText,
  Network,
  IndianRupee
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathName = usePathname();

  useEffect(() => {
    const prev = document.querySelector('nav .__active');
    if (prev) prev.classList.remove('__active');
    const newActive = document.querySelector(`nav a[href="${pathName}"] li`);
    if (newActive) newActive.classList.add('__active');
  }, [pathName]);

  return (
    <aside
        className={`bg-white border-r border-slate-200 transition-all duration-300 shrink-0
        ${collapsed ? 'w-16' : 'w-[220px]'}`}
      >
        {/* LOGO */}
        <div className="h-14 flex items-center gap-3 px-4 font-semibold text-slate-800 border-b">
          <Image src="/icons/leadstor.png" alt="logo" width={38} height={38} />
          {!collapsed && <span>LeadStor</span>}
        </div>
        
        {/* NAV */}
        <nav className="pt-2">
        {[
            { icon: 'fa fa-tachometer', label: 'Leads', href: '/leads', active: true },
            { icon: 'fa fa-credit-card', label: 'Payments', href: '/payments' },
            { icon: 'fa fa-briefcase', label: 'Placement', href: '/placements' },
            { icon: 'fa fa-users', label: 'Batches', href: '/batches' },
            { icon: 'fa fa-file-text', label: 'Invoices', href: '/invoices' },
            { icon: 'fa fa-sitemap', label: 'Branches', href: '/branches' },
            { icon: 'fa fa-inr', label: 'Expenses', href: '/expenses' },
        ].map(({ icon, label, href, active }, i) => (
            <Link key={i} href={href}>
            <div
                className={`h-11 flex items-center gap-3 px-4 mx-2 my-1 rounded-lg text-sm cursor-pointer transition
                ${
                active
                    ? 'bg-sky-400 text-white'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
                <i className={`fa-solid ${icon} min-w-[20px] text-center`} />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </div>
            </Link>
        ))}
        </nav>
      </aside>
  );
}
