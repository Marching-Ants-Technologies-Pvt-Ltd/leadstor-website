import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fonts.google.css";
import { Providers } from './providers';
import StructuredData from '@/components/StructuredData';
import { GoogleTagManager } from '@next/third-parties/google';
import { MetaTags } from 'leadstor';
import ReminderPopup from '@/components/ReminderPopup';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = MetaTags;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth" data-theme="light">
      <head>
        <StructuredData />
      </head>
      <body>
        <Providers>
          {children}
          {/* ✅ SSE Listener mounted globally */}
          <ReminderPopup />
        </Providers>
      </body>
      <GoogleTagManager gtmId="GTM-PWH69TPS" />
    </html>
  );
}