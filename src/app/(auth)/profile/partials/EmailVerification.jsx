"use client";
import Image from 'next/image';

export default function EmailVerification({userData, onGetLink}) {

    return (
        <>
            <div className='w-3/4'>
                <div className='flex justify-center align-middle'>
                    <Image
                        placeholder='empty'
                        src="/banners/verification-email.png"
                        width={375}
                        height={375}
                        alt="Leadstor Banners"
                        priority
                    />
                </div>

                <h2 className="mt-8 justify-center text-2xl flex sm:text-3xl font-bold text-gray-700 mb-4 poppins">Check your inbox, please!</h2>
                <p className="poppins ml-8 text-center text-gray-500 text-sm">Hey {userData.name.toLowerCase().split(' ')[0]}! to start using Leadstor, we need to verify your email. we&apos;ve already sent out the verification link on <span className='text-blue-500'>{userData.email}</span> Please check your inbox and confirm it&apos;s really you.</p>

                <div className='flex justify-center mt-14'>
                    <div className='bg-white rounded-lg poppins text-sm text-gray-600 px-8 py-3'>
                        Didn&apos;t received verification mail? <span className='text-blue-600 cursor-pointer hover:underline hover:text-blue-400' onClick={onGetLink}>Click here</span> to resend it.
                    </div>
                </div>

            </div>
        </>
    );
}