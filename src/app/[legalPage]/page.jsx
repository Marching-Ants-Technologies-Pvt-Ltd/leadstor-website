import { remark } from 'remark';
import html from 'remark-html';
import matter from 'gray-matter';
import fs from 'fs';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageNotFound from "@/components/PageNotFound";
import './remark-stylesheet.css';
import { metadata } from '../layout';

export default async function LegalPage({ params }) {

    const legalPageList = {
        "terms": {
            title: "Modernizing Cloud Business Software - Leadstor Terms",
            name: "Terms of Service"
        },
        "privacy-policy": {
            title: "Modernizing Cloud Business Software - Leadstor Privacy Policy",
            name: "Privacy Policy"
        },
        "refund-cancellation": {
            title: "Modernizing Cloud Business Software - Leadstor Refund Cancellation",
            name: "Refund Cancellation"
        },
    }

    if (!Object.keys(legalPageList).includes(params.legalPage)) return <PageNotFound />

    metadata.title = legalPageList[params.legalPage].title;

    const fileContents = fs.readFileSync(`./data/${params.legalPage}.md`, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);

    const contentHtml = processedContent.toString();

    return (
        <>
            <Navbar />

            <div className="bg-white header-bg">
                <div className="container mx-auto max-w-screen-xl py-32 text-center">
                    <h1 className="text-4xl md:text-5xl leading-10 font-bold text-gray-900">Leadstor {legalPageList[params.legalPage].name}</h1>
                </div>
            </div>

            <main className="container max-w-screen-xl mx-auto min-h-[50vh] px-4 py-16">
                <div className='rk' dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </main>

            <Footer showSignupBanner={false} />
        </>
    );
}