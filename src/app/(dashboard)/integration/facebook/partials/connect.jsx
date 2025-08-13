import Image from 'next/image';

export default function ConnectFacebook({ fbConnectButton }) {
    return (
        <div className='mt-10 w-full flex justify-center items-center'>
            <div className='text-center poppins'>
                <div className='flex justify-center items-center mb-6'>
                    <div className=''>
                        <Image
                            className='rounded-md pointer-events-none'
                            placeholder='empty'
                            src='/icons/services/facebook.webp'
                            width={45}
                            height={45}
                            alt="WhatsApp Icon"
                            priority={false}
                        />
                    </div>
                    <div className='h-11 flex justify-center items-center mx-4'>
                        <i className="ri-arrow-left-right-fill text-xl"></i>
                    </div>
                    <div className=''>
                        <Image
                            className='rounded-md pointer-events-none'
                            placeholder='empty'
                            src='/icons/leadstor.png'
                            width={45}
                            height={45}
                            alt="WhatsApp Icon"
                            priority={false}
                        />
                    </div>
                </div>
                <h3 className='text-lg text-gray-800'>To get started, you need to connect Facebook account.</h3>
                <button className="btn btn-primary rounded-md text-base mt-8" onClick={fbConnectButton}>
                    <i className="ri-add-fill text-xl mr-1 -ml-2"></i>
                    Connect Facebook Account
                </button>

                <div className='divider my-8'></div>

                <div className='w-full h-60 bg-gray-100 rounded-md flex justify-center items-center'>
                    <div className='text-center'>
                        <i className="ri-youtube-fill text-5xl text-rose-600"></i>
                        <p className='text-sm mt-2 text-gray-600'>Coming Soon</p>
                    </div>
                </div>
                <p className='mt-4 text-gray-600'>Watch Video Guide On <span className='underline cursor-pointer hover:text-blue-500'>YouTube</span></p>
            </div>
        </div>
    );
}