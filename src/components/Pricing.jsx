import Image from 'next/image';
import Button from '@/components/elements/Button';

export default function Pricing() {
    return (
        <>
            <section id='pricing' className="container mx-auto px-4 max-w-screen-xl">
                <div className="py-14 cursor-default">
                    <h1 className='font-semibold text-4xl poppins text-center'>Plans &amp; pricing</h1>
                    <p className="text-sm poppins sm:text-base text-center mt-4 text-gray-500">Discover the best leads, boost customer engagement, and drive deals to closure with a smart, comprehensive solution.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-[1px] border-[#b5b8bc] gap-0 bg-white p-0 rounded-xl mt-10">

                        <div className="">
                            <div className="min-h-[435px] bg-gray-50  rounded-tl-xl border-b border-[#b5b8bc] inline-flex items-start">
                                <div className=' px-6 py-6'>
                                    <h4 className="text-2xl poppins font-semibold text-left">Basic</h4>
                                    <p className="mt-4 text-left antialiased font-normal text-sm text-gray-500">Tailored for startups and SMBs seeking efficient pipeline management and engagement across channels</p>
                                    <div className="text-left mt-6">
                                        <div className="font-semibold poppins text-2xl">₹3,500</div>
                                        <div className="mt-1">/month, billed monthly</div>
                                        <Button href="/signup?sub=bm" className="text-sm font-medium rounded-lg px-6 py-3 w-full mt-10 bg-gray-700 hover:bg-gray-800 text-white transition duration-300">Get started</Button>
                                        <Button href="/contact" className="text-sm font-medium rounded-lg px-6 py-3 w-full mt-3 bg-blue-transparent text-transparent cursor-default pointer-events-none select-none">-</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 mb-4 px-10 py-4">
                                <p className="font-normal text-sm italic">Free Sales Communication Integrations, 10 free leads &amp; 1 integration,  Plus</p>
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

                        <div className="border-t-2 col-span-2 md:col-span-1 md:border-t-0 border-r border-l border-[#b5b8bc]">
                            <div className="min-h-[435px] bg-blue-50 border-b border-[#b5b8bc] inline-flex items-start relative">
                                <div className='px-6 py-6'>
                                    <h4 className="text-2xl poppins font-semibold text-left">Pro<span className="ml-2 poppins font-semibold text-xs bg-[#bdd7ff] text-black py-1 px-2 uppercase rounded relative bottom-1">Popular</span></h4>
                                    <p className="mt-4 text-left antialiased font-normal text-sm text-gray-500">Ideal for growing & mid-sized businesses requiring advanced capabilities and assistance<span className='text-transparent select-none'>- - - - - - - - - - - -</span></p>
                                    <div className="text-left mt-6">
                                        <div className="font-semibold poppins text-2xl">₹6,000</div>
                                        <div className="mt-1">/month, billed monthly</div>
                                        <Button href="/signup?sub=bm" className="text-sm font-medium rounded-lg px-6 py-3 w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white transition duration-300">Start a free trial</Button>
                                        <Button href="/signup?sub=bm" className="text-sm font-medium rounded-lg px-6 py-3 w-full mt-3 bg-blue-transparent hover:bg-blue-100 text-gray-600 transition duration-300">Contact Sales</Button>
                                    </div>
                                </div>
                                <Image
                                    className='absolute bg-white p-[5px] rounded-3xl right-3 top-3'
                                    placeholder='empty'
                                    src="/icons/crown_32.svg"
                                    width={32}
                                    height={32}
                                    alt="leadstor Popular Plan"
                                    priority
                                />
                            </div>
                            <div className="mt-4 mb-4 px-10 py-4">
                                <p className="font-normal text-sm italic">Everything in Basic, plus</p>
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
                            <div className="min-h-[435px] bg-green-50 rounded-tr-xl border-b border-[#b5b8bc] inline-flex items-start relative">
                                <div className='px-6 py-6'>
                                    <h4 className="text-2xl poppins font-semibold text-left">Super</h4>
                                    <p className="mt-4 text-left antialiased font-normal text-sm text-gray-500">Designed for mid to large-sized businesses needing advanced customization and governance capabilities</p>
                                    <div className="text-left mt-6">
                                        <div className="font-semibold poppins text-2xl">₹12,000</div>
                                        <div className="mt-1">/month, billed monthly</div>
                                        <Button href="/signup?sub=bm" className="text-sm font-medium rounded-lg px-6 py-3 w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white transition duration-300">Start a free trial</Button>
                                        <Button href="/contact" className="text-sm font-medium rounded-lg px-6 py-3 w-full mt-3 bg-blue-transparent text-transparent cursor-default pointer-events-none select-none">-</Button>
                                    </div>
                                </div>
                                <Image
                                    className='absolute bg-white p-[5px] rounded-3xl right-3 top-3'
                                    placeholder='empty'
                                    src="/icons/crown_32.svg"
                                    width={32}
                                    height={32}
                                    alt="leadstor Popular Plan"
                                    priority
                                />
                            </div>
                            <div className="mt-4 mb-4 px-10 py-4">
                                <p className="font-normal text-sm italic">Everything in Pro, plus</p>
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
                                        <span className="text-xs sm:text-sm">Batch &amp; Attendance Management</span>
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

                    <div className="border border-gray-200 gap-0 px-7 sm:px-10 py-10 rounded-xl mt-10 w-full flex bg-gray-50">
                        <div className='w-full xl:w-1/2'>
                            <h4 className="text-xl poppins text-gray-700 sm:text-2xl font-semibold">Sales Communication Integrations</h4>
                            <div className="my-8 antialiased font-normal text-xs sm:text-sm text-gray-500 text-justify">
                                If you have subscribed to third-party services with active Webhooks or APIs and want to integrate them with Leadstor, we are here to assist you. Our team will ensure a seamless integration process, enhancing your lead management experience. Even if you are not tech-savvy, we will guide you every step of the way to make the process simple and effective. We currently offer Email, SMS, Whatsapp Message Service, IVR Phone Call Tracking.
                            </div>
                            <Button className='border border-gray-400 px-6 py-2 text-xs sm:text-xs rounded text-gray-600 hover:border-gray-500 hover:text-gray-800 poppins'>View All Integrations</Button>
                        </div>
                        <div className='flex-grow relative'>
                            <img style={{ height: '265px' }} className='absolute z-0 right-[-45px]' src='/banners/third-party-integrations.png' alt='integrations banner' loading='lazy' />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}