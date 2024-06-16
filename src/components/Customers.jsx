import Image from "next/image";

export default function Customers() {
    return (
        <>
            <section className="bg-white">
                <div className="container mx-auto px-4 max-w-screen-xl py-10 text-center">
                    <h3 className="text-center text-3xl font-semibold color-[#0b1320]">Trusted by over 100+ organizations around the world</h3>
                    <div className="flex mt-14">
                        <div className="m-4">
                            <Image
                                placeholder = 'empty'
                                src="/banners/customers/quinbay.png"
                                width={130}
                                height={85}
                                alt="Quinbay"
                                style={{filter: 'grayscale(1)'}}
                                priority
                            />
                        </div>
                        <div className="m-4">
                            <Image
                                placeholder = 'empty'
                                src="/banners/customers/catking.png"
                                width={150}
                                height={100}
                                alt="CAT King"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}