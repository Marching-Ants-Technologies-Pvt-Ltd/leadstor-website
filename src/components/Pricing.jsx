import Image from 'next/image';
import Button from '@/components/elements/Button';

export default function Pricing() {
    return (
        <>
            <section className="container mx-auto px-4 max-w-screen-xl">
                <div className="py-14 cursor-default">
                    <p className="text-sm sm:text-base text-center">Discover the best leads, boost customer engagement, and drive deals to closure with a smart, comprehensive solution.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-[1px] border-[#b5b8bc] gap-0 bg-white p-0 rounded-xl mt-10">

                        <div className="">
                            <div className="px-6 py-6 min-h-[218px] border-b-[1px] border-[#b5b8bc] inline-flex items-center">
                                <div>
                                    <h4 className="text-2xl font-bold text-center">Basic</h4>
                                    <p className="mt-4 text-center antialiased font-normal text-sm sm:text-base ">Tailored for startups and SMBs seeking efficient pipeline management and engagement across channels</p>
                                </div>
                            </div>
                            <div className="mt-4 mb-4 px-10 py-4">
                                <div className="text-center">
                                    <p className="font-semibold">₹3,500</p>
                                    <p className="mt-3 mb-6">/month, billed monthly</p>
                                    <Button href="/signup?sub=bm" className="text-xs sm:text-sm font-semibold hover:bg-[#4382df] hover:text-white hover:border-[#4382df] rounded border-[1px] border-black px-6 py-2 uppercase">Sign Up</Button>
                                </div>
                                <p className="mt-8 font-normal text-sm italic">Free Sales Comunication Integrations, Plus</p>
                                <ul role="list" className="mt-6 space-y-4 text-left">

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">No User Login Restriction</span>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">Manage Upto 7,000 Contacts/Year</span>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-sm font-semibold">Lead Capture</span>
                                    </li>
                                    <li>
                                        <ul className="ml-12 text-sm mt-[-8px] list-disc">
                                            <li className="mt-2">Capture Leads from Facebook, Website, GoogleAds, Sulekha, Justdial, UrbanPro, Webhook/API etc.</li>
                                            <li className="mt-2">Zero Lead SPill</li>
                                        </ul>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-sm font-semibold">Lead Management</span>
                                    </li>
                                    <li>
                                        <ul className="ml-12 text-sm mt-[-8px] list-disc">
                                            <li className="mt-2">Realtime Lead Capture</li>
                                            <li className="mt-2">Auto Assign Leads to User</li>
                                            <li className="mt-2">Lead Tracking</li>
                                            <li className="mt-2">Duplicate Lead Blocking</li>
                                            <li className="mt-2">FollowUp Reminders to User</li>
                                            <li className="mt-2">Lead Analytics</li>
                                            <li className="mt-2">Track Users</li>
                                        </ul>
                                    </li>

                                </ul>
                            </div>
                        </div>

                        <div className="border-t-2 col-span-2 md:col-span-1 md:border-t-0 border-r-[1px] border-l-[1px] border-[#b5b8bc]">
                            <div className="px-6 py-6 min-h-[218px] border-b-[1px] border-[#b5b8bc] inline-flex items-center">
                                <div>
                                    <h4 className="text-2xl font-bold text-center">Pro<span className="ml-2 font-semibold text-xs bg-[#bdd7ff] text-black py-1 px-2 uppercase rounded relative bottom-1">Popular</span></h4>
                                    <p className="mt-4 text-center antialiased font-normal text-sm sm:text-base">Ideal for growing & mid-sized businesses requiring advanced capabilities and assistance</p>
                                </div>
                            </div>
                            <div className="mt-4 mb-4 px-10 py-4">
                                <div className="text-center">
                                    <p className="font-semibold">₹6,000</p>
                                    <p className="mt-3 mb-6">/month, billed monthly</p>
                                    <Button href="/signup?sub=pm" className="text-xs sm:text-sm font-semibold bg-[#4382df]/80 hover:bg-[#4382df]/100 text-white border-[#4382df] rounded border-[1px] px-6 py-2 uppercase">Sign Up</Button>
                                </div>
                                <p className="mt-8 font-normal text-sm italic">Everything in Basic, plus</p>
                                <ul role="list" className="mt-6 space-y-4 text-left">

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">Manage Upto 12,000 Contacts/Year</span>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-sm font-semibold">Payments Management</span>
                                    </li>
                                    <li>
                                        <ul className="ml-12 text-sm mt-[-8px] list-disc">
                                            <li className="mt-2">Automated Payment FollowUp Reminders</li>
                                            <li className="mt-2">Automated Receipt Generation</li>
                                            <li className="mt-2">Payment Reports</li>
                                        </ul>
                                    </li>

                                </ul>
                            </div>
                        </div>

                        <div className="border-t-2 border-gray-200 col-span-2 lg:col-span-1 lg:border-t-0">
                            <div className="px-6 py-6 min-h-[218px] border-b-[1px] border-[#b5b8bc] inline-flex items-center w-full">
                                <div>
                                    <h4 className="text-2xl font-bold text-center">Super</h4>
                                    <p className="mt-4 text-center antialiased font-normal text-sm sm:text-base">Designed for mid to large-sized businesses needing advanced customization and governance capabilities</p>
                                </div>
                            </div>
                            <div className="mt-4 mb-4 px-10 py-4">
                                <div className="text-center">
                                    <p className="font-semibold">₹12,000</p>
                                    <p className="mt-3 mb-6">/month, billed monthly</p>
                                    <Button href="/signup?sub=sm" className="text-xs sm:text-sm font-semibold hover:bg-[#4382df] hover:text-white hover:border-[#4382df] rounded border-[1px] border-black px-6 py-2 uppercase">Sign Up</Button>
                                </div>
                                <p className="mt-8 font-normal text-sm italic">Everything in Pro, plus</p>
                                <ul role="list" className="mt-6 space-y-4 text-left">

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">Manage Upto 20,000 Contacts/Year</span>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">Placement Management</span>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">Batch &amp; Attendence Management</span>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">Lead Nurturing</span>
                                    </li>

                                    <li className="flex items-center space-x-2 sm:space-x-3">
                                        <Image
                                            placeholder='empty'
                                            src="/icons/tick.svg"
                                            width={22}
                                            height={22}
                                            alt="Tick"
                                            priority
                                        />
                                        <span className="text-xs sm:text-sm">Customization</span>
                                    </li>
                                    <li className="text-sm italic">
                                        *Minor customization, which will align with our general flow.
                                    </li>

                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-[1px] border-[#b5b8bc] gap-0 bg-white px-7 sm:px-10 py-1 rounded-xl mt-10">
                        <div className='flex flex-col gap-10 py-10 lg:flex-row lg:py-0 lg:gap-20'>
                            <div className='flex-grow order-last lg:order-none inline-flex items-center '>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-semibold">Free Sales Comunication Integrations</h4>
                                    <p className="mt-6 mb-8 antialiased font-normal text-xs sm:text-sm text-gray-500 ">If you have subscribed to third-party services with active Webhooks or APIs and want to integrate them with Leadstor, we are here to assist you. Our team will ensure a seamless integration process, enhancing your lead management experience. Even if you are not tech-savvy, we will guide you every step of the way to make the process simple and effective. We currently offer Email, SMS, Whatsapp Message Service, IVR Phone Call Tracking.</p>
                                    <Button className='border border-gray-400 px-6 py-2 text-xs sm:text-sm rounded text-gray-500 hover:border-gray-500 hover:text-gray-600'>View All Integrations</Button>
                                </div>
                            </div>

                            <div className='flex-none'>
                                <div>
                                <Image
                                    placeholder='empty'
                                    src="/banners/ls-integrations.png"
                                    width={350}
                                    height={350}
                                    alt="Leadstor Hero banner"
                                    priority
                                />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}