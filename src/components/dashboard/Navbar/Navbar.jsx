'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar({ data }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const [openAnalytics, setOpenAnalytics] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenAnalytics(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const goToLegacyDashboard = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/leadstor/dashboard`;

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'token';
    tokenInput.value = localStorage.getItem('access_token') ?? '';

    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  };

  return (
    <div className="flex items-center gap-4" ref={menuRef}>

      {/* icon buttons */}
      <div className="flex items-center gap-3">
        <button onClick={goToLegacyDashboard} className="nav-icon" title="Old Dashboard">
          <i className="ri-computer-line"></i>
        </button>
        
      {/* Analytics Hover Dropdown */}
      <div className="relative group">
        <button className="nav-icon" title='Analytics'>
          <Link
              href="/analytics/classic-analytics"
            ><i className="ri-pie-chart-line"></i>
          </Link>
        </button>
      </div>

        <button className="nav-icon" title="Notifications">
          <i className="ri-notification-2-line"></i>
        </button>
      </div>

      {/* user area */}
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-3 px-2 py-1 rounded hover:bg-gray-50"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <div className="hidden md:block text-right leading-tight">
            <div className="text-sm font-medium text-gray-700">{data.user.name}</div>
            <div className="text-xs text-gray-400">{data.user.role}</div>
          </div>

          <Image src={data.user.image} alt="avatar" width={28} height={28} className="rounded-full" />
          <i className="ri-arrow-down-s-line text-gray-400"></i>
        </button>

        {open && (
            <div
                className="dropdown-panel"
                role="menu"
            >
                <Link href="/businessProfile">
                <div className="dropdown-row">
                    <i className="ri-user-3-line text-blue-500 text-lg"></i>
                    <span>Profile</span>
                </div>
                </Link>

                <Link href="/teams">
                <div className="dropdown-row">
                    <i className="ri-team-line text-emerald-500 text-lg"></i>
                    <span>Teams</span>
                </div>
                </Link>

                <div className="dropdown-divider" />

                <Link href="/signout">
                <div className="dropdown-row">
                    <i className="ri-logout-box-r-line text-rose-500 text-lg"></i>
                    <span>Sign out</span>
                </div>
                </Link>
            </div>
        )}

      </div>

      <style jsx>{`
        .nav-icon {
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            color: #4b5563;
            transition: 0.15s ease;
        }
        .nav-icon:hover {
            background: #eef6ff;
            color: #2563eb;
        }

        /* Dropdown Container */
        .dropdown-panel {
            position: absolute;
            right: 0;
            margin-top: 8px;
            width: 160px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.08);
            padding: 6px 0;
            z-index: 50;
        }

        /* Dropdown Item */
        .dropdown-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 14px;
            font-size: 14px;
            color: #374151;
            cursor: pointer;
            transition: 0.15s ease;
        }

        .dropdown-row:hover {
            background: #f8fafc;
        }

        .dropdown-divider {
            height: 1px;
            background: #e5e7eb;
            margin: 4px 0;
        }
        `}</style>

    </div>
  );
}
