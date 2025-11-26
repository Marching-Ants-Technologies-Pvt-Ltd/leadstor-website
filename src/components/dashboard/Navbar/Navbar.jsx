'use client';
import React from 'react';
import Image from 'next/image';
import styles from './Navbar.module.css';
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
        return;
    }

    return (
        <div className="flex justify-end items-center sticky bg-white py-3 px-4 gap-16 z-10">
            <div className='flex gap-3'>
                <span className="tooltip tooltip-bottom" data-tooltip="Goto Conceptninjas Old Dashboard">
                    <div className='hover:bg-blue-50 hover:text-blue-600 hover:border-blue-50 text-gray-600 border bg-transparent cursor-pointer w-fit px-4 h-7 flex justify-center items-center rounded-full' onClick={goToLegacyDashboard}>
                        <i className="ri-computer-line pointer-events-none mr-0 lg:mr-2"></i>
                        <div className="hidden lg:block">Legacy Dashboard</div>
                    </div>
                </span>
                <span className="tooltip tooltip-bottom" data-tooltip="Contact Support">
                    <div className='hover:bg-blue-100 hover:text-blue-500 hover:border-blue-100 text-gray-700 border bg-transparent  cursor-pointer w-7 h-7 flex justify-center items-center rounded-full'>
                        <i className="ri-customer-service-2-fill pointer-events-none"></i>
                    </div>
                </span>
                <span className="tooltip tooltip-bottom" data-tooltip="Check Notification">
                    <div className='hover:bg-blue-100 hover:text-blue-500 hover:border-blue-100 text-gray-700 border bg-transparent  cursor-pointer w-7 h-7 flex justify-center items-center rounded-full'>
                        <i className="ri-notification-line pointer-events-none"></i>
                    </div>
                </span>
            </div>
            <div className="dropdown z-10 flex h-fit relative">
                <label className="flex gap-2 poppins cursor-pointer items-center" tabIndex="0">
                    <div className={`pr-2 pointer-events-none ${styles['hide-on-small']}`}>
                    <h3 className="m-0 text-base">{data.user.name}</h3>
                    <p className="-mt-0.5 p-0 text-xs text-gray-500 text-right">{data.user.role}</p>
                    </div>
                    <div className="flex justify-center items-center pointer-events-none">
                    <Image
                        className="rounded-md"
                        placeholder="empty"
                        src={data.user.image}
                        width={36}
                        height={36}
                        alt="User Avatar"
                        priority={false}
                    />
                    </div>
                    <div className="flex justify-center items-center pointer-events-none">
                    <i className="ri-arrow-down-s-fill text-xl"></i>
                    </div>
                </label>

                {/* Dropdown Menu */}
                <div className="dropdown-menu absolute right-0 top-[110%] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl shadow-gray-300/40 border border-gray-200/70 p-3 flex flex-col items-center gap-2 w-14 transition-all duration-200 origin-top">
                    {/* Profile */}
                    <Link href="/businessProfile" >
                        <div className="relative group w-full flex justify-center">
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition">
                                <i className="ri-user-3-line text-blue-500 text-xl"></i>
                            </button>
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
                                Profile
                            </span>
                        </div>
                    </Link>
                    
                    {/* Team */}
                    <Link href="/teams" >
                        <div className="relative group w-full flex justify-center">
                            <button className="p-2 hover:bg-teal-50 rounded-lg transition">
                                <i className="ri-team-line text-teal-500 text-xl"></i>
                            </button>
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
                                Teams
                            </span>
                        </div>
                    </Link>
                    

                    <div className="h-px bg-gray-200 w-8 my-1"></div>

                    {/* Sign Out */}
                    <div className="relative group w-full flex justify-center">
                    <button className="p-2 hover:bg-rose-50 rounded-lg transition">
                        <i className="ri-logout-box-r-line text-rose-500 text-xl"></i>
                    </button>
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
                        Sign Out
                    </span>
                    </div>
                </div>
            </div>
        </div>
    )
}