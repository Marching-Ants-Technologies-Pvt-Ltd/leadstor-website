import { remark } from 'remark';
import html from 'remark-html';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageNotFound from "@/components/PageNotFound";
import './remark-stylesheet.css';

const legalPageList = {
    "terms": {
        title: "Modernizing Cloud Business Software - Leadstor Terms",
        name: "Terms of Service"
    },
    "privacy-policy": {
        title: "Modernizing Cloud Business Software - Leadstor Privacy Policy",
        name: "Privacy Policy"
    },
    "data-deletion-policy": {
        title: "Modernizing Cloud Business Software - Leadstor Privacy Policy",
        name: "Data Deletion Policy"
    },
    "refund-cancellation": {
        title: "Modernizing Cloud Business Software - Leadstor Refund Cancellation",
        name: "Refund Cancellation"
    },
}

export async function generateMetadata({ params }) {

    const pageList = legalPageList;

    return {
        title: pageList[`${params.legalPage}`]?.title ?? '404 - Page Not Found | Leadstor'
    }

}

export default async function LegalPage({ params }) {

    if (!Object.keys(legalPageList).includes(params.legalPage)) return <PageNotFound />

    let fileContents;
    let contentHtml;

    try {
        const filePath = path.join(process.cwd(), 'data', `${params.legalPage}.md`);
        fileContents = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading markdown file:', error.message);
        return <PageNotFound errorMessage={`Error reading markdown file: ${error.message}`} />;
    }

    const matterResult = matter(fileContents);

    try {
        const processedContent = await remark()
            .use(html)
            .process(matterResult.content);
        contentHtml = processedContent.toString();
    } catch (error) {
        console.error('Error processing markdown content:', error.message);
        return <PageNotFound errorMessage={`Error processing markdown content: ${error.message}`} />;
    }

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