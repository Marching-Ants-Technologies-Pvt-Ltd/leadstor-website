"use client";

import Image from 'next/image';
import React, { useRef } from 'react';
import * as z from 'zod';
import { toast } from 'react-toastify';

export default function ContactDetailsForm({ onSubmit, userData }) {

    const formRef = useRef(null);

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
            onSubmit(data, 2);

        } catch (error) {

            let errorMessage = error.message;
            if (!contactFormSchema.success) {
                errorMessage = JSON.parse(error.message)[0].message;
            }

            toast.error(errorMessage);
        }

    };

    const handelPreviousFormMove = () => {
        onSubmit({}, 0);
    }

    return (
        <div id='contact-form' className='w-full mt-14 hidden'>
            <div className='bg-white w-full flex flex-row mt-14 py-4 px-2 rounded-md text-base font-semibold text-gray-600 text-center'>
                <div onClick={handelPreviousFormMove} className='grow flex flex-row justify-center items-center cursor-pointer'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>1</div>
                    <div className='text-blue-700'>Business Details</div>
                </div>
                <div className='grow flex flex-row justify-center items-center'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>2</div>
                    <div className='text-blue-700'>Contact Person</div>
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
                            src="/banners/contact-person.jpg"
                            width={425}
                            height={425}
                            alt="Leadstor Hero banner"
                            priority
                        />
                    </div>
                    <div className='text-xl font-semibold text-gray-600'>Contact Details</div>
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
                        <div className='flex gap-6 mt-4'>
                            <div className='grow'>
                                <label>Email Id<span>*</span></label>
                                <input className='cursor-not-allowed' type='email' readOnly name='contact_email' value={userData.email} />
                            </div>
                            <div className='grow'>
                                <label>Contact No<span>*</span></label>
                                <input required type='number' name='contact_number' />
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label>Whatsapp No.</label>
                            <input type='number' name='contact_whatsapp' />
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