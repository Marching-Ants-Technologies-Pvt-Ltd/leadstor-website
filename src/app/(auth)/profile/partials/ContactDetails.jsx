"use client";

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import * as z from 'zod';
import { toast } from 'react-toastify';
import PhoneCountryCode from '@/components/elements/PhoneCountryCodeInput';

export default function ContactDetailsForm({ onSubmit, userData }) {

    const formRef = useRef(null);
    const waNumber = useRef(null);
    const contactNumber = useRef(null);
    const waNumberInput = useRef(null);

    const [commonNumber, setCommonNumber] = useState(true);
    const [contactCountryCode, setContactCountryCode ] = useState('91');
    const [waCountryCode, setWaCountryCode ] = useState('91');

    const contactFormSchema = z.object({
        contact_name: z
            .string()
            .min(3, 'Business name is required'),
        contact_email: z
            .string()
            .min(1, 'Business Email is required')
            .email('Invalid email format'),
        contact_number: z
            .string()
            .min(10, 'Enter a valid 10 digit phone number')
            .max(14, 'Given phone no is not valid')
    })

    const handleButtonClick = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());

        try {

            await contactFormSchema.parse(data);
            data.contact_number = `${contactCountryCode}${data.contact_number}`;
            data.contact_whatsapp = `${((commonNumber)?contactCountryCode:waCountryCode)}${data.contact_whatsapp}`;
            onSubmit(data, 1);

        } catch (error) {

            let errorMessage = error.message;
            if (!contactFormSchema.success) {
                errorMessage = JSON.parse(error.message)[0].message;
            }

            toast.error(errorMessage);
        }

    };

    const controlWhatsAppNumberInput = (e) => {
        waNumber.current.className = (!e.target.checked ? '' : 'hidden');
        waNumberInput.current.value = (!e.target.checked ? '' : contactNumber.current.value);
        setCommonNumber(e.target.checked);
    }

    const onContactNumInput = (e) => {
        if (!commonNumber) return;
        waNumberInput.current.value = e.target.value;
    }

    return (
        <div id='contact-form' className='w-full mt-14'>
            <div className='bg-white w-full flex flex-row mt-14 py-4 px-2 rounded-md text-base font-semibold text-gray-600 text-center'>
                <div className='grow flex flex-row justify-center items-center cursor-pointer'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>1</div>
                    <div className='text-blue-700'>Contact Person</div>
                </div>
                <div className='grow flex flex-row justify-center items-center'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-gray-200 text-sm'>2</div>
                    <div>Business Details</div>
                </div>
                <div className='grow flex flex-row justify-center items-center cursor-not-allowed'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-gray-200 text-sm'>3</div>
                    <div>Subscription</div>
                </div>
            </div>
            <div className='bg-white w-full flex flex-row-reverse mt-2 py-4 px-2 rounded-md'>
                <div className='text-center px-4 py-6 min-w-[548px]'>
                    <div className='flex justify-center items-center'>
                        <Image
                            placeholder='empty'
                            src="/banners/contact-section.png"
                            width={325}
                            height={325}
                            alt="Leadstor Hero banner"
                            priority
                        />
                    </div>
                    <div className='text-xl font-semibold text-gray-600 mt-8'>Contact Details</div>
                    <div className='mt-2 text-sm text-gray-400 flex justify-center items-center'>
                        <div className='max-w-[375px]'>Please share your HR or Manager contact details so we can reach out if needed.</div>
                    </div>
                    <button type="button" onClick={handleButtonClick} className="py-2 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-blue-700 rounded-full border-2 border-blue-700 mt-8 hover:bg-blue-600 hover:border-blue-600">Save &amp; Continue</button>

                </div>
                <div className='grow justify-center'>
                    <form ref={formRef} onSubmit={handleSubmit} className='business-details-form'>
                        <div className=''>
                            <label>Full Name<span>*</span></label>
                            <input className='cursor-not-allowed' type='text' readOnly name='contact_name' value={userData.name} />
                        </div>
                        <div className='mt-4'>
                            <label>Role/Designation<span>*</span></label>
                            <select defaultValue={'HR'} required name='contact_type' className='relative inline-block'>
                                <option value="Owner">&#129332; Owner</option>
                                <option value="Manager">&#129333; Manager</option>
                                <option value="HR">&#128590; Human Resources Manager (HR)</option>
                            </select>
                        </div>
                        <div className='mt-4'>
                            <label>Email Id<span>*</span></label>
                            <input className='cursor-not-allowed' type='email' readOnly name='contact_email' value={userData.email} />
                        </div>
                        <div className='mt-4'>
                            <label>Contact No<span>*</span></label>
                            <div className='flex gap-2'>
                                <div className='flex-none relative'>
                                    <PhoneCountryCode onChange={setContactCountryCode} />
                                </div>
                                <div className='grow'>
                                    <input onKeyUp={onContactNumInput} ref={contactNumber} required type='number' name='contact_number' />
                                </div>
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label>Whatsapp No.</label>
                            <div className="flex items-center mb-4 gap-2">
                                <div className="flex-none w-4">
                                    <input onChange={controlWhatsAppNumberInput} defaultChecked={commonNumber} type="checkbox" className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div className='grow content-center'>
                                    <div className="text-sm font-normal text-gray-500 dark:text-gray-300">It is same as contact number.</div>
                                </div>
                            </div>
                            <div ref={waNumber} className='hidden'>
                                <div className='flex gap-2'>
                                    <div className='flex-none relative'>
                                        <PhoneCountryCode onChange={setWaCountryCode} />
                                    </div>
                                    <div className='grow'>
                                        <input ref={waNumberInput} type='number' name='contact_whatsapp' />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className='mt-4'>
                            <label>Linked In Profile</label>
                            <input type='text' name='contact_linkedin' />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}