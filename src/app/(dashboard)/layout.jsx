"use client";

import 'remixicon/fonts/remixicon.css';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import RaiseTicketFav from '@/components/dashboard/RaiseTicketFav';
import Loading from '@/components/elements/Loading';
import { xFetch } from '@/utility/xFetch';
import Image from 'next/image';

import 'react-toastify/ReactToastify.min.css';
import { Slide, ToastContainer } from 'react-toastify';

import React from "react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionProvider, getSession } from "next-auth/react";

export default function ClientLayout({ children }) {

    const [session, setSession] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const sessionData = await getSession();
            if (!sessionData) {
                router.push('/signin');
                return;
            }

            // Save access token for all xFetch calls
            localStorage.setItem('access_token', sessionData.user.cn_token);

            // Get necessary+common details of this corporate 
            xFetch({ path: '/services/profile/corporate' }).then(data => {
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
                .catch(error => {
                    console.error(`An error occurred while fetching leads`, error);
                    router.push('/signout');
                });
        };

        fetchSession();
    }, [router]);

    if (!session) return <Loading />;

    return (
        <SessionProvider>
            <div className="dashboard-layout">
                <Sidebar data={session} collapsed={collapsed} setCollapsed={setCollapsed} />

                <div className="dashboard-main-content">
                    {/* Header bar containing page title and navbar */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white">
                        {/* Page Title - aligned with sidebar logo */}
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <span className="text-xl">Dashboard</span>
                                <span className="text-sm font-medium text-content2">Leadstor &bull; <strong className='text-green-600 font-medium'>v1.0.3</strong></span>
                            </div>
                        </div>

                        {/* Existing Navbar for user profile, etc. */}
                        <Navbar data={session} />
                    </div>

                    {/* Scrollable content area */}
                    <div className='p-4 flex-1 overflow-y-auto'>
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
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme="light"
                transition={Slide}
            />
        </SessionProvider>
    )
}