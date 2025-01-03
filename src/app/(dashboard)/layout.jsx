"use client";

import 'remixicon/fonts/remixicon.css';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import RaiseTicketFav from '@/components/dashboard/RaiseTicketFav';
import Loading from '@/components/elements/Loading';
import { xFetch } from '@/utility/xFetch';

import 'react-toastify/ReactToastify.min.css';
import { Slide, ToastContainer } from 'react-toastify';

import React from "react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionProvider, getSession } from "next-auth/react";

export default function ClientLayout({ children }) {

    const [session, setSession] = useState(null);
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

                localStorage.setItem('corporate', JSON.stringify(data));
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
            <div className="sticky flex h-screen flex-row overflow-y-auto rounded-lg sm:overflow-x-hidden">
                <Sidebar data={session} />

                <div
                    style={{
                        zIndex: 0,
                        width: 'calc(100% - 288px)'
                    }}
                    className="flex w-full flex-col">
                    <Navbar data={session} />
                    <div
                        style={{
                            height: 'calc(100% - 63px)'
                        }}
                        className='p-6'>
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