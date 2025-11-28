"use client";

import 'remixicon/fonts/remixicon.css';
import Sidebar from '@/components/dashboard/Navbar/Sidebar';
import Navbar from '@/components/dashboard/Navbar/Navbar';
import RaiseTicketFav from '@/components/dashboard/RaiseTicketFav';
import Loading from '@/components/elements/Loading';
import { xFetch } from '@/utility/xFetch';
import Image from 'next/image';

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
    const [collapsed, setCollapsed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);

    // Handle initial collapsed state based on screen size
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            if (width < 1000) {
                setCollapsed(true);
            }
        };
        
        // Set initial state
        handleResize();
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Map route to friendly page name and description
    function getPageInfo(path) {
        if (!path) return { title: 'Dashboard Overview', description: 'Overview of your business metrics and performance' };
        const parts = path.split('/').filter(Boolean);
        
        if (parts.length >= 1) {
            switch (parts[0]) {
                case 'leads': 
                    return { 
                        title: 'Lead Management', 
                        description: 'Track, manage and convert your leads effectively' 
                    };
                case 'conversions': 
                    return { 
                        title: 'Conversion Tracking', 
                        description: 'Monitor conversion rates and optimize your funnel' 
                    };
                case 'dashboard': 
                    return { 
                        title: 'Dashboard Overview', 
                        description: 'Overview of your business metrics and performance' 
                    };
                case 'integrations': 
                    return { 
                        title: 'Integration Center', 
                        description: 'Connect and manage your third-party integrations' 
                    };
                case 'automation': 
                    return { 
                        title: 'Automation Hub', 
                        description: 'Set up and manage automated workflows' 
                    };
                case 'reports': 
                    return { 
                        title: 'Analytics & Reports', 
                        description: 'Detailed insights and performance analytics' 
                    };
                case 'campaigns': 
                    return { 
                        title: 'Campaign Manager', 
                        description: 'Create and manage your marketing campaigns' 
                    };
                case 'contacts': 
                    return { 
                        title: 'Contact Directory', 
                        description: 'Organize and manage your customer contacts' 
                    };
                case 'settings': 
                    return { 
                        title: 'System Settings', 
                        description: 'Configure your application preferences' 
                    };
                case 'profile': 
                    return { 
                        title: 'Profile Settings', 
                        description: 'Manage your account and personal information' 
                    };
                default:
                    const capitalized = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                    return { 
                        title: `${capitalized} Management`, 
                        description: `Manage and organize your ${parts[0]} efficiently` 
                    };
            }
        }
        return { title: 'Dashboard Overview', description: 'Overview of your business metrics and performance' };
    }
    const pageInfo = getPageInfo(pathname);

    if (!session) return <Loading />;

    return (
        <SessionProvider>
            <div className="dashboard-layout">
                <Sidebar data={session} collapsed={collapsed} setCollapsed={setCollapsed} />

                <div className="dashboard-main-content">
                    {/* Header bar containing page title and navbar */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                            {windowWidth >= 1000 && (
                                <button
                                    className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 ease-in-out"
                                    onClick={() => setCollapsed(prev => !prev)}
                                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                >
                                    <i className={`text-lg ${collapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'}`}></i>
                                </button>
                            )}
                            
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-semibold text-gray-700 tracking-tight">{pageInfo.title}</h1>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">{pageInfo.description}</p>
                            </div>
                        </div>

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

export const experimental_ppr = true;
