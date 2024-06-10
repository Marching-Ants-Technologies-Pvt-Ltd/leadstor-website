import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InfoCard from "@/components/InfoCard";
import Footer from "@/components/Footer";
import Slideshow from "@/components/Slideshow";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />

      <main className="container mx-auto px-4 max-w-screen-xl">
        <div className="py-14 cursor-default">
          <h2 className="text-center text-3xl font-bold color-[#0b1320] mb-3">Lead Management has never been so easy!</h2>
          <p className="text-center color-[#3b3f47] text-base">Engage your leads from click to close with Leadstore, your go-to lead management software</p>
          <div className="my-16 grid grid-cols-3 gap-10">

            <InfoCard
              icon={"/icons/lead-generation.png"}
              label={"Lead generation"}
              description={"Discover your website visitors and design strategies for lead generation with forms, website, and chat."}
            />

            <InfoCard
              icon={"/icons/contacts.png"}
              label={"360-degree view of contacts"}
              description={"Sales teams can gain a visual, real-time view of your lead’s journey through various lifecycle stages with Leadstore."}
            />

            <InfoCard
              icon={"/icons/assignment.png"}
              label={"Auto-assignment"}
              description={"Save time and resources by auto-assigning leads to the right team member and territory to quicken your lead management process."}
            />

            <InfoCard
              icon={"/icons/enrichment.png"}
              label={"Auto-enrichment"}
              description={"Freddy AI enriches leads profiles with their publicly listed information, role, and company and saves the time taken to know them."}
            />
            
            <InfoCard
              icon={"/icons/scoring.png"}
              label={"Predictive scoring "}
              description={"Prioritize your contacts based on Predictive Contact Scoring brought to you by Freddy AI."}
            />
            
            <InfoCard
              icon={"/icons/nurturing.png"}
              label={"Lead nurturing"}
              description={"Nurture leads along the sales and marketing funnels with targeted campaigns and build deeper relationships."}
            />
          </div>
        </div>
      </main>

      <Slideshow />
      <Footer />

    </>
  );
}
