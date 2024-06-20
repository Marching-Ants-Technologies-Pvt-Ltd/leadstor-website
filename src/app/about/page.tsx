import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
    return (
        <>
            <Navbar />

            <main className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 grid">
                <div className="py-14 px-10 2xl:px-0 cursor-default container max-w-screen-xl m-auto">
                    <h2 className="text-center text-3xl md:text-5xl font-bold color-[#0b1320] mb-3">About Leadstor</h2>
                    <p className="text-center color-gray-600 mt-4 md:mt-6 text-lg md:text-xl">Leadstor makes it fast and easy for businesses to delight their customers and employees.</p>
                    <div className="grid mt-20">
                        <div className="m-auto">
                            <Image
                                placeholder='empty'
                                src="/banners/about.webp"
                                width={1416}
                                height={796}
                                alt="Leadstor Hero banner"
                                priority={false}
                            />
                        </div>
                    </div>
                    <div className="text-center text-gray-700 text-base">
                        <p className="mt-20 text-justify">Most of the softwares are complex & scary for the non-technical person, but we believe software should be built in a way so that anyone can use it.</p>

                        <p className="mt-4 text-justify">Any software you buy requires a complex setup, often comes with lots of limitations and complex terms that require you and your team to spend a lot of time to set up and understand. Most of the teams hate the software they use because they increase the overhead of setup and understanding. As software evolves its features become way too difficult to handle and understand. We believe this defies the whole purpose of buying a platform. People buy the software so that some of their challenges should be solved by the software but in the end they end up getting frustrated as their team find it too complex to use.</p>

                        <p className="mt-4 text-justify">At Leadstor, we believe in making software easy to use, simple and intuitive. Our platform is built in such a simple way that your team will naturally associate with the feature. We believe in keeping the platform thin and simple with only features that are helpful. We do not believe in making complex features that our users cannot use. Most of our features are build based on the problem statements discussed with our users. Our team internally also uses all of our software and any feature which becomes complex with either be simplified or removed from our software. We have one of the best customer support and we do not believe in providing helpline numbers where you have to wait a long time to get your issues addressed. You get modern ways of reaching your support manager and your issues are monitored by the next level in real-time. We believe that after-sales services is more important than new sales.</p>
                    </div>
                </div>
            </main >

            <section className="container mx-auto max-w-screen-xl py-24 px-5 md:px-10 2xl:px-0">
                <div className="flex bg-sky-100 rounded-3xl p-6 md:p-12 flex-col xl:flex-row">
                    <div className="grow pr-0 xl:pr-16">
                        <Image
                            placeholder='empty'
                            src="/icons/quote.svg"
                            width={50}
                            height={42}
                            alt="Quote"
                            priority={false}
                        />
                        <p className="mt-8 xl:mt-16 text-xl md:text-2xl">We go the extra mile to meet your needs and proactively work with you to achieve the results you want. Your success is our success.</p>
                        <div className="mt-6 md:mt-12">
                            <p className="font-semibold text-xl md:text-2xl">Abhay Shukla</p>
                            <p className="fonnt-semibold text-lg md:text-xl mt-2">Founder &amp; Chief Executive Officer, Leadstor</p>
                        </div>
                    </div>
                    <div className="flex-none hidden xl:block">
                        <Image
                            className="rounded-2xl"
                            placeholder='empty'
                            src="/img/abhay.png"
                            width={400}
                            height={400}
                            alt="Leadstor Hero banner"
                            priority={false}
                        />
                    </div>
                </div>
            </section>

            <Footer />

        </>
    );
}