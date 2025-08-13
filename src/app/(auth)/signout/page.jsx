"use client";

import React, { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/elements/Loading';

export default function SignOut() {

    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/signin');
        if (status === 'authenticated') signOut();
    }, [status, router]);

    return <Loading />;
}