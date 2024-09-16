import Image from "next/image";
import Navbar from "@/components/Navbar";
import InfoCard from "@/components/InfoCard";
import Footer from "@/components/Footer";
import Slideshow from "@/components/Slideshow";
import Pricing from "@/components/Pricing";
import Customers from "@/components/Customers";
import Button from '@/components/elements/Button';

export default function Home() {
  return (
    <>
      <Navbar />

      <header className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 gap-10 py-10 lg:py-24 px-5 sm:px-10 xl:gap-20 xl:px-0 lg:grid-cols-2">
            <div className="m-auto">
              <h1 className="text-2xl sm:text-4xl hero-text-color font-bold text-gray-800 ">Choose Leadstor for intelligent lead management</h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600">Convert leads into customers faster with lead management system like Leadstor</p>
              <Button className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded text-sm px-5 py-2 text-center me-2 mt-8 uppercase" href='/signup '>Create A Free Account</Button>
              <p className="mt-4 text-gray-400 text-sm">Get full access to the product, no credit card required</p>
            </div>
            <div className='order-first lg:order-none'>
              <Image
                placeholder='empty'
                src="/banners/leadstor-hero-image.png"
                width={1000}
                height={604}
                alt="Leadstor Hero banner"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-screen-xl">
        
        <div className="py-14 cursor-default grid grid-cols-1 gap-10 lg:py-24 px-5 sm:px-10 xl:gap-20 xl:px-0 lg:grid-cols-2">
          <div className="flex-1">
            <h2 className="text-2xl xl:text-3xl sm:text-4xl font-bold text-gray-700 poppins">Lead Management has never been so easy!</h2>
            <p className="mt-2 xl:mt-6 text-base sm:text-lg text-gray-600">Engage your leads from click to close with Leadstor, your go-to lead management software</p>
            <Image
              className="rounded-xl mt-8"
              placeholder='empty'
              src="/banners/content-gallery-4.png"
              width={1000}
              height={604}
              alt="Leadstor banner 1"
              priority
            />
          </div>
          <div>
            <h3 className="text-lg xl:text-xl font-semibold text-gray-700 xl:mt-2">Lead Generation</h3>
            <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Discover and track your website visitors, and design effective strategies for lead generation using optimized forms, user-friendly website layouts, and interactive chat features. This ensures you capture high-quality leads right from the start.</p>

            <h3 className="text-lg xl:text-xl font-semibold text-gray-700 mt-4">360-Degree View of Contacts</h3>
            <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Equip your sales teams with a comprehensive, real-time view of each lead&apos;s journey through various lifecycle stages. With Leadstor, your team can monitor and engage leads more effectively, enhancing the sales process.</p>

            <h3 className="text-lg xl:text-xl font-semibold text-gray-700 mt-4">Auto-Assignment</h3>
            <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Streamline your lead management by automatically assigning leads to the appropriate team member and territory. This feature saves valuable time and resources, ensuring leads are managed promptly and efficiently.</p>

            <h3 className="text-lg xl:text-xl font-semibold text-gray-700 mt-4">Lead Nurturing</h3>
            <p className="font-normal text-gray-500 text-wrap text-sm xl:text-base mt-1.5 text-justify">Develop deeper relationships with your leads by nurturing them through targeted campaigns across the sales and marketing funnels. Leadstor enables you to create personalized experiences that guide leads through their journey, increasing the likelihood of conversion.</p>
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
