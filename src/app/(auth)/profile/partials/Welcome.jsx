"use client";
import Image from 'next/image';

export default function Welcome({ userData }) {
    
    return (
        <>
            <div className="flex gap-10 bg-white rounded-xl px-6 py-4">
                <div className="flex-none">
                    <Image
                        placeholder='empty'
                        src="/banners/hello-leadstor.png"
                        width={150}
                        height={150}
                        alt="Leadstor Banners"
                        priority
                    />
                </div>
                <div className="grow poppins items-center flex">
                    <div>
                        <h2 className="text-2xl flex sm:text-3xl font-semibold text-gray-700">Welcome to Leadstor</h2>
                        <p className='text-gray-500 font-normal mt-2'>We&apos;re excited to have you here. To get started, let&apos;s complete three simple steps. This will help you set everything up quickly and smoothly!</p>
                        <h3 className='flex mt-6 text-sm gap-1'>
                            <span className='bg-green-100 px-1 rounded-3xl '>
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill='#16a34a'>
                                    <path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z" />
                                </svg>
                            </span>
                            <span className='bg-blue-100 text-blue-600 px-2 rounded-3xl '>{userData.auth_provider}</span>
                            <span className='bg-gray-100 text-gray-600 px-2 rounded-3xl '>{userData.email}</span>
                        </h3>
                    </div>
                </div>
            </div>
        </>
    );
}