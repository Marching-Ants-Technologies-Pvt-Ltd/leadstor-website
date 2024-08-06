import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InfoCard from "@/components/InfoCard";
import Footer from "@/components/Footer";
import Slideshow from "@/components/Slideshow";
import Pricing from "@/components/Pricing";
import Customers from "@/components/Customers";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />

      <main className="container mx-auto px-4 max-w-screen-xl">
        <div className="py-14 cursor-default">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-700 poppins mb-2">Lead Management has never been so easy!</h2>
          <p className="text-center poppins text-gray-500 text-sm sm:text-base">Engage your leads from click to close with Leadstor, your go-to lead management software</p>

          <div className="flex flex-col-reverse gap-2 xl:gap-10 mt-4 xl:mt-16 poppins xl:flex-row-reverse">
            <div className="flex-grow">
              <h3 className="text-lg xl:text-xl font-semibold text-gray-700 xl:mt-2">Lead Generation</h3>
              <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Discover and track your website visitors, and design effective strategies for lead generation using optimized forms, user-friendly website layouts, and interactive chat features. This ensures you capture high-quality leads right from the start.</p>

              <h3 className="text-lg xl:text-xl font-semibold text-gray-700 mt-6">360-Degree View of Contacts</h3>
              <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Equip your sales teams with a comprehensive, real-time view of each lead&apos;s journey through various lifecycle stages. With Leadstor, your team can monitor and engage leads more effectively, enhancing the sales process.</p>

              <h3 className="text-lg xl:text-xl font-semibold text-gray-700 mt-6">Auto-Assignment</h3>
              <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Streamline your lead management by automatically assigning leads to the appropriate team member and territory. This feature saves valuable time and resources, ensuring leads are managed promptly and efficiently.</p>

              <h3 className="text-lg xl:text-xl font-semibold text-gray-700 mt-6">Lead Nurturing</h3>
              <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Develop deeper relationships with your leads by nurturing them through targeted campaigns across the sales and marketing funnels. Leadstor enables you to create personalized experiences that guide leads through their journey, increasing the likelihood of conversion.</p>
            </div>
            <div className="flex-none">
              <Image
                className="rounded-xl xl:max-w-[526px] w-full"
                placeholder='empty'
                src="/banners/content-gallery-1.png"
                width={526}
                height={200}
                alt="Leadstor Hero banner"
                priority
              />
              <div className="flex flex-row-reverse my-1 gap-1">
                <div className="flex-grow">
                  <Image
                    className="rounded-xl hidden xl:block"
                    placeholder='empty'
                    src="/banners/content-gallery-2.png"
                    width={260}
                    height={200}
                    alt="Leadstor Hero banner"
                    priority
                  />
                </div>
                <div className="flex-grow">
                  <Image
                    className="rounded-xl hidden xl:block"
                    placeholder='empty'
                    src="/banners/content-gallery-3.png"
                    width={260}
                    height={200}
                    alt="Leadstor Hero banner"
                    priority
                  />
                </div>
              </div>
              <Image
                className="rounded-xl hidden xl:block"
                placeholder='empty'
                src="/banners/content-gallery-4.png"
                width={526}
                height={200}
                alt="Leadstor Hero banner"
                priority
              />
            </div>
          </div>

        </div>
      </main>

      <Slideshow />
      <Pricing />
      <Customers />
      <Footer />

    </>
  );
}
