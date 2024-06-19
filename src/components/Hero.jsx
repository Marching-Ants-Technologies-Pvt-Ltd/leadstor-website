import Image from 'next/image';
import Button from '@/components/elements/Button';

export default function Hero() {
    return (
        <>
            <section className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-screen-xl">
                    <div className="grid grid-cols-2 gap-20 py-20">
                        <div className="m-auto">
                            <h1 className="text-4xl hero-text-color font-bold text-[#0b1320]">Choose Leadstore for intelligent lead management</h1>
                            <p className="mt-4 text-lg text-gray-600">Convert leads into customers faster with lead management system like Leadstore</p>
                            <Button className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded text-sm px-5 py-2 text-center me-2 mt-8 uppercase" href='/signup'>Create A Free Account</Button>
                            <p className="mt-4 text-gray-400 text-sm">Get full access to the product, no credit card required</p>
                        </div>
                        <div>
                            <Image
                                placeholder = 'empty'
                                src="/banners/leadstore-hero-image.png"
                                width={1000}
                                height={604}
                                alt="Leadstore Hero banner"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}