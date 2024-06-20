
import Image from "next/image";

export default function Customers() {

    const banners = [
        "AsquareTechnologies.png",
        "CambridgeAcademyofEnglish.png",
        "CokonetAcademy.jpg",
        "EdwiseUpgradeInfotech.jpeg",
        "IIPCPune.png",
        "JehangirCentreforLearning.png",
        "LuminarTechnolab.jpg",
        "NewWingsITPune.png",
        "Protouch.jpeg",
        "TIFAJaipur.png"
    ];

    return (
        <>
            <section className="bg-white pt-12">
                <h3 className="mb-16 text-center text-xl px-3 sm:text-3xl font-semibold text-gray-800">Trusted by over 100+ organizations around the world</h3>

                <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                    <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
                        {banners.map((image, index) => (
                            <li key={index} className="h-[70px]">
                                <img
                                    alt={(image.split(".")[0])}
                                    loading="lazy"
                                    className="mix-blend-color h-full object-cover overflow-hidden"
                                    src={`/banners/customers/${image}`} />
                            </li>
                        ))}
                    </ul>
                    <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
                        {banners.map((image, index) => (
                            <li key={index} className="h-[70px]">
                                <img
                                    alt={(image.split(".")[0])}
                                    loading="lazy"
                                    className="mix-blend-color h-full object-cover overflow-hidden"
                                    src={`/banners/customers/${image}`} />
                            </li>
                        ))}
                    </ul>
                </div>

            </section>
        </>
    );
}