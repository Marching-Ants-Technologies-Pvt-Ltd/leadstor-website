import Link from 'next/link';
import Button from '@/components/elements/Button';

export default function Footer({
    showSignupBanner = true
}) {
    return (
        <>
            {(showSignupBanner) &&
                <footer className="bg-white footer-bg">
                    <div className="container mx-auto px-4 max-w-screen-md pt-24 text-center pb-[150px]">
                        <h3 className="text-xl sm:text-3xl leading-2 sm:leading-10 font-semibold sm:font-bold text-gray-800">Nurture leads efficiently with Leadstor, the best lead management software.</h3>
                        <p className="mt-3 text-sm sm:text-base text-slate-600">Start with 10 free leads &amp; 1 integration. No credit card required. No strings attached.</p>
                        <Button href="/signup" className="mt-8 bg-gray-800 hover:bg-gray-900 text-white px-8 py-2 text-sm font-medium rounded uppercase">Signup for free</Button>
                        <p className="mt-3 text-gray-400 text-sm">Get full access to the product, no credit card required</p>
                    </div>
                </footer>
            }

            <section className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-screen-xl">
                    <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                        <span className="cursor-default text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <Link href="/" className="hover:underline">Leadstor</Link>. All Rights Reserved.
                        </span>
                        <ul className="flex flex-wrap items-center mt-3 text-sm font-normal text-gray-500 dark:text-gray-400 sm:mt-0">
                            <li>
                                <Link href="/contact" className="hover:underline me-4 md:me-6">Contact</Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="hover:underline me-4 md:me-6">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:underline me-4 md:me-6">Terms Of Use</Link>
                            </li>
                            <li>
                                <Link href="/refund-cancellation" className="hover:underline">Refund &amp; Cancellation</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
}