import Image from 'next/image';

export default function SignUp() {
    return (
        <div>
            <section className="bg-white">
                <div className="lg:grid lg:min-h-screen lg:grid-cols-12">

                    <aside className="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
                        <div className="absolute inset-0 h-full w-full object-cover bg-[url('/banners/modern.jpg')]">
                            <div className="bg-gradient-to-r from-white from-10% w-full h-full"></div>
                        </div>
                    </aside>

                    <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-24 lg:py-12 xl:col-span-6">
                        <div className="max-w-xl lg:max-w-3xl">

                            <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">SignUp</h1>
                            <p className="mt-6 text-sm leading-relaxed text-gray-500">Welcome to Leadstore. Unlock the potential of Leadstore with a free trial</p>
                            <p className="mt-0 text-sm leading-relaxed text-gray-500">receive 10 leads and 1 integration, all with no credit card required.</p>

                            <div className="mt-8 grid grid-cols-6 gap-6">

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700">
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        id="FirstName"
                                        name="first_name"
                                        className="mt-1 border w-full rounded-md border-gray-200 bg-white text-base text-gray-700 shadow-sm px-4 py-2"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="LastName" className="block text-sm font-medium text-gray-700">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        id="LastName"
                                        name="last_name"
                                        className="mt-1 border w-full rounded-md border-gray-200 bg-white text-base text-gray-700 shadow-sm px-4 py-2"
                                    />
                                </div>

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
                                    <label htmlFor="PasswordConfirmation" className="block text-sm font-medium text-gray-700">
                                        Password Confirmation
                                    </label>

                                    <input
                                        type="password"
                                        id="PasswordConfirmation"
                                        name="password_confirmation"
                                        className="mt-1 border w-full rounded-md border-gray-200 bg-white text-base text-gray-700 shadow-sm px-4 py-2"
                                    />
                                </div>

                                <div className="col-span-6">
                                    <label htmlFor="UserConcent" className="flex gap-4">
                                        <input
                                            type="checkbox"
                                            id="UserConcent"
                                            name="marketing_accept"
                                            className="size-5 rounded-md border-gray-200 bg-white shadow-sm"
                                        />

                                        <span className="text-sm text-gray-700">
                                            I want to receive emails about events, product updates and company announcements.
                                        </span>
                                    </label>
                                </div>

                                <div className="col-span-6">
                                    <p className="text-sm text-gray-500">
                                        By creating an account, you agree to our
                                        <a href="/terms-and-conditions" className="text-gray-700 underline"> terms </a>
                                        &amp;
                                        <a href="/privacy-policy" className="text-gray-700 underline">privacy policy</a>.
                                    </p>
                                </div>

                                <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                                    <button
                                        className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                                    >
                                        Create an account
                                    </button>

                                    <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                                        Already have an account?
                                        <a href="/signin" className="text-gray-700 underline">Sign in</a>.
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
                                            <span className='ml-2'>Sign up with Google</span>
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
                                            <span className='ml-2'>Sign up with Facebook</span>
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