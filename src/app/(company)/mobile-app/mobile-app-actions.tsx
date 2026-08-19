"use client";

import { useEffect, useState } from "react";
import { Apple, ExternalLink, Play, X } from "lucide-react";

type MobileAppActionsProps = {
    playStoreUrl: string;
    initialOs?: string;
};

export default function MobileAppActions({ playStoreUrl, initialOs = "" }: MobileAppActionsProps) {
    const [showIosModal, setShowIosModal] = useState(initialOs === "ios");

    useEffect(() => {
        const os = initialOs.trim().toLowerCase();

        if (os === "android") {
            window.location.replace(playStoreUrl);
            return;
        }

        if (os === "ios") {
            setShowIosModal(true);
        }
    }, [initialOs, playStoreUrl]);

    return (
        <>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                    type="button"
                    onClick={() => setShowIosModal(true)}
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                    <Apple className="h-5 w-5" />
                    Download on the App Store
                </button>
                <a
                    href={playStoreUrl}
                    className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-700"
                >
                    <Play className="h-5 w-5" />
                    Get it on Google Play
                </a>
            </div>

            {showIosModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ios-coming-soon-title"
                >
                    <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl shadow-slate-950/30">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                                    Coming soon
                                </div>
                                <h2 id="ios-coming-soon-title" className="mt-4 text-2xl font-bold text-slate-900">
                                    Leadstor for iPhone is on the way
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    The iOS app is not live yet. We’ll let you know as soon as it’s ready for download on the App Store.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowIosModal(false)}
                                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                                aria-label="Close modal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.5rem] bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-900">Android users</p>
                                <p className="mt-1 text-sm text-slate-600">Can install the app right away from Google Play.</p>
                            </div>
                            <div className="rounded-[1.5rem] bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-900">iPhone users</p>
                                <p className="mt-1 text-sm text-slate-600">Will be notified once the App Store release is available.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => setShowIosModal(false)}
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Close
                            </button>
                            <a
                                href={playStoreUrl}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:text-sky-700"
                            >
                                Open Google Play
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
