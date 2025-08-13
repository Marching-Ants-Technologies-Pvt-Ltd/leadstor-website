"use client";
import CountryCodes from './countryCodes.json';
import React, { use, useRef, useState } from 'react';

export default function PhoneCountryCode({
    onChange = null
}) {

    const dropDown = useRef(null);
    const codeList = useRef(null);
    const searchInput = useRef(null);
    const [country, setCountry] = useState('India (+91)');
    const [countryFlag, setCountryFlag] = useState('https://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg');

    const selectCountryCode = (e) => {
        if(e.target.role === 'search_input') return;
        chooseCode();

        if(e.target.role === 'menuitem'){
            let code = e.target.parentElement.getAttribute('data-code');
            let countryName = e.target.parentElement.getAttribute('data-country');
            let iso = e.target.parentElement.getAttribute('data-iso');
            setCountry(`${countryName} (+${code})`);
            setCountryFlag(`https://purecatamphetamine.github.io/country-flag-icons/3x2/${iso}.svg`);
            if(onChange !== null) onChange(code);
        }
    }

    const chooseCode = () => {
        if (dropDown.current.classList.value.includes('hidden')) {
            document.body.addEventListener('click', selectCountryCode);
            dropDown.current.classList.remove('hidden');
            dropDown.current.classList.add('flex');
            searchInput.current.value = '';
            populateItems('');
            return;
        }

        dropDown.current.classList.remove('flex');
        dropDown.current.classList.add('hidden');
        document.body.removeEventListener('click', selectCountryCode);

    }

    const populateItems = (search) => {
        let count = 0;
        codeList.current.innerHTML = '';
        CountryCodes.forEach(item => {

            if (count > 5) return;
            if (!item.country.toLowerCase().includes(search)) return;

            count++;

            let li = document.createElement('LI');
            li.setAttribute('data-code', item.code);
            li.setAttribute('data-country', item.country);
            li.setAttribute('data-iso', item.iso);
            li.innerHTML = `<button type="button" className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem"><img src='https://purecatamphetamine.github.io/country-flag-icons/3x2/${item.iso}.svg' alt='${item.country} - National Flag' className='h-3 mt-1 mr-2 pointer-events-none'/><span className="inline-flex items-center pointer-events-none">${item.country} (+${item.code})</span></button>`;
            codeList.current.appendChild(li);
        });
    }

    var searchInputTimeout;
    const searchCountry = (e) => {
        let searchText = e.target.value.toLowerCase();
        if(searchInputTimeout) clearTimeout(searchInputTimeout);
        searchInputTimeout = setTimeout(()=> {
            populateItems(searchText);
        },500); 
    }

    return (
        <>
            <button onClick={chooseCode} className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" type="button">
                <img src={countryFlag} alt='Country - National Flag' className='h-3 mt-0 mr-2'/>
                <span>{country}</span>
                <svg className="w-2.5 h-2.5 ms-3 mt-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokelinecaps="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>
            <div ref={dropDown} className="z-10 hidden absolute bottom-12 flex-col-reverse bg-white divide-y divide-gray-100 rounded-lg shadow w-52 dark:bg-gray-700">
                <div className='flex border-t border-gray-100'>
                    <div className='flex-none w-8'>
                        <div className='inline-flex items-center text-center w-8 justify-center h-full'>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666">
                                <path d="M765-144 526-383q-30 22-65.79 34.5-35.79 12.5-76.18 12.5Q284-336 214-406t-70-170q0-100 70-170t170-70q100 0 170 70t70 170.03q0 40.39-12.5 76.18Q599-464 577-434l239 239-51 51ZM384-408q70 0 119-49t49-119q0-70-49-119t-119-49q-70 0-119 49t-49 119q0 70 49 119t119 49Z" />
                            </svg>
                        </div>
                    </div>
                    <div className='grow'>
                        <input onKeyUp={searchCountry} type='text' placeholder='Search here...' className='dropdown-search' role='search_input' ref={searchInput} />
                    </div>
                </div>
                <ul ref={codeList} className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    <li>
                        <button type="button" className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                            <img src='https://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg' alt='India - National Flag' className='h-3 mt-1 mr-2'/>
                            <span className="inline-flex items-center">India (+91)</span>
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
};