"use client";

import { Bounce, Slide, ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';

export default function ContactForm() {

    const FormURL = process.env.NEXT_PUBLIC_CONTACT_FORM_URL;
    console.log(FormURL);

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phoneNumber);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    async function resetFormInputs() {

        const inputs = document.querySelectorAll('div[data-contact-form="leadstor"] input');
        inputs[0].value = "";
        inputs[1].value = "";
        inputs[2].value = "";
        inputs[3].value = "";
        document.querySelector('div[data-contact-form="leadstor"] select').selectedIndex = 0;
        document.querySelector('div[data-contact-form="leadstor"] textarea').value = "";

    }

    async function handelFormSubmit(e) {

        //On Button click & disable it till data get submissted
        const target = e.target;

        //Compose Payload
        const inputs = document.querySelectorAll('div[data-contact-form="leadstor"] input');
        const payload = { source: "leadstor" };
        payload.name = (`${inputs[0].value} ${inputs[1].value}`).trim();
        payload.email = inputs[2].value.trim();
        payload.mobile = inputs[3].value.trim().substr(-10);
        payload.course = document.querySelector('div[data-contact-form="leadstor"] select').value.trim()
        payload.message = document.querySelector('div[data-contact-form="leadstor"] textarea').value.trim()

        //Validate Payload
        if (payload.name < 3) {
            toast.error("Please enter your name!");
            return;
        }

        if (!validateEmail(payload.email)) {
            toast.error("Enter a valid bussiness email!");
            return;
        }

        if (payload.mobile.length > 0 && !validatePhoneNumber(payload.mobile)) {
            toast.error("Enter a valid phone number!");
            return;
        }

        if (payload.message.length < 3) {
            toast.error("Please enter your message");
            return;
        }

        //Submit Data
        try {
            
            target.innerHTML = 'Processing...';
            target.setAttribute('disabled', '');

            const response = await fetch(FormURL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {

                toast.success("Thankyou! Request saved successfully");
                await resetFormInputs();

            } else {

                toast.error("Failed! Please try again");

            }

        } catch (error) {

            toast.error("Error during submission!");

        } finally {

            target.removeAttribute('disabled');
            target.innerHTML = 'Submit';

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
            <div className="lg:container h-full pl-0 lg:pl-16 py-4" data-contact-form="leadstor">
                <div className="bg-white h-full rounded-2xl px-10 py-6">

                    <div className="">
                        <p className="font-semibold text-zinc-700 text-sm">First Name<span className="ml-1 text-rose-500">*</span></p>
                        <input type="text" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Enter your first name" name="first-name" />
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Last Name</p>
                        <input type="text" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Enter your last name" name="last-name" />
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Busniess Email<span className="ml-1 text-rose-500">*</span></p>
                        <input type="email" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Enter your busniess email" name="business-email" />
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Phone Number</p>
                        <input type="number" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Enter your phone number" name="phone" />
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Type of query</p>
                        <select className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2" placeholder="Choose type of query" name="query">
                            <option value={"sales"}>Sales</option>
                            <option value={"support"}>Support</option>
                            <option value={"other"}>Other</option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold text-zinc-700 text-sm">Your message<span className="ml-1 text-rose-500">*</span></p>
                        <textarea type="number" className="mt-1 outline-0 rounded-md border border-zinc-300 w-full px-4 py-2 resize-none" rows={4} placeholder="Enter your message" name="message"></textarea>
                    </div>

                    <button onClick={handelFormSubmit} className="rounded-md bg-black/100 w-full px-4 py-3 mt-10 font-semibold text-white hover:bg-black/80">Submit</button>

                    <p className="text-xs text-gray-500 text-center mt-4">By clicking Submit, I accept the Leadstor <a target="_blank" href="/terms-of-use" className="underline">Terms</a> &amp; <a href="/privacy-policy" target="_blank" className="underline">Privacy Notice</a>.</p>

                </div>
            </div>
        </>
    );
}