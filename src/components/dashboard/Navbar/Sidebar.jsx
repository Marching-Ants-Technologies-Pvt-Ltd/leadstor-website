'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Sidebar() {

    const pathName = usePathname();

    useEffect(() => {
        let active = document.querySelector("nav .__active");
        if (active) active.classList.remove("__active");

        let newActive = document.querySelector(`nav ul a[href="${pathName}"] li`);
        if (newActive) newActive.classList.add("__active");
    }, [pathName]);

    return (
        <aside
            className="
                bg-white border-r
                h-screen 
                flex flex-col 
                items-center
                py-5
                fixed
                left-0 top-0
            "
            style={{ "--sidebar-width": "64px", width: "var(--sidebar-width)" }}
        >

            {/* Logo */}
            <div className="mb-6">
                <Image
                    src="/icons/leadstor.png"
                    width={36}
                    height={36}
                    alt="Leadstor Icon"
                />
            </div>

            {/* Menu Icons */}
            <nav className="flex flex-col gap-2 mt-4 w-full px-1">
                <ul className="flex flex-col gap-2 w-full items-center">

                    <Link href="/leads">
                        <li className="menu-icon-item">
                            <i className="ri-contacts-book-2-line text-2xl"></i>
                            <span className="tooltip">Lead Management</span>
                        </li>
                    </Link>

                    <Link href="/conversions">
                        <li className="menu-icon-item">
                            <i className="ri-wallet-3-line text-2xl"></i>
                            <span className="tooltip">Payment Management</span>
                        </li>
                    </Link>

                    <Link href="/placements">
                        <li className="menu-icon-item">
                            <i className="ri-briefcase-line text-2xl"></i>
                            <span className="tooltip">Placement Management</span>
                        </li>
                    </Link>

                    <Link href="/batches">
                        <li className="menu-icon-item">
                            <i className="ri-group-line text-2xl"></i>
                            <span className="tooltip">Batch Management</span>
                        </li>
                    </Link>

                    <Link href="/invoices">
                        <li className="menu-icon-item">
                            <i className="ri-file-list-3-line text-2xl"></i>
                            <span className="tooltip">Invoices</span>
                        </li>
                    </Link>

                    <Link href="/branches">
                        <li className="menu-icon-item">
                            <i className="ri-node-tree text-2xl"></i>
                            <span className="tooltip">Branch Management</span>
                        </li>
                    </Link>

                    <Link href="/expenses">
                        <li className="menu-icon-item">
                            <i className="ri-money-dollar-circle-line text-2xl"></i>
                            <span className="tooltip">Expense Management</span>
                        </li>
                    </Link>

                </ul>
            </nav>

            {/* 🔥 Hover Animations */}
            <style jsx>{`

            /* Sidebar Icon Button */
            .menu-icon-item {
                position: relative;
                width: 42px;
                height: 42px;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                color: #7E7E7E;
                transition: background 0.2s ease, color 0.2s ease;
            }

            /* Hover — very subtle */
            .menu-icon-item:hover {
                background: #f4e8ef;      /* LIGHT PINK LIKE SCREENSHOT */
                color: #560fe6ff;           /* Darker pink */
            }

            /* Active */
            .menu-icon-item.__active {
                background: #f4e8ef;
                color: #7e46f0;
            }

            /* Tooltip — EXACT MATCH */
            .tooltip {
                position: absolute;
                left: 50px;                      /* Closer distance */
                top: 50%;
                transform: translateY(-50%);
                padding: 6px 12px;
                background: #ffffff;
                color: #333;
                font-size: 13px;
                border-radius: 6px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.12);
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }

            .menu-icon-item:hover .tooltip {
                opacity: 1;
                transform: translateY(-50%) translateX(4px);
            }

        `}</style>


        </aside>
    );
}
