"use client";

import Image from 'next/image';
import React, { useRef, useState } from 'react';

export default function SubscriptionPlan({ onSubmit }) {

    const formRef = useRef(null);

    const handleButtonClick = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({subscription: plan}, 3);

    };

    const handelPreviousFormMove = (index) => {
        onSubmit({}, index);
    }

    const [plan, setPlan] = useState('');

    const updateMySubscriptionChoice = (e, p) => {

        ['basic-subscription', 'pro-subscription', 'super-subscription'].forEach(item => {

            let elm = document.getElementById(item);
            if (!elm) return;
            elm.setAttribute('class', 'p-4 mt-2 border border-gray-200 rounded-lg dark:border-gray-700 cursor-pointer hover:bg-blue-50 hover:border-blue-500');

        });

        e.target.setAttribute('class', 'p-4 mt-2 border rounded-lg dark:border-gray-700 cursor-pointer bg-green-50 border-green-500');

        setPlan(p);
    }


    return (
        <div id='subscription-form' className='w-full mt-14 hidden'>
            <div className='bg-white w-full flex flex-row py-4 px-2 rounded-md text-base font-semibold text-gray-600 text-center'>
                <div onClick={() => handelPreviousFormMove(0)} className='grow flex flex-row justify-center items-center cursor-pointer'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>1</div>
                    <div className='text-blue-700'>Business Details</div>
                </div>
                <div onClick={() => handelPreviousFormMove(1)} className='grow flex flex-row justify-center items-center cursor-pointer'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>2</div>
                    <div className='text-blue-700'>Contact Person</div>
                </div>
                <div className='grow flex flex-row justify-center items-center'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>3</div>
                    <div className='text-blue-700'>Subscription</div>
                </div>
            </div>
            <div className='bg-white w-full flex flex-row-reverse mt-2 py-4 px-2 rounded-md'>
                <div className='text-center px-4 py-6 min-w-[548px]'>
                    <div className='flex justify-center items-center'>
                        <Image
                            placeholder='empty'
                            src="/banners/subscription-plan.jpg"
                            width={315}
                            height={315}
                            alt="Leadstor Hero banner"
                            priority
                        />
                    </div>
                    <div className='text-xl font-semibold text-gray-600'>Your Subscription</div>
                    <div className='mt-2 text-sm text-gray-400'>Choose a plan which suites your need</div>
                    <button type="button" onClick={handleButtonClick} className="py-2 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-blue-700 rounded-full border-2 border-blue-700 mt-8 hover:bg-blue-600 hover:border-blue-600">Start Using Leadstor</button>
                </div>
                <div className='grow'>
                    <form ref={formRef} onSubmit={handleSubmit} className='business-details-form'>

                        <div onClick={(e) => updateMySubscriptionChoice(e,'BASIC')} id='basic-subscription' className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 cursor-pointer hover:bg-blue-50 hover:border-blue-500">
                            <div className="ms-2 pointer-events-none">
                                <div className="text-lg font-medium text-gray-700">Basic Plan</div>
                                <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-300">&#x20b9;3,500/Month, Billed Monthly.</p>
                            </div>
                        </div>

                        <div onClick={(e) => updateMySubscriptionChoice(e,'PRO')} id='pro-subscription' className="p-4 mt-2 border border-gray-200 rounded-lg dark:border-gray-700 cursor-pointer hover:bg-blue-50 hover:border-blue-500">
                            <div className="ms-2 pointer-events-none">
                                <div className="text-lg font-medium text-gray-700">Pro Plan<span className="ml-2 font-semibold text-xs bg-blue-200 text-blue-800 py-1 px-2 uppercase rounded relative bottom-0.5">Popular</span></div>
                                <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-300">&#x20b9;6,000/Month, Billed Monthly.</p>
                            </div>
                        </div>

                        <div onClick={(e) => updateMySubscriptionChoice(e,'SUPER')} id='super-subscription' className="p-4 mt-2 border rounded-lg dark:border-gray-700 cursor-pointer hover:bg-blue-50 hover:border-blue-500">
                            <div className="ms-2 pointer-events-none">
                                <div className="text-lg font-medium text-gray-700">Super Plan</div>
                                <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-300">&#x20b9;12,000/Month, Billed Monthly.</p>
                            </div>
                        </div>

                        <p className='mt-6 text-sm px-1 text-gray-500'>Our plans include complimentary Sales Communication Integrations and come with no user login restrictions. Discover more about our pricing plans and benefits by <a className='underline text-blue-500' href='/#plans' target='_blank'>clicking here</a>.</p>

                    </form>
                </div>
            </div>
        </div>
    );
}