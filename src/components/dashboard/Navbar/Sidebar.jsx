'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import {
  Contact,
  Wallet,
  BriefcaseBusiness,
  Users,
  FileText,
  Network,
  IndianRupee
} from "lucide-react";

export default function Sidebar() {
  const pathName = usePathname();

  useEffect(() => {
    const prev = document.querySelector('nav .__active');
    if (prev) prev.classList.remove('__active');
    const newActive = document.querySelector(`nav a[href="${pathName}"] li`);
    if (newActive) newActive.classList.add('__active');
  }, [pathName]);

  return (
    <aside
      style={{
        width: '70px',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
      }}
      className="bg-white border-r flex flex-col items-center py-6"
    >
      {/* Logo */}
      <div className="mb-8">
        <Image src="/icons/leadstor.png" alt="logo" width={38} height={38} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full">
        <ul className="flex flex-col gap-4 w-full items-center m-0 p-0">

          <Link href="/leads">
            <li className="menu-icon-item">
              <Contact className="w-5 h-5 stroke-[1.8]" />
              <span className="tooltip">Lead Management</span>
            </li>
          </Link>

          <Link href="/payments">
            <li className="menu-icon-item">
              <Wallet className="w-5 h-5 stroke-[1.8]" />
              <span className="tooltip">Payments</span>
            </li>
          </Link>

          <Link href="/placements">
            <li className="menu-icon-item">
              <BriefcaseBusiness className="w-5 h-5 stroke-[1.8]" />
              <span className="tooltip">Placement</span>
            </li>
          </Link>

          <Link href="/batches">
            <li className="menu-icon-item">
              <Users className="w-5 h-5 stroke-[1.8]" />
              <span className="tooltip">Batches</span>
            </li>
          </Link>

          <Link href="/invoices">
            <li className="menu-icon-item">
              <FileText className="w-5 h-5 stroke-[1.8]" />
              <span className="tooltip">Invoices</span>
            </li>
          </Link>

          <Link href="/branches">
            <li className="menu-icon-item">
              <Network className="w-5 h-5 stroke-[1.8]" />
              <span className="tooltip">Branches</span>
            </li>
          </Link>

          <Link href="/expenses">
            <li className="menu-icon-item">
              <IndianRupee className="w-5 h-5 stroke-[1.8]" />
              <span className="tooltip">Expenses</span>
            </li>
          </Link>

        </ul>
      </nav>

      {/* Styles */}
      <style jsx>{`
        .menu-icon-item {
          list-style: none;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          color: #444;
          position: relative;
          transition: all 0.22s ease;
        }

        /* Hover – pastel theme */
        .menu-icon-item:hover {
          background: #f1bbeaff;
          color: #475569;
        }

        /* Active */
        .menu-icon-item.__active {
          background: #f1bbeaff;
          color: #475569!important;
          font-weight: 600;
        }

        /* Tooltip – much closer */
        .tooltip {
          position: absolute;
          left: 60px; /* only 10px away */
          top: 50%;
          transform: translateY(-50%);
          padding: 6px 12px;
          background: white;
          color: #111;
          font-size: 13px;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.16s ease, transform 0.16s ease;
        }

        .menu-icon-item:hover .tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(2px);
        }
      `}</style>
    </aside>
  );
}
