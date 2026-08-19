import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileAppActions from "./mobile-app-actions";
import {
    ChevronRight,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Star,
    Download,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mobile App | Leadstor",
    description: "Preview the Leadstor mobile app and download it from the App Store or Google Play.",
};

export default function MobileAppPage() {
    return (
        <>
            <Navbar />

            <main className="relative overflow-hidden bg-[#f5f7fb]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
                    <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,rgba(245,247,251,0)_0%,rgba(255,255,255,0.9)_100%)]" />
                </div>

                <section className="relative border-b border-slate-200/80">
                    <div className="container mx-auto max-w-screen-xl px-5 py-14 md:px-10 lg:px-8 lg:py-20 xl:px-0">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm backdrop-blur">
                                    <Smartphone className="h-3.5 w-3.5" />
                                    Leadstor Mobile App
                                </div>

                                <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                    Manage leads anywhere with a mobile experience built for speed.
                                </h1>

                                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                                    Preview the Leadstor app interface, explore how teams stay on top of new enquiries, and download the app from your preferred store.
                                </p>

                                <MobileAppActions playStoreUrl="https://play.google.com/store/apps/details?id=com.leadstor.Leadstor" />

                                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                                        <Download className="h-4 w-4 text-sky-600" />
                                        Fast installation
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        Secure account access
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        Built for everyday sales teams
                                    </div>
                                </div>
                            </div>

                            <div className="relative mx-auto w-full max-w-[560px]">
                                <div className="absolute inset-x-6 top-10 h-[420px] rounded-[2rem] bg-sky-500/10 blur-3xl" />
                                <div className="relative grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                                    <div className="rounded-[1rem] border border-white/70 bg-white/90 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                    Mobile dashboard
                                                </p>
                                                <h2 className="text-lg font-semibold text-slate-900">
                                                    Lead activity at a glance
                                                </h2>
                                            </div>
                                            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                                                <Sparkles className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="mt-4 overflow-hidden rounded-[0.8rem] border border-slate-200 bg-slate-950 p-1 shadow-inner">
                                            <div className="relative aspect-[9/18] overflow-hidden rounded-[8px] bg-slate-100">
                                                <Image
                                                    src="/img/mobile-app.jpeg"
                                                    alt="Leadstor mobile app mockup"
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 1024px) 100vw, 340px"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
                                            <p className="text-sm font-semibold text-slate-500">Designed for</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">Sales on the move</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                View leads, respond quickly, and keep your team updated from anywhere.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                            <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-4 shadow-lg shadow-slate-900/5">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                    Live status
                                                </p>
                                                <p className="mt-2 text-2xl font-bold text-slate-900">Instant updates</p>
                                                <p className="mt-2 text-sm text-slate-600">Track new leads, assignments, and follow-ups in real time.</p>
                                            </div>
                                            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                    Supported stores
                                                </p>
                                                <p className="mt-2 text-2xl font-bold text-slate-900">iOS + Android</p>
                                                <p className="mt-2 text-sm text-slate-600">A simple download flow for both major mobile ecosystems.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
