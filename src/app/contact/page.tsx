import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
    return (
        <>
            <Navbar />

            <main className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 grid">
                <div className="py-14 px-0 cursor-default container max-w-screen-xl m-auto">
                    <div className="flex px-10 2xl:px-0 flex-col lg:flex-row">
                        <div className="flex-1 mb-[-1rem] lg:mb-10">
                            <div className='flex flex-col-reverse lg:flex-col'>
                                <div className='text-center lg:text-left'>
                                    <div className="text-4xl sm:text-5xl xl:text-7xl font-bold flex-col sm:flex-row lg:flex lg:flex-col inline-flex items-center lg:items-start">
                                        <div className="mb-2">Contact</div>
                                        <div className="hidden sm:block ml-3 lg:ml-0">Leadstor</div>
                                    </div>
                                    <p className="text-lg max-w-[500px] lg:max-w-full inline-flex items-center xl:text-xl mt-2 lg:mt-8">Questions about products, features, or pricing? Need a demo? Our sales experts are ready to help.</p>
                                    <p className="text-xl xl:text-2xl font-semibold mt-4 lg:mt-6">Talk with our team</p>
                                    <p className="text-gl xl:text-xl font-normal mt-4 lg:mt-6 mb-10"><a className='hover:text-blue-600' target='_blank' href='https://wa.me/918600074862'>+91 (860) 007 4862</a> | <a className='hover:text-blue-600' href='mailto:solutions@leadstor.in'>solutions@leadstor.in</a></p>
                                </div>
                                <div className='mb-12'>
                                    <Image
                                        className='w-full h-auto lg:w-auto lg:h-[300px]'
                                        placeholder='empty'
                                        src="/banners/contact.webp"
                                        width={600}
                                        height={300}
                                        alt="Leadstor Hero banner"
                                        priority={false}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </main>


            <section className="container mx-auto px-4 max-w-screen-xl py-16 cursor-default">

                <h3 className="text-center text-6xl font-bold color-[#0b1320]">Let’s talk</h3>
                <p className="mt-6 text-base text-gray-400 text-center">Talk to a member of our sales team to schedule a demo, pick the best plan for your team,</p>
                <p className="mt-1 text-base text-gray-400 text-center">or learn more about everything conceptninjas has to offer.</p>

                <div className="flex mt-10 flex-col lg:flex-row">
                    <div className="flex-1 m-4 bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-xl mb-4">Lead Management</h3>
                        <p className='text-sm text-gray-500'>Need assistance with leads management? Explore our articles, check out the product documentation, or connect with our team of specialized lead management experts for support.</p>
                        <div className="flex mt-10">
                            <a href="https://wa.me/918600074862" target="_blank" className='border-2 rounded border-stone-900 px-4 py-2 font-semibold text-stone-900 cursor-pointer'>Lead support</a>
                            <a href="mailto:solutions@leadstor.in" target="_blank" className='flex px-4 py-2 ml-2 font-semibold cursor-pointer text-sky-500'>Email us
                                <Image
                                    className='ml-1'
                                    placeholder='empty'
                                    src="/icons/arrow_forward_24.svg"
                                    width={18}
                                    height={18}
                                    alt="Leadstor Icon Arrow Forward"
                                    priority={false}
                                />
                            </a>
                        </div>
                    </div>

                    <div className="flex-1 m-4 bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-xl mb-4">Any Escalation</h3>
                        <p className='text-sm text-gray-500'>Facing an issue that needs escalation? Browse our resources, review the documentation, or reach out to our team of dedicated experts for prompt resolution.</p>
                        <div className="flex mt-10">
                            <a href="https://wa.me/918390849886" target="_blank" className='border-2 rounded border-stone-900 px-4 py-2 font-semibold text-stone-900 cursor-pointer'>Escalation support</a>
                            <a href="mailto:abhay.shukla@leadstor.in" target="_blank" className='flex px-4 py-2 ml-2 font-semibold cursor-pointer text-sky-500'>Email us
                                <Image
                                    className='ml-1'
                                    placeholder='empty'
                                    src="/icons/arrow_forward_24.svg"
                                    width={18}
                                    height={18}
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