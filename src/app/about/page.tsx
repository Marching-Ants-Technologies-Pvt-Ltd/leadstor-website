import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PeopleCard from "@/components/PeopleCard";

export default function About() {
    return (
        <>
            <Navbar />

            <main className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 grid">
                <div className="py-16 px-10 2xl:px-0 cursor-default container max-w-screen-xl m-auto">
                    <div className="grid mb-14">
                        <div className="m-auto">
                            <Image
                                className="rounded-xl"
                                placeholder='empty'
                                src="/banners/about-us-1180x480px.webp"
                                width={1180}
                                height={480}
                                alt="Leadstor Hero banner"
                                priority={false}
                            />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2 poppins">About Leadstor</h2>
                    <p className="color-gray-600 mt-2 md:mt-4 text-lg md:text-xl">Leadstor makes it fast and easy for businesses to delight their customers and employees.</p>

                    <div className="text-center text-gray-700 text-base">
                        <p className="mt-10 text-justify">Most of the softwares are complex & scary for the non-technical person, but we believe software should be built in a way so that anyone can use it.</p>
                        <p className="mt-4 text-justify">Any software you buy requires a complex setup, often comes with lots of limitations and complex terms that require you and your team to spend a lot of time to set up and understand. Most of the teams hate the software they use because they increase the overhead of setup and understanding. As software evolves its features become way too difficult to handle and understand. We believe this defies the whole purpose of buying a platform. People buy the software so that some of their challenges should be solved by the software but in the end they end up getting frustrated as their team find it too complex to use.</p>
                        <p className="mt-4 text-justify">At Leadstor, we believe in making software easy to use, simple and intuitive. Our platform is built in such a simple way that your team will naturally associate with the feature. We believe in keeping the platform thin and simple with only features that are helpful. We do not believe in making complex features that our users cannot use. Most of our features are build based on the problem statements discussed with our users. Our team internally also uses all of our software and any feature which becomes complex with either be simplified or removed from our software. We have one of the best customer support and we do not believe in providing helpline numbers where you have to wait a long time to get your issues addressed. You get modern ways of reaching your support manager and your issues are monitored by the next level in real-time. We believe that after-sales services is more important than new sales.</p>
                    </div>
                </div>
            </main >

            <section className="container mx-auto max-w-screen-xl py-16 px-5 md:px-10 2xl:px-0">
                <div className="lg:grid grid-flow-row-dense grid-cols-4 grid-rows-1 gap-32">
                    <div className="col-span-2">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 poppins">Our people make us great</h2>
                        <p className=" text-gray-600 mt-4 md:mt-8 text-lg text-justify">At Leadstor, we believe that when passionate, driven individuals collaborate toward a shared goal, remarkable results are achieved. Our Leadership Team brings extensive expertise in developing and scaling successful B2B software products and businesses, ensuring innovative solutions that drive growth and deliver exceptional value.</p>
                        <div className='mt-10 lg:block hidden'>
                            <a className='border border-sky-500 flex w-fit rounded-lg pl-4 py-2 cursor-pointer text-sky-500 font-normal text-sm poppins'>
                                See the entire team
                                <Image
                                    className='ml-2 mr-3'
                                    placeholder='empty'
                                    src="/icons/arrow_forward_24.svg"
                                    width={14}
                                    height={14}
                                    alt="Leadstor Icon Arrow Forward"
                                    priority={false}
                                />
                            </a>
                        </div>
                    </div>
                    <div className="col-span-2 mt-12 lg:mt-0">
                        <PeopleCard
                            image="/img/abhay.webp"
                            name="Abhay Sukhla"
                            role="Founder &amp; Chief Executive Officer"
                            message="We go the extra mile to meet your needs and proactively work with you to achieve the results you want. Your success is our success."
                            linked_in="https://www.linkedin.com/in/abhay-shukla-9244b8b7"
                            instagram="https://www.instagram.com/abhay.shukla.7927/"
                        />
                        <PeopleCard
                            image="/img/pankaj.webp"
                            name="Pankaj Dwivedi"
                            role="Founder &amp; Chief Technology Officer"
                            message="We are passionate about delivering the best technical solutions tailored for end users and proactively collaborate with you to achieve your desired results."
                            linked_in="https://www.linkedin.com/in/pankydcoder"
                            instagram="https://www.instagram.com/pankydcoder/"
                            twitter='https://x.com/pankydcoder'
                        />
                        <PeopleCard
                            image="/img/veena.webp"
                            name="Veena Srinivas"
                            role="Business Account Manager"
                            message="Organized and passionate, with a keen eye for detail, dedicated to ensuring business customers enjoy an exceptional platform experience."
                            linked_in="https://www.linkedin.com/in/veena-srinivas-8414b511b"
                            instagram="https://www.instagram.com/veenasriyani/"
                            twitter='https://x.com/veenasrini73'
                        />
                    </div>
                </div>
                <div className='flex justify-center mt-20'>
                    <div className='flex bg-gray-50 border border-zinc-200 py-4 px-4 rounded-lg gap-6'>
                        <Image
                            placeholder='empty'
                            src="/icons/people-group.svg"
                            width={24}
                            height={24}
                            alt="Leadstor peoples icon"
                            priority={false}
                        />
                        <div className='text-base poppins text-gray-800'>
                            <span className='font-semibold'>Want to join the Leadstor team?&nbsp;</span>
                            We&apos;re currently hiring!
                        </div>
                        <div className='w-52 text-right font-semibold text-sky-500'>
                            <a href='/career' target="_self" className='flex justify-end poppins font-normal'>
                                Join our team
                                <Image
                                    className='ml-2'
                                    placeholder='empty'
                                    src="/icons/arrow_forward_24.svg"
                                    width={14}
                                    height={14}
                                    alt="Leadstor Icon Arrow Forward"
                                    priority={false}
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

        </>
    );
}