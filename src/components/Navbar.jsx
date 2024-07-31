"use client";

import React, { useRef } from 'react';

export default function Navbar({
    user = {}
}) {

    const cover = useRef(null);
    const menu = useRef(null);

    function handelMenuVisibility(show = false) {

        if(show){
            cover.current.classList.remove('hidden');
            menu.current.classList.remove('hidden');
            return;
        }

        cover.current.classList.add('hidden');
        menu.current.classList.add('hidden');
    }

    return (
        <div>
            <header className="bg-white fixed z-10 top-0 w-full shadow-sm">
                <nav className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img src="/icons/leadstor.png" className="h-8" alt="Leadstor Logo" loading='lazy' />
                            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white text-gray-700">Leadstor</span>
                        </a>
                        <button onClick={() => handelMenuVisibility(true)} data-collapse-toggle="navbar-solid-bg" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-solid-bg" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <img src="/icons/burger-menu.svg" alt="Leadstor menu icon" loading='lazy' />
                        </button>

                        {(!user.name) &&
                            <div className="hidden w-full md:block md:w-auto">
                                <ul className="navbar poppins">
                                    <li>
                                        <a href="/#why-leadstor" className="navbar-item mt-2" aria-current="page">Why Leadstor</a>
                                    </li>
                                    <li>
                                        <a href="/#pricing" className="navbar-item mt-2">Pricing</a>
                                    </li>
                                    <li>
                                        <a href="/#customer" className="navbar-item mt-2">Customers</a>
                                    </li>
                                    <li>
                                        <a href="/about" className="navbar-item mt-2">About</a>
                                    </li>
                                    <li>
                                        <div className="relative inline-flex group">
                                            <div className="absolute transitiona-all duration-1000 opacity-10 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg filter group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200"></div>
                                            <a href="/signin" target="_self" title="" role="button" className="relative inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white transition-all duration-200 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-800 rounded">Sign In</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        }
                        {(user.name) &&
                            <div className="hidden w-full md:block md:w-auto">
                                <ul className="navbar">
                                    <li className='content-center mr-[-1rem]'>
                                        <p className='text-gray-600 font-semibold text-base'>Hi, {user.name}</p>
                                    </li>
                                    <li className='content-center'>
                                        <img src={user.image} loading='lazy' alt='Leadstor User Image' height={35} width={35} className='rounded-xl' />
                                    </li>
                                </ul>
                            </div>
                        }
                    </div>
                </nav>
            </header>
            <div className='h-16'></div>

            <div onTouchStart={() => handelMenuVisibility()} ref={cover} className="hidden absolute top-0 left-0 w-full h-full bg-slate-500 opacity-25 z-10"></div>
            <div ref={menu} className="hidden min-w-52 bg-white min-h-28 fixed top-20 right-2 rounded-md shadow-2xl z-20">
                <ul className="poppins text-base py-2 px-4" onClick={() => handelMenuVisibility()}>
                    <li className="py-2">
                        <a href="/#why-leadstor">Why Leadstor?</a>
                    </li>
                    <li className="py-2">
                        <a href="/#pricing">Pricing</a>
                    </li>
                    <li className="py-2">
                        <a href="/#customer">Customers</a>
                    </li>
                    <li className="py-2">
                        <a href="/about">Out Story</a>
                    </li>
                    <li className="py-2">
                        <a href="/contact">Contact Us</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}