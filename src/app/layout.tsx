import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fonts.google.css";
import { Providers } from './providers';
import StructuredData from '@/components/StructuredData';
import { GoogleTagManager } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leadstor | Advanced Lead Management & Tracking Software",
  description: "LeadStor is an advanced online lead management software designed to help businesses manage and track their leads efficiently.",
  keywords: "lead management software, lead tracking software, lead generation software, lead software, sales lead tracking software, lead distribution software, customer relationship software, CRM software, CRM System, sales optimization, lead conversion, sales , leadstor, lead store, lead stor, leadstor crm, leadstor crm, lead store crm",
  robots: "index, follow",
  openGraph: {
    title: "Leadstor | Advanced Lead Management & Tracking Software",
    description: "LeadStor is an advanced online lead management software designed to help businesses manage and track their leads efficiently.",
    type: "website",
    url: "https://leadstor.in",
    images: ["https://leadstor.in/banners/leadstor-og-banner.jpg"],
    siteName: "Leadstor",
    locale: "en_US"
  }
};

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
        </Providers>
      </body>
      <GoogleTagManager gtmId="GTM-PWH69TPS" />
    </html>
  );
}
