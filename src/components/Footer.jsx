export default function Footer() {
    return (
        <>
            <footer className="bg-white footer-bg">
                <div className="container mx-auto px-4 max-w-screen-md pt-24 text-center pb-[150px]">
                    <h3 className="text-3xl leading-10 font-bold text-[#0b1320]">Nurture leads efficiently with Leadstore, the best lead management software.</h3>
                    <p className="mt-3 text-base text-slate-600">Start your 7-day free trial. No credit card required. No strings attached.</p>
                    <button className="mt-8 bg-[#0b1320]/100 hover:bg-[#0b1320]/90 text-white px-4 py-2 text-sm font-medium rounded uppercase">Signup for free</button>
                    <p className="mt-3 text-gray-400 text-sm">Get full access to the product, no credit card required</p>
                </div>
            </footer>

            <section className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-screen-xl">
                    <div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                        <span class="cursor-default text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="#" class="hover:underline">Leadstore</a>. All Rights Reserved.
                        </span>
                        <ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                            <li>
                                <a href="#" class="hover:underline me-4 md:me-6">About</a>
                            </li>
                            <li>
                                <a href="#" class="hover:underline me-4 md:me-6">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#" class="hover:underline me-4 md:me-6">Terms Of Use</a>
                            </li>
                            <li>
                                <a href="#" class="hover:underline">Contact</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
}