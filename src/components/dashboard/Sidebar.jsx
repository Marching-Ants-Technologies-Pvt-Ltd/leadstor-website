'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Sidebar({ session, goOld }) {

    const router = useRouter();

    const switchPage = (e) => {
        let link = e.target.getAttribute('link');
        if (!link) return; // Skip if non clickable items clicked
        if (router.pathname === link) return; // Client is on same origin
        router.push(link);
        updateActiveMenu(link);
    }

    const updateActiveMenu = (pathName) => {
        let activeLink = document.querySelector(`nav .__active`);
        if (activeLink) activeLink.classList.remove('__active');
        
        activeLink = document.querySelector(`nav [link="${pathName}"]`);
        if (activeLink) activeLink.classList.add('__active');
    }

    useEffect(() => {
        // Expend the parent menu
        let pathName = router.pathname ?? window.location.pathname;
        if (pathName.includes('integration/')) {
            const menuIntegration = document.getElementById('menu-integrations');
            if (menuIntegration) menuIntegration.checked = true;
        }

        if (pathName.includes('automation/')) {
            const menuIntegration = document.getElementById('menu-automation');
            if (menuIntegration) menuIntegration.checked = true;
        }

        // Set active menu item
        updateActiveMenu(pathName);

        // ToDo: highlight integrated items, the green-dot
        console.log('Sidebar Updated');
    }, [router.switchPage]);

    return (
        <aside className="sidebar-sticky sidebar justify-start bg-white">
            <section className="sidebar-title items-center px-7 py-4 gap-3">
                <Image
                    placeholder='empty'
                    src="/icons/leadstor.png"
                    width={36}
                    height={36}
                    alt="Leadstor Icon"
                    priority={false}
                />
                <div className="flex flex-col">
                    <span className="text-xl">Dashboard</span>
                    <span className="text-sm font-medium text-content2">Leadstor &bull; <strong className='text-green-600 font-medium'>Basic Plan</strong></span>
                </div>
            </section>
            <section className="sidebar-content min-h-[20rem]">
                <nav className="menu rounded-md" onClick={switchPage}>
                    <section className="menu-section px-4">
                        <ul className="menu-items gap-1 mb-4">
                            <li onClick={goOld} className="menu-item poppins gap-3 text-base text-gray-600">
                                <i className="ri-megaphone-line text-xl pointer-events-none"></i>
                                <span className='mt-0.5 pointer-events-none'>Leads</span>
                            </li>
                            <li onClick={goOld} className="menu-item poppins gap-3 text-base text-gray-600">
                                <i className="ri-seedling-fill text-xl pointer-events-none"></i>
                                <span className='mt-0.5 pointer-events-none'>Conversions</span>
                            </li>
                            <li className="menu-item poppins gap-3 text-base text-gray-600" link="/dashboard">
                                <i className="ri-apps-line text-xl pointer-events-none"></i>
                                <span className='mt-0.5 pointer-events-none'>Dashboard</span>
                            </li>

                            <li>
                                <input type="checkbox" id="menu-integrations" className="menu-toggle" />
                                <label className="menu-item justify-between" htmlFor="menu-integrations">
                                    <div className="flex poppins gap-3 text-base text-gray-600">
                                        <i className="ri-box-2-line text-xl pointer-events-none"></i>
                                        <span className='mt-0.5 pointer-events-none'>Integrations</span>
                                    </div>

                                    <span className="menu-icon ri-arrow-down-s-fill text-lg"></span>
                                </label>

                                <div className="menu-item-collapse poppins text-base">
                                    <div className="min-h-0">
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>SMS</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Email</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>IVR Services</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Calendar &amp; Meets</label>
                                        <label link="/integration/facebook" className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Facebook<span className="badge badge-xs badge-flat-secondary font-normal">Pages</span></label>
                                        <label link="/integration/whatsapp" className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>WhatsApp</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Payment Gateway</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none dot-success"></span>Leadstor Form<span className="badge badge-xs badge-flat-success font-normal">New</span></label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Plugins<span className="badge badge-xs badge-flat-warning font-normal">Beta</span></label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Webhook <span className="badge badge-xs badge-flat-primary font-normal">Suggested</span></label>
                                    </div>
                                </div>
                            </li>

                            <li>
                                <input type="checkbox" id="menu-automation" className="menu-toggle" />
                                <label className="menu-item justify-between" htmlFor="menu-automation">
                                    <div className="flex poppins gap-3 text-base text-gray-600">
                                        <i className="ri-robot-3-line text-xl pointer-events-none"></i>
                                        <span className='mt-0.5 pointer-events-none'>Automation</span>
                                    </div>

                                    <span className="menu-icon ri-arrow-down-s-fill text-lg"></span>
                                </label>

                                <div className="menu-item-collapse poppins text-base">
                                    <div className="min-h-0">
                                        <label className="menu-item text-gray-600 ml-6">Triggers<span className="badge badge-xs badge-flat-success font-normal pointer-events-none">New</span></label>
                                        <label className="menu-item text-gray-600 ml-6">Templates</label>
                                    </div>
                                </div>
                            </li>
                        </ul>

                    </section>
                </nav>
            </section>
            <section className="sidebar-footer">
                <div className="divider my-0"></div>
                <div className="dropdown z-50 flex h-fit w-full cursor-pointer -mt-2 hover:bg-gray-4">
                    <label className="mx-2 flex h-fit w-full cursor-pointer p-0 hover:bg-gray-4" tabIndex="0">
                        <div className="flex flex-row gap-3 p-4">
                            <div className="avatar avatar-md mt-1">
                                <Image
                                    placeholder='empty'
                                    src="https://api.dicebear.com/5.x/initials/png?seed=C&size=50"
                                    width={36}
                                    height={36}
                                    alt="Company Avatar"
                                    priority={false}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className='text-lg font-semibold'>Conceptninjas</span>
                                <span className="text-sm -mt-0.5 font-normal text-content2">Business &bull; C{session.user._id} <i className="ri-settings-line relative bg-gray-200 p-0.5 top-[1px] rounded-full cursor-pointer text-gray-400"></i></span>
                            </div>
                        </div>
                    </label>
                    <div className="dropdown-menu-right-top dropdown-menu ml-2 mb-8 border poppins bg-white">
                        <a className="dropdown-item text-sm text-gray-600">Manage Team</a>
                        <a tabIndex="-1" className="dropdown-item text-sm text-gray-600">Account settings</a>
                        <a tabIndex="-1" className="dropdown-item text-sm text-gray-600">Subscriptions</a>
                        <a tabIndex="-1" className="dropdown-item text-sm text-gray-600">Visit Website</a>
                        <div className='w-full h-6 border-b'></div>
                        <a tabIndex="-1" className="dropdown-item text-sm text-gray-600">About Leadstor</a>
                    </div>
                </div>
            </section>
        </aside>
    )
}