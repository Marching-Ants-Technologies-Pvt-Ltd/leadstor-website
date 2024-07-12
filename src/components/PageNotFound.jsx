import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function PageNotFound({
    errorMessage = ''
}) {
    return (
        <div>
            <Navbar />
            <main className="container mx-auto h-grab-all-view px-4 max-w-screen-xl py-20">
                <div className='flex justify-center align-middle w-full'>
                    <Image
                        src='./banners/404-computer.svg'
                        alt='Leadstor - Page 404 | Banner'
                        width={462}
                        height={432}
                        priority
                    />
                </div>
                <p className='text-center mt-10 text-3xl text-gray-700 font-bold poppins'>Whoops! That page doesn&apos;t exist.</p>
                <p className="text-center mt-2 text-base text-gray-700 font-normal poppins">Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on the home page.</p>
                <textarea id='pageError' className='hidden' value={errorMessage} readOnly></textarea>
            </main>
            <Footer showSignupBanner={false} />
        </div>
    );
}