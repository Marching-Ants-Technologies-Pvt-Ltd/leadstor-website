"use client";

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// import React, { useEffect } from 'react';
// import { useSession, signOut } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import Loading from '@/components/elements/Loading';

import BusinessDetailsForm from '@/app/profile/partials/BusinessDetails';
import ContactDetailsForm from '@/app/profile/partials/ContactDetails';
import SubscriptionPlan from '@/app/profile/partials/SubscriptionPlan';

export default function Profile() {
    /*
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {

        if (status === 'unauthenticated') {
            router.push('/signin');
        }

    }, [status, router]);

    if (status === 'loading') return <Loading />;
    if (status === 'unauthenticated') return <div>Session expired taking you to signin page</div>;

    console.log(session);

    return (
        <div>
            <img src={session.user.image} alt='User Image' referrerPolicy="no-referrer"  />
            <h2>Hello, {session.user.name}</h2>
            <h2>You are logged in as {session.user.email}</h2>
            <button onClick={() => signOut()}>Sign out</button>
        </div>
    );*/

    const session = { user: { name: "Pushpa Pushpraj", email: "pushpraj@leadstor.in", image: "https://api.dicebear.com/5.x/initials/png?seed=Pu&radius=50&size=100" } };

    let currentFormIndex = 0;
    let forms = ['business', 'contact', 'subscription'];

    const loadingSection = (status) => {
        if(status){
            document.getElementById(`loading-section`).classList.remove('hidden');
            document.getElementById(`forms-section`).classList.add('hidden');
            return;
        }

        document.getElementById(`forms-section`).classList.remove('hidden');
        document.getElementById(`loading-section`).classList.add('hidden');
        
    }

    let payload = {};
    const pushDataOnPayload = (data, nextIndex) => {
        payload = { ...payload, ...data };
        if(nextIndex > 2) return loadingSection(true);
        currentFormIndex = nextIndex;
        console.log('PAYLOAD', payload);
        changeFormOnUI();
    }

    const changeFormOnUI = () => {

        forms.forEach(item => {
            let formEelm = document.getElementById(`${item}-form`);
            if (!formEelm) return;
            formEelm.classList.remove('block');
            formEelm.classList.add('hidden');
        });

        let formEelm = document.getElementById(`${forms[currentFormIndex]}-form`);
        if (!formEelm) return;
        formEelm.classList.remove('hidden');
        formEelm.classList.add('block');

    }

    return (
        <div>

            <Navbar user={session.user} />

            <main id='forms-section' className="container mx-auto px-4 max-w-screen-xl">
                <div className="pt-14 pb-8 cursor-default">
                    <h2 className="justify-center text-2xl flex sm:text-3xl font-semibold text-gray-700 mb-2">
                        <img className='relative mr-3' src='/icons/waving-hand-sign.svg' height={35} width={35} alt='Hello!' />
                        Welcome to Leadstor
                    </h2>
                    <p className="ml-8 text-center text-gray-400 text-sm sm:text-base">
                        Let&apos;s complete the 3 simple steps to get started!
                    </p>

                    <BusinessDetailsForm onSubmit={pushDataOnPayload} />
                    <ContactDetailsForm onSubmit={pushDataOnPayload} userData={session.user} />
                    <SubscriptionPlan onSubmit={pushDataOnPayload} />

                </div>
                <div className='text-xs text-gray-400 text-center px-20'>
                    By submitting this form, you agree to our Terms of Use and Privacy Policy. The information provided will be used internally to enhance our products and services, ensuring we deliver the best possible experience for our users. Your data will be handled with the utmost care and confidentiality.
                </div>
                <div className='text-sm text-gray-500 text-center px-10 py-14'>
                    You are signed in as {session.user.email}, <label className='font-semibold text-blue-500 cursor-pointer hover:underline'>Sign out</label>
                </div>
            </main>

            <div id='loading-section' className='container mx-auto px-4 max-w-screen-xl h-grab-all-view hidden'>
                <div className='flex justify-center items-center h-full flex-col'>
                    
                    <div className='h-1 min-w-[512px] bg-gray-200 rounded-lg'>
                        <div className='h-full w-[5%] bg-blue-400 rounded-lg progress-animation'></div>
                    </div>
                    <div className='text-base text-gray-500 font-normal mt-6'>
                        Account Setup in Progress. Please Await Confirmation.
                    </div>
                </div>
            </div>
            <Footer showSignupBanner={false} />
        </div>
    );

}

