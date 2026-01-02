"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';

import Loading from '@/components/elements/Loading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import BusinessDetailsForm from './partials/BusinessDetails';
import ContactDetailsForm from './partials/ContactDetails';
import SubscriptionPlan from './partials/SubscriptionPlan';
import Welcome from './partials/Welcome';
import EmailVerification from './partials/EmailVerification';

export default function Profile() {
    
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loadingText, setLoadingText] = useState('Checking Onboarding Status. Please Await Confirmation.');
    
    const getNextPage = useCallback(async () => {

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const sessionToken = session?.user?.cn_token??'';
        if(sessionToken.length < 3) {
            console.log('Taking you to signin page');
            signOut();
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({ api_token: session.user.cn_token }),
            redirect: "follow"
        };
        myHeaders.append("Authorization", "Bearer " + sessionToken );
        const conceptninjaHeaderOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        try {

            const response = await fetch(`/api/conceptninjas/next-page`, requestOptions);
            const result = await response.json();

            if (result.error) {
                toast.error(result.error);
                setLoadingText(result.error);
                return;
            }

            if (result.page === 'SIGNIN') {
                console.log('Taking you to signin page');
                signOut();
                return;
            }

            if (result.page === 'VALIDATE_EMAIL') {

                document.getElementById(`onboarding-section`).classList.add('hidden');
                document.getElementById(`email-validation-section`).classList.add('flex');
                document.getElementById(`email-validation-section`).classList.remove('hidden');

            }

            if (result.page === 'LEAD') {
                localStorage.setItem('ninja_lead_link', result.page_url);
                localStorage.setItem('access_token', sessionToken);

                const coporrateInfo = await fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/profile/corporate`,conceptninjaHeaderOptions);

                const data = await coporrateInfo.json();
                data['user']['image'] = session.user.image;
                data['user']['name'] = session.user.name;
                data['user']['email'] = session.user.email;
                data['session'] = {
                    "provider": session.user.auth_provider,
                    "uuid": session.user.uuid,
                };
                localStorage.setItem('CurrentSessionData', JSON.stringify(data));

                setLoadingText('Taking You to Lead Management Page, Please Wait...');
                router.push('/leads');
            }

            if (result.page === 'DASHBOARD-OLD') {
                setLoadingText('Taking You to Lead Dashboard, Please Wait...');
                
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = result.page_url;

                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'token';
                tokenInput.value = session.user.cn_token;
                form.appendChild(tokenInput);

                document.body.appendChild(form);

                form.submit();
                return;
            }

            loadingSection(false);

        } catch (error) {
            toast.error('Unable to make api request! Try again later');
        }

    }, [session]);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/signin');
        if (status === 'authenticated') getNextPage();
    }, [status, router, getNextPage]);

    if (status === 'loading') {
        console.log('Checking session...');
        return <Loading />;
    }

    if (status === 'unauthenticated') {
        console.log('Session expired taking you to signin page');
        return <Loading />;
    }

    if (status === 'authenticated') {
        if (session.user?.name) localStorage.setItem('session_user', JSON.stringify(session.user));
        if (!session.user?.name) session.user = JSON.parse(localStorage.getItem('session_user'));
    }
    
    const reSendVerificationEmail = async () => {
        setLoadingText('Sending Verification Link on Your Email. Please Await Confirmation.');
        loadingSection(true);

        const payload = {};
        payload.api_token = session.user.cn_token;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(payload),
            redirect: "follow"
        };

        const response = await fetch(`/api/conceptninjas/resend-verification-link`, requestOptions);
        const result = await response.json();

        loadingSection();

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success('Verification link sent!');
    }

    let currentFormIndex = 0;
    let forms = ['contact', 'business', 'subscription'];

    const loadingSection = (status) => {

        if (status) {
            document.getElementById(`loading-section`).classList.remove('hidden');
            document.getElementById(`forms-section`).classList.add('hidden');
            return;
        }

        document.getElementById(`forms-section`).classList.remove('hidden');
        document.getElementById(`loading-section`).classList.add('hidden');

    }

    let payload = {};
    const pushDataOnPayload = async (data, nextIndex) => {
        payload = { ...payload, ...data };

        if (nextIndex < 3) {
            currentFormIndex = nextIndex;
            return changeFormOnUI();
        }

        //Push data on server
        setLoadingText('Account Setup in Progress. Please Await Confirmation.');
        loadingSection(true);
        payload.api_token = session.user.cn_token;

        try {

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(payload),
                redirect: "follow"
            };

            const response = await fetch(`/api/conceptninjas/save-details`, requestOptions);
            const result = await response.json();

            if (result.error) {
                toast.error(result.error);
                currentFormIndex = 0;
                changeFormOnUI();
                return loadingSection();
            }

            setLoadingText('Re-Checking Onboarding Status. Please Await Confirmation.');
            getNextPage();


        } catch (error) {
            toast.error('Unable to process your request! Try again later');
        }

    }

    const changeFormOnUI = () => {

        forms.forEach(item => {
            let formElement = document.getElementById(`${item}-form`);
            if (!formElement) return;
            formElement.classList.remove('block');
            formElement.classList.add('hidden');
        });

        let formElement = document.getElementById(`${forms[currentFormIndex]}-form`);
        if (!formElement) return;
        formElement.classList.remove('hidden');
        formElement.classList.add('block');

    }

    return (
        <div>

            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={true}
                theme="light"
                transition={Bounce}
            />

            <Navbar user={session.user} />

            <main id='forms-section' className="hidden container mx-auto px-4 max-w-screen-xl">

                <div className="pt-14 cursor-default" id='onboarding-section'>
                    <Welcome userData={session.user} />
                    <BusinessDetailsForm onSubmit={pushDataOnPayload} userData={session.user} />
                    <ContactDetailsForm onSubmit={pushDataOnPayload} userData={session.user} />
                    <SubscriptionPlan onSubmit={pushDataOnPayload} />

                    <div className='text-xs pt-8 text-gray-400 text-center px-20'>
                        By submitting this form, you agree to our Terms of Use and Privacy Policy. The information provided will be used internally to enhance our products and services, ensuring we deliver the best possible experience for our users. Your data will be handled with the utmost care and confidentiality.
                    </div>
                    <div className='text-sm text-gray-500 text-center px-10 py-14'>
                        You are signed in as {session.user.email}, <label className='font-semibold text-rose-500 cursor-pointer hover:underline' onClick={() => signOut()}>Sign out</label>
                    </div>
                </div>

                <div className="pt-24 cursor-default hidden h-grab-all-view justify-center align-middle" id='email-validation-section'>
                    <EmailVerification userData={session.user} onGetLink={reSendVerificationEmail} />
                </div>
            </main >

            <div id='loading-section' className='container mx-auto px-4 max-w-screen-xl h-grab-all-view'>
                <div className='flex justify-center items-center h-full flex-col'>

                    <div className='h-1 min-w-[512px] bg-gray-200 rounded-lg'>
                        <div className='h-full w-[5%] bg-blue-400 rounded-lg progress-animation'></div>
                    </div>
                    <div className='text-base text-gray-500 font-normal mt-6' onClick={() => signOut()}>
                        {loadingText}
                    </div>
                </div>
            </div>
            <Footer showSignupBanner={false} />
        </div >
    );

}

