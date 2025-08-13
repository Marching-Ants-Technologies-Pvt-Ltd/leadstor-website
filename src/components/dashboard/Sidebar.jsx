'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Sidebar({ data, collapsed, setCollapsed }) {

    const pathName = usePathname();

    const updateActiveMenu = (pathName) => {
        console.log('Changing Path');
        let activeLink = document.querySelector(`nav .__active`);
        if (activeLink) activeLink.classList.remove('__active');

        activeLink = document.querySelector(`nav ul a[href="${pathName}"]`);
        if (activeLink) activeLink.classList.add('__active');
        
        // Update page title
        let title = pathName.split('/')[1];
        document.title = `${title.substring(0,1).toUpperCase()}${title.substring(1)} | Leadstor`;
        
    
    }
    // Track if user manually toggled
    const [userToggled, setUserToggled] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (!userToggled) {
                if (window.innerWidth <= 1000) {
                    setCollapsed(true);
                } else {
                    setCollapsed(false);
                }
            }
        };
        window.addEventListener('resize', handleResize);
        // Initial check
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [userToggled, setCollapsed]);

    const handleMenuItemClick = () => {
        // Reopen sidebar on menu item click when collapsed and screen width > 1000
        if (collapsed && window.innerWidth > 1000) {
            setCollapsed(false);
        }
    };

    // Set menu item to active on path change
    useEffect(() => {
        updateActiveMenu(pathName);
    }, [pathName]);

    return (
        <aside className={`sidebar-sticky sidebar justify-start bg-white${collapsed ? ' sidebar-collapsed' : ''}`}>
            <section className="sidebar-title items-center px-7 py-4 gap-3 flex justify-between">
                {/* Logo - always visible */}
                <div className="flex items-center gap-3">
                    <Image
                        placeholder='empty'
                        src="/icons/leadstor.png"
                        width={36}
                        height={36}
                        alt="Leadstor Icon"
                        priority={false}
                    />
                    {/* Only show text when not collapsed */}
                    {!collapsed && (
                        <span className="text-lg font-semibold text-gray-800">Leadstor</span>
                    )}
                </div>
                <button
                    className="shrink-toggle-btn text-gray-500 hover:text-gray-800"
                    style={{ outline: 'none', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                    onClick={() => {
                        setCollapsed((prev) => !prev);
                        setUserToggled(true);
                    }}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <i className={`ri-arrow-left-s-line${collapsed ? ' rotate-180' : ''}`}></i>
                </button>
            </section>

            <section className="sidebar-content min-h-[20rem]">
                <nav className="menu rounded-md">
                    <section className="menu-section px-4">
                        <ul className="menu-items gap-1 mb-4">
                            
                            <Link href="/leads" onClick={handleMenuItemClick}>
                                <li className="menu-item poppins gap-3 text-base text-gray-600">
                                    <i className="ri-megaphone-line text-xl pointer-events-none"></i>
                                    {!collapsed && <span className='mt-0.5 pointer-events-none'>Leads</span>}
                                </li>
                            </Link>
                            
                            <Link href="/conversions" onClick={handleMenuItemClick}>
                                <li className="menu-item poppins gap-3 text-base text-gray-600">
                                    <i className="ri-seedling-fill text-xl pointer-events-none"></i>
                                    {!collapsed && <span className='mt-0.5 pointer-events-none'>Conversions</span>}
                                </li>
                            </Link>
                            <Link href="/dashboard" onClick={handleMenuItemClick}>
                                <li className="menu-item poppins gap-3 text-base text-gray-600">
                                    <i className="ri-apps-line text-xl pointer-events-none"></i>
                                    {!collapsed && <span className='mt-0.5 pointer-events-none'>Dashboard</span>}
                                </li>
                            </Link>

                            <li>
                                <input type="checkbox" id="menu-integrations" className="menu-toggle" />
                                <label className="menu-item justify-between" htmlFor="menu-integrations" onClick={handleMenuItemClick}>
                                    <div className="flex poppins gap-3 text-base text-gray-600">
                                        <i className="ri-box-2-line text-xl pointer-events-none"></i>
                                        {!collapsed && <span className='mt-0.5 pointer-events-none'>Integrations</span>}
                                    </div>

                                    {!collapsed && <span className="menu-icon ri-arrow-down-s-fill text-lg"></span>}
                                </label>

                                <div className="menu-item-collapse poppins text-base">
                                    <div className="min-h-0">
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>SMS</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Email</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>IVR Services</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Calendar &amp; Meets</label>
                                        <Link href="/integration/facebook" onClick={handleMenuItemClick} className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Facebook<span className="badge badge-xs badge-flat-secondary font-normal">Pages</span></Link>
                                        <Link href="/integration/whatsapp" onClick={handleMenuItemClick} className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>WhatsApp</Link>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Payment Gateway</label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none dot-success"></span>Leadstor Form<span className="badge badge-xs badge-flat-success font-normal">New</span></label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Plugins<span className="badge badge-xs badge-flat-warning font-normal">Beta</span></label>
                                        <label className="menu-item text-gray-600 ml-6"><span className="dot pointer-events-none"></span>Webhook <span className="badge badge-xs badge-flat-primary font-normal">Suggested</span></label>
                                    </div>
                                </div>
                            </li>

                            <li>
                                <input type="checkbox" id="menu-automation" className="menu-toggle" />
                                <label className="menu-item justify-between" htmlFor="menu-automation" onClick={handleMenuItemClick}>
                                    <div className="flex poppins gap-3 text-base text-gray-600">
                                        <i className="ri-robot-3-line text-xl pointer-events-none"></i>
                                        {!collapsed && <span className='mt-0.5 pointer-events-none'>Automation</span>}
                                    </div>

                                    {!collapsed && <span className="menu-icon ri-arrow-down-s-fill text-lg"></span>}
                                </label>

                                {!collapsed && (
                                <div className="menu-item-collapse poppins text-base">
                                    <div className="min-h-0">
                                        <label className="menu-item text-gray-600 ml-6">Triggers<span className="badge badge-xs badge-flat-success font-normal pointer-events-none">New</span></label>
                                        <label className="menu-item text-gray-600 ml-6">Templates</label>
                                    </div>
                                </div>
                                )}
                            </li>
                        </ul>

                    </section>
                </nav>
            </section>
            <section className="sidebar-footer">
                <div className="divider my-0"></div>
                <div className="flex h-fit w-full cursor-pointer -mt-2">
                    <div className="mx-2 h-fit w-full cursor-pointer p-0">
                        <div className="flex flex-row gap-4 p-3">
                            <div className="avatar w-[38px] h-[38px] avatar-md mt-1">
                                <Image
                                    placeholder='empty'
                                    src={data.corporate.logo}
                                    width={36}
                                    height={36}
                                    alt="Company Logo"
                                    priority={false}
                                />
                            </div>
                            {!collapsed && (
                            <div className="flex flex-col flex-auto">
                                <span className='text-lg font-semibold'>{data.corporate.name}</span>
                                <span className="text-sm -mt-0.5 font-normal text-content2">{data.corporate.country_code}</span>
                            </div>
                            )}
                            {!collapsed && (
                            <div className='flex justify-center items-center flex-none dropdown z-50'>
                                <label tabIndex="0" className="ri-menu-3-line bg-gray-100 mt-1 rounded-full text-lg h-8 w-8 cursor-pointer flex justify-center items-center text-gray-600"></label>
                                <div className="dropdown-menu-right-top dropdown-menu ml-2 mb-8 border poppins bg-white max-w-48">
                                    <a className="dropdown-item text-sm text-gray-600">Manage Team</a>
                                    <a tabIndex="-1" className="dropdown-item text-sm text-gray-600">Account settings</a>
                                    <a tabIndex="-1" className="dropdown-item text-sm text-gray-600">Subscriptions</a>
                                    <a href={data.corporate.website_link} target='_blank' className="dropdown-item text-sm text-gray-600">Visit Website</a>
                                    <div className='w-full h-6 border-b'></div>
                                    <a href='/about' target='_blank' className="dropdown-item text-sm text-gray-600">About Leadstor</a>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </aside>
    )
}