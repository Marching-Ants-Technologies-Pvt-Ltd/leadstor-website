'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar({ data }) {

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
    }

    return (
        <div className="flex items-center gap-4">

            {/* Right Controls */}
            <div className="flex items-center gap-4">

                {/* Legacy Dashboard */}
                <div
                    className="icon-btn tooltip"
                    data-tooltip="Old Dashboard"
                    onClick={goToLegacyDashboard}
                >
                    <i className="ri-computer-line"></i>
                </div>

                {/* Support */}
                <div className="icon-btn tooltip" data-tooltip="Support">
                    <i className="ri-customer-service-2-fill"></i>
                </div>

                {/* Notifications */}
                <div className="icon-btn tooltip" data-tooltip="Notifications">
                    <i className="ri-notification-line"></i>
                </div>

                {/* User Dropdown */}
                <div className="relative dropdown">
                    <label tabIndex="0" className="flex items-center gap-2 cursor-pointer">
                        <div className="text-right leading-tight hidden md:block">
                            <h3 className="text-sm font-medium">{data.user.name}</h3>
                            <p className="text-[11px] text-gray-500">{data.user.role}</p>
                        </div>

                        <Image
                            className="rounded-md pointer-events-none"
                            src={data.user.image}
                            width={34}
                            height={34}
                            alt="User Avatar"
                        />

                        <i className="ri-arrow-down-s-fill text-lg pointer-events-none"></i>
                    </label>

                    {/* Dropdown Menu */}
                    <div className="
                        dropdown-menu 
                        absolute right-0 top-[115%] 
                        bg-white/95 backdrop-blur 
                        border shadow-xl 
                        rounded-xl p-3
                        flex flex-col gap-2 
                        w-12
                    ">
                        {/* Profile */}
                        <Link href="/businessProfile">
                            <div className="dropdown-icon">
                                <i className="ri-user-3-line text-blue-500"></i>
                                <span className="dropdown-tooltip">Profile</span>
                            </div>
                        </Link>

                        {/* Team */}
                        <Link href="/teams">
                            <div className="dropdown-icon">
                                <i className="ri-team-line text-teal-500"></i>
                                <span className="dropdown-tooltip">Teams</span>
                            </div>
                        </Link>

                        <div className="h-px bg-gray-200 w-8 mx-auto"></div>

                        {/* Signout */}
                        <div className="dropdown-icon">
                            <i className="ri-logout-box-r-line text-rose-500"></i>
                            <span className="dropdown-tooltip">Sign Out</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                .icon-btn {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 10px;
                    cursor: pointer;
                    color: #4b5563;
                    transition: 0.2s ease;
                    position: relative;
                }
                .icon-btn:hover {
                    background: #e8f3ff;
                    color: #2563eb;
                }

                /* Tooltip */
                .icon-btn .tooltip-text,
                .dropdown-tooltip {
                    position: absolute;
                    white-space: nowrap;
                    background: #111827;
                    color: white;
                    font-size: 11px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    opacity: 0;
                    transform: translateX(-10px);
                    pointer-events: none;
                    transition: all .18s ease;
                }
                .icon-btn:hover .tooltip-text {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* Dropdown Items */
                .dropdown-icon {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    padding: 6px 0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: 0.2s ease;
                }
                .dropdown-icon:hover {
                    background: #f1f5f9;
                }

                .dropdown-tooltip {
                    right: 110%;
                    top: 50%;
                    transform: translateY(-50%) translateX(-8px);
                }
                .dropdown-icon:hover .dropdown-tooltip {
                    opacity: 1;
                    transform: translateY(-50%) translateX(0);
                }
            `}</style>
        </div>
    );
}
