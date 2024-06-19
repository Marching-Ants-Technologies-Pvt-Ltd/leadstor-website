"use client";

import Image from 'next/image';
import { Bounce, Slide, ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignUp() {

    function handelForgetPassword(){
        toast.error("Unavailable to process!");
    }

    return (
        <div>
            <ToastContainer
                position="top-left"
                autoClose={2000}
                hideProgressBar={true}
                theme="light"
                transition={Bounce}
            />
            <section className="bg-white">
                <div className="lg:grid lg:min-h-screen lg:grid-cols-12">

                    <aside className="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
                        <div className="absolute inset-0 h-full w-full object-cover bg-[url('/banners/modern.jpg')]">
                            <div className="bg-gradient-to-r from-white from-10% w-full h-full"></div>
                        </div>
                    </aside>

                    <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-24 lg:py-12 xl:col-span-6">

                        <div className="max-w-xl lg:max-w-3xl">
                            <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">SignIn</h1>
                            <p className="mt-6 text-sm leading-relaxed text-gray-500">Welcome back to Leadstore.</p>
                            <p className="mt-0 text-sm leading-relaxed text-gray-500">Continue tracking your progress after signing in to your account.</p>

                            <div className="mt-8 grid grid-cols-6 gap-6">
                                <div className="col-span-6">
                                    <label htmlFor="Email" className="block text-sm font-medium text-gray-700"> Email </label>

                                    <input
                                        type="email"
                                        id="Email"
                                        name="email"
                                        className="mt-1 border w-full rounded-md border-gray-200 bg-white text-base text-gray-700 shadow-sm px-4 py-2"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="Password" className="block text-sm font-medium text-gray-700"> Password </label>

                                    <input
                                        type="password"
                                        id="Password"
                                        name="password"
                                        className="mt-1 border w-full rounded-md border-gray-200 bg-white text-base text-gray-700 shadow-sm px-4 py-2"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="Password" className="block text-sm font-medium text-white">.</label>
                                    <div onClick={handelForgetPassword} className='inline-flex items-center px-4 py-3 font-semibold text-sm text-blue-600 cursor-pointer'>Forget password?</div>
                                </div>

                                <div className="col-span-6">
                                    <label htmlFor="RememberDevice" className="flex gap-4">
                                        <input
                                            type="checkbox"
                                            id="RememberDevice"
                                            name="marketing_accept"
                                            className="size-5 rounded-md border-gray-200 bg-white shadow-sm"
                                        />

                                        <span className="text-sm text-gray-700">
                                            Remember this device for 30 days
                                        </span>
                                    </label>
                                </div>

                                <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                                    <button
                                        className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                                    >
                                        Continue
                                    </button>

                                    <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                                        Don&#39;t have an account?
                                        <a href="/signup" className="text-gray-700 underline">Sign up</a>.
                                    </p>
                                </div>

                                <div className="col-span-6">
                                    <div className='flex mt-6'>

                                        <div className='flex-1 inline-flex items-center'>
                                            <div className='w-full h-[1px] bg-gray-400'></div>
                                        </div>

                                        <div className='flex-none w-[100px] font-semibold font-lg text-center text-gray-700'>Or</div>

                                        <div className='flex-1 inline-flex items-center'>
                                            <div className='w-full h-[1px] bg-gray-400'></div>
                                        </div>

                                    </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <div className='mt-1 border w-full rounded-md border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm grid cursor-pointer'>
                                        <div className='inline-flex items-center px-4 py-3 m-auto'>
                                            <Image
                                                placeholder='empty'
                                                src="/icons/google.svg"
                                                width={22}
                                                height={22}
                                                alt="Google Icon"
                                                priority={false}
                                            />
                                            <span className='ml-2'>Sign in with Google</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <div className='mt-1 border w-full rounded-md border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm grid cursor-pointer'>
                                        <div className='inline-flex items-center px-4 py-3 m-auto'>
                                            <Image
                                                placeholder='empty'
                                                src="/icons/facebook.svg"
                                                width={24}
                                                height={24}
                                                alt="Google Icon"
                                                priority={false}
                                            />
                                            <span className='ml-2'>Sign in with Facebook</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </main>
                </div>
            </section>
        </div>
    );
}