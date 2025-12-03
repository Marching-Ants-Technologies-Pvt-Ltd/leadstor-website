'use client';

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

  // CONSTANTS
  const SIDEBAR_WIDTH = '64px';   // change once here if you want a different sidebar width
  const HEADER_HEIGHT = '64px';   // header height used for spacing & alignment

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
      {/* Global CSS variable for sidebar width and header height */}
      <style jsx global>{`
        :root {
          --sidebar-width: ${SIDEBAR_WIDTH};
          --header-height: ${HEADER_HEIGHT};
        }

        html, body, #__next {
          height: 100%;
        }

        /* when using a fixed header & fixed sidebar, prevent body horizontal scroll */
        body {
          overflow-x: hidden;
        }
      `}</style>

      <div className="dashboard-root" style={{ minHeight: '100vh' }}>
        {/* Sidebar (fixed) */}
        <Sidebar />

        {/* Header (fixed) */}
        <div className="fixed top-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 flex justify-between items-center px-4 py-2 z-20 shadow-sm" style={{ left: "var(--sidebar-width)" }} >
          <div>
            <h1 className="text-lg font-semibold text-gray-700 tracking-tight">
              {pageInfo.title}
            </h1>
          </div>

          <Navbar data={session} />
        </div>

        {/* Main content area */}
        <main
          style={{
            marginLeft: 'var(--sidebar-width)',
            paddingTop: 'calc(var(--header-height) + 16px)', // leave space for header + a little gap
            paddingLeft: 20,
            paddingRight: 20,
            minHeight: 'calc(100vh - var(--header-height))',
          }}
        >
          {children}
        </main>

        <RaiseTicketFav />

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop
          draggable
          theme="light"
          transition={Slide}
        />
      </div>
    </SessionProvider>
  );
}

export const experimental_ppr = true;
