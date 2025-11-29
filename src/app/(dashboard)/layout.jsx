"use client";

import 'remixicon/fonts/remixicon.css';
import Sidebar from '@/components/dashboard/Navbar/Sidebar';
import Navbar from '@/components/dashboard/Navbar/Navbar';
import RaiseTicketFav from '@/components/dashboard/RaiseTicketFav';
import Loading from '@/components/elements/Loading';
import { xFetch } from '@/utility/xFetch';

import 'react-toastify/ReactToastify.min.css';
import { Slide, ToastContainer } from 'react-toastify';

import React from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionProvider, getSession } from "next-auth/react";


export default function ClientLayout({ children }) {

    const [session, setSession] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    // Sidebar WIDTH (static non-collapsible)
    const SIDEBAR_WIDTH = "80px";

    useEffect(() => {
        const fetchSession = async () => {
            const sessionData = await getSession();
            if (!sessionData) {
                router.push('/signin');
                return;
            }

            localStorage.setItem('access_token', sessionData.user.cn_token);

            xFetch({ path: '/services/profile/corporate' })
                .then(data => {
                    data['user']['image'] = sessionData.user.image;
                    data['user']['name'] = sessionData.user.name;
                    data['user']['email'] = sessionData.user.email;
                    data['session'] = {
                        "provider": sessionData.user.auth_provider,
                        "uuid": sessionData.user.uuid,
                    };

                    localStorage.setItem('CurrentSessionData', JSON.stringify(data));
                    setSession(data);
                })
                .catch(() => router.push('/signout'));
        };

        fetchSession();
    }, [router]);

    function getPageInfo(path) {
        if (!path) return { title: 'Dashboard Overview', description: '' };
        const parts = path.split('/').filter(Boolean);

        if (parts.length >= 1) {
            switch (parts[0]) {
                case 'leads': return { title: 'Lead Management' };
                case 'conversions': return { title: 'Conversion Tracking' };
                case 'dashboard': return { title: 'Dashboard Overview' };
                case 'integrations': return { title: 'Integration Center' };
                case 'automation': return { title: 'Automation Hub' };
                case 'reports': return { title: 'Analytics & Reports' };
                case 'campaigns': return { title: 'Campaign Manager' };
                case 'contacts': return { title: 'Contact Directory' };
                case 'settings': return { title: 'System Settings' };
                case 'profile': return { title: 'Profile Settings' };
                default:
                    return { title: `${parts[0][0].toUpperCase()}${parts[0].slice(1)} Management` };
            }
        }
        return { title: 'Dashboard Overview' };
    }

    const pageInfo = getPageInfo(pathname);

    if (!session) return <Loading />;

    return (
        <SessionProvider>

            {/* Global CSS variable for sidebar width */}
            <style jsx global>{`
                :root {
                    --sidebar-width: ${SIDEBAR_WIDTH};
                }
            `}</style>

            <div className="dashboard-container flex">

                {/* 👉 Fixed Sidebar */}
                <Sidebar data={session} />

                {/* 👉 Main Layout Area */}
                <div
                    className="flex flex-col w-full"
                    style={{ marginLeft: "var(--sidebar-width)" }}
                >

                    {/* Top Navbar/Header */}
                    <div
                        className="fixed top-0 right-0 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center px-6 py-4 z-20"
                        style={{ left: "var(--sidebar-width)" }}
                    >
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-700">
                                {pageInfo.title}
                            </h1>
                        </div>

                        <Navbar data={session} />
                    </div>

                    {/* Scrollable Content */}
                    <div className="mt-20 p-4 overflow-y-auto min-h-screen">
                        {children}
                    </div>

                </div>

                <RaiseTicketFav />
            </div>

            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop
                draggable
                theme="light"
                transition={Slide}
            />

        </SessionProvider>
    );
}

export const experimental_ppr = true;
