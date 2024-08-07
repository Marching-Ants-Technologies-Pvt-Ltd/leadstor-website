import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fonts.google.css";
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leadstor | Advanced Lead Management & Tracking Software",
  description: "Leadstor is a comprehensive lead management and tracking system designed to streamline your sales process from lead generation to closing. Optimize campaigns in real-time, automate follow-ups, and gain actionable insights with detailed analytics. Enhance your sales pipeline and improve conversion rates with Leadstor's intuitive platform.",
  keywords: "lead management software, lead tracking software, lead generation software, lead software, sales lead tracking software, lead distribution software, customer relationship software, CRM software, CRM System, sales optimization, lead conversion, sales analytics",
  robots: "index, follow",
  openGraph: {
    title: "Leadstor | Advanced Lead Management & Tracking Software",
    description: "Leadstor is a comprehensive lead management and tracking system designed to streamline your sales process from lead generation to closing. Optimize campaigns in real-time, automate follow-ups, and gain actionable insights with detailed analytics. Enhance your sales pipeline and improve conversion rates with Leadstor's intuitive platform.",
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
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
