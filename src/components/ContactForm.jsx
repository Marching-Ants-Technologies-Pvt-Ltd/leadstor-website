"use client";

import { Bounce, Slide, ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';
import * as z from 'zod';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import React, { useRef } from 'react';

export default function ContactForm() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} scriptProps={{ async: true }}>
            <ContactFormContainer />
        </GoogleReCaptchaProvider>
    );
}

function ContactFormContainer() {

    // Validator
    const phoneRegex = /^\d{10,14}$/;
    const { executeRecaptcha } = useGoogleReCaptcha();
    const submitButton = useRef(null);

    const contactFormSchema = z.object({
        firstName: z
            .string()
            .min(3, 'First name is required'),
        email: z
            .string()
            .min(1, 'Email is required')
            .email('Invalid email format'),
        message: z
            .string()
            .min(3, 'Enter your query before you submit the form')
    });

    async function isValidJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    async function handelFormSubmit(event) {

        //On Button click & disable it till data get submitted
        event.preventDefault();

        try {
            // Check if already processing
            if (!submitButton.current.innerHTML.includes('Submit')) return;
            submitButton.current.innerHTML = `Processing....`;

            const contactForm = event.target;
            const formData = new FormData(contactForm);
            const inputs = Object.fromEntries(formData);
            await contactFormSchema.parse(inputs);

            // Check phone
            if (inputs.phone !== '' && !phoneRegex.test(inputs.phone)) return toast.error('Invalid phone number, kindly check and try again!');

            // Submit
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            if (!executeRecaptcha) {
                toast.error("Execute recaptcha not available yet! Likely meaning recaptcha key not configured correctly");
                submitButton.current.innerHTML = `Submit`;
                return;
            }

            inputs['token'] = await executeRecaptcha("contactSubmit");

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(inputs),
                redirect: "follow"
            };

            const response = await fetch(`/api/conceptninjas/lead-form`, requestOptions);
            const result = await response.json();
            submitButton.current.innerHTML = `Submit`;

            if (result.error) {
                toast.error(result.error);
                return;
            }

            contactForm.reset();
            toast.success("Thankyou! We'll contact you shortly");


        } catch (error) {

            if (!await isValidJsonString(error.message.toString())) return toast.error(error.message);

            const errorJson = JSON.parse(error.message.toString());
            let errorMessage = 'Unknown error occurred! Please try again!';

            if (!contactFormSchema.success) {
                errorMessage = errorJson[0].message;
            } else if (errorJson.error) {
                errorMessage = errorJson.error
            }

            toast.error(errorMessage);
            submitButton.current.innerHTML = `Submit`;

        }

    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={true}
                theme="light"
                transition={Bounce}
            />
            <form onSubmit={handelFormSubmit} className="lg:container h-full pl-0 lg:pl-16 py-4 contact-us-form">
                <div className="bg-white h-full rounded-2xl px-10 py-6">

                    <div className="flex gap-4">
                        <div className="grow">
                            <p className="font-semibold text-zinc-700 text-sm">First Name<span className="ml-1 text-rose-500">*</span></p>
                            <input type="text" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Tanish" name="firstName" />
                        </div>

                        <div className="mt-4 sm:mt-0 grow">
                            <p className="font-semibold text-zinc-700 text-sm">Last Name</p>
                            <input type="text" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Raj" name="lastName" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Business Email<span className="ml-1 text-rose-500">*</span></p>
                        <input type="email" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="name@company.com" name="email" />
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Phone Number</p>
                        <input type="number" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="+91 ..." name="phone" />
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Type of query</p>
                        <select className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Choose type of query" name="query">
                            <option value={"sales"}>&#x1F4E3;&nbsp;Sales</option>
                            <option value={"support"}>&#x1F9D1;&nbsp;Support</option>
                            <option value={"other"}>Other...</option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Your message<span className="ml-1 text-rose-500">*</span></p>
                        <textarea type="number" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2 resize-none" rows={4} placeholder="Enter your message" name="message"></textarea>
                    </div>

                    <button ref={submitButton} type='submit' className="rounded-md bg-black/100 w-full px-4 py-3 mt-10 font-semibold text-white hover:bg-black/80">Submit</button>

                    <p className="text-xs text-gray-500 text-center mt-4">By clicking Submit, I accept the Leadstor <a target="_blank" href="/terms" className="underline">Terms</a> &amp; <a href="/privacy-policy" target="_blank" className="underline">Privacy Notice</a>.</p>

                </div>
            </form>
        </>
    );
}

