import Image from 'next/image';

export default function Hero() {
    return (
        <>
            <section className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-screen-xl">
                    <div className="grid grid-cols-2 gap-20 py-20">
                        <div className="m-auto">
                            <h1 className="text-4xl hero-text-color font-bold text-[#0b1320]">Choose Leadstore for intelligent lead management</h1>
                            <p className="mt-4 text-lg text-gray-600">Convert leads into customers faster with lead management system like Leadstore</p>
                            <button className="mt-8 bg-[#4382df]/100 hover:bg-[#4382df]/90 text-white px-4 py-2 text-sm font-medium rounded uppercase">Create A Free Account</button>
                            <p className="mt-4 text-gray-400 text-sm">Get full access to the product, no credit card required</p>
                        </div>
                        <div>
                            <Image
                                placeholder = 'empty'
                                src="/banners/hero.png"
                                width={600}
                                height={500}
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