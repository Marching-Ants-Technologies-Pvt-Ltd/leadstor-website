import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fonts.google.css";
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lead Management Software | Lead Tracking | Leadstor",
  description: "Leadstor is a lead management and tracking system that optimizes your sales process from lead generation to closing. Track and optimize campaigns in real-time, automate follow-ups, and gain actionable insights with detailed analytics. Enhance your sales pipeline and improve conversion rates with Leadstore's intuitive platform.",
  keywords: "lead management software, lead tracking software, lead generation software, lead software, sales lead tracking software, lead distribution software, customer relationship software,CRM software, CRM System.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html  lang="en" suppressHydrationWarning className="scroll-smooth">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
