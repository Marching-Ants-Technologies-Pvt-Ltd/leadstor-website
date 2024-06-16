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
                    <div className="flex">
                        <div className="flex-1 mb-10">
                            <div className="text-7xl font-bold">
                                <div className="mb-2">Contact</div>
                                <div>Leadstore</div>
                            </div>
                            <p className="text-xl mt-8">Questions about products, features, or pricing? Need a demo? Our sales experts are ready to help.</p>
                            <p className="text-2xl font-semibold mt-6">Talk with our team</p>
                            <p className="text-xl font-normal mt-6 mb-10">+91 (860) 007 4862 | solutions@leadstore.in</p>
                            <Image
                                placeholder='empty'
                                src="/banners/contact.webp"
                                width={600}
                                height={300}
                                alt="Leadstore Hero banner"
                                priority={false}
                            />
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

                <div className="flex mt-10">
                    <div className="flex-1 m-4 bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-xl mb-4">Lead Management</h3>
                        <p className='text-sm text-gray-500'>Need assistance with leads management? Explore our articles, check out the product documentation, or connect with our team of specialized lead management experts for support.</p>
                        <div className="flex mt-10">
                            <a href="https://wa.me/918600074862" target="_blank" className='border-2 rounded border-stone-900 px-4 py-2 font-semibold text-stone-900 cursor-pointer'>Lead support</a>
                            <a href="mailto:solutions@leadstore.in" target="_blank" className='flex px-4 py-2 ml-2 font-semibold cursor-pointer text-sky-500'>Email us
                            <Image
                                className='ml-1'
                                placeholder='empty'
                                src="/icons/arrow_forward_24.svg"
                                width={18}
                                height={18}
                                alt="Leadstore Icon Arrow Forward"
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
                            <a href="mailto:abhay.shukla@leadstore.in" target="_blank" className='flex px-4 py-2 ml-2 font-semibold cursor-pointer text-sky-500'>Email us
                            <Image
                                className='ml-1'
                                placeholder='empty'
                                src="/icons/arrow_forward_24.svg"
                                width={18}
                                height={18}
                                alt="Leadstore Icon Arrow Forward"
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