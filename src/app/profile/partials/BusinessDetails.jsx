"use client";

import Image from 'next/image';
import React, { useRef, useState } from 'react';
import * as z from 'zod';
import { toast } from 'react-toastify';

export default function BusinessDetailsForm({ onSubmit, userData }) {

    const formRef = useRef(null);
    const [businessEmail, setBusinessEmail] = useState(userData.email);

    const businessFormSchema = z.object({
        business_name: z
            .string()
            .min(3, 'Business name is required'),
        business_email: z
            .string()
            .min(1, 'Business Email is required')
            .email('Invalid business email!')
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

            await businessFormSchema.parse(data);
            onSubmit(data, 2);

        } catch (error) {

            let errorMessage = error.message;
            if (!businessFormSchema.success) {
                errorMessage = JSON.parse(error.message)[0].message;
            }

            toast.error(errorMessage);
        }

    };

    const handelPreviousFormMove = () => {
        onSubmit({}, 0);
    }
    const handleEmailChange = (e) => {
        setBusinessEmail(e.target.value);
    };

    return (
        <div id='business-form' className='w-full mt-14 hidden'>
            <div className='bg-white flex flex-row py-4 px-2 rounded-md text-base font-semibold text-gray-600 text-center'>
                <div onClick={handelPreviousFormMove} className='grow flex flex-row justify-center items-center cursor-pointer'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>1</div>
                    <div className='text-blue-700'>Contact Person</div>
                </div>
                <div className='grow flex flex-row justify-center items-center'>
                    <div className='h-6 w-6 flex justify-center items-center mr-2 rounded-2xl bg-blue-200 text-sm text-blue-700'>2</div>
                    <div className='text-blue-700'>Business Details</div>
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
                            src="/banners/business-section.png"
                            width={325}
                            height={325}
                            alt="Leadstor Banners"
                            priority
                        />
                    </div>
                    <div className='text-xl font-semibold text-gray-600'>Business Details</div>
                    <div className='mt-2 text-sm text-gray-400'>Let us know about your business</div>
                    <button type="button" onClick={handleButtonClick} className="py-2 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-blue-700 rounded-full border-2 border-blue-700 mt-8 hover:bg-blue-600 hover:border-blue-600">Save &amp; Continue</button>
                </div>
                <div className='grow'>
                    <form ref={formRef} onSubmit={handleSubmit} className='business-details-form'>
                        <div className=''>
                            <label>Business Name<span>*</span></label>
                            <input type='text' required name='business_name' />
                        </div>
                        <div className='mt-4'>
                            <label>Business Type<span>*</span></label>
                            <select required name='business_type' className='relative inline-block'>
                                <option value="">Choose your business type</option>
                                <option value="Institute">&#127891; Institute</option>
                                <option value="Agency">&#129333; Consultant/Agency</option>
                                <option value="Repair">&#129520; Repair/Services</option>
                                <option value="School">&#127979; School Coaching</option>
                                <option value="Digital">&#128227; Digital Marketing Business</option>
                                <option value="B2BLead">&#129309; B2B Lead Management</option>
                                <option value="Education">&#128210; Education Consultancy</option>
                            </select>
                        </div>
                        <div className='flex gap-6 mt-4'>
                            <div className='grow'>
                                <label>Email Id<span>*</span></label>
                                <input required type='email' onChange={handleEmailChange} value={businessEmail} name='business_email' />
                            </div>
                            <div className='grow hidden'>
                                <label>Phone No<span>*</span></label>
                                <input type='number' name='business_phone' />
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label>Business Website</label>
                            <input type='text' name='business_website' placeholder='https://' />
                        </div>

                        <div className='mt-4'>
                            <label>Business Address</label>
                            <textarea rows={4} name='business_address' placeholder='Example: 123 Main St, Apt 4B, Springfield, IL 62704'></textarea>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}