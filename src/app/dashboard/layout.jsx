"use client";

import 'remixicon/fonts/remixicon.css';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import RaiseTicketFav from '@/components/dashboard/RaiseTicketFav';
import Loading from '@/components/elements/Loading';

import React from "react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionProvider, getSession } from "next-auth/react";

export default function ClientLayout({ children }) {

    const [session, setSession] = useState(null);
    const router = useRouter();

    const takeMeToOldDashboard = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = localStorage.getItem('ninja_dashboard_link');

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token';
        tokenInput.value = session.user.cn_token;
        form.appendChild(tokenInput);

        document.body.appendChild(form);

        form.submit();
        form.remove();
        return;
    }

    useEffect(() => {
        const fetchSession = async () => {
            const sessionData = await getSession();
            if (!sessionData) {
                router.push('/signin');
            } else {
                setSession(sessionData);
            }
        };

        fetchSession();
    }, [router]);

    if (!session) return <Loading />;

    return (
        <SessionProvider>
            <div className="sticky flex h-screen flex-row overflow-y-auto rounded-lg sm:overflow-x-hidden">
                <Sidebar session={session} goOld={takeMeToOldDashboard} />

                <div className="flex w-full flex-col">
                    <Navbar session={session} />
                    <div className='p-6 h-full'>
                        {children}
                    </div>
                </div>

                <RaiseTicketFav />
            </div>
        </SessionProvider>
    )
}