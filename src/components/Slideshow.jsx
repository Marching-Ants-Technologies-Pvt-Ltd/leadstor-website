import Image from 'next/image';
import Button from '@/components/elements/Button';

export default function Slideshow() {
    return (
        <>
            <section className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-screen-xl pt-16 pb-10 cursor-default">
                    <h3 className="text-center text-xl sm:text-3xl font-bold color-[#0b1320]">Get a 360° view of your Leads from Click to Close</h3>
                    <div className="mt-10 mb-6 grid">
                        <div className='m-auto'>
                            <img src='/banners/360-workflow-diagram.png' alt='Leadstor 360 Workflow Diagram'></img>
                        </div>
                        <div className='m-auto'>
                            <Button href="https://youtu.be/TC4tRkXqVec" target="_blank" className="mt-10 text-gray-100 bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded text-xs px-4 sm:px-12 py-1.5 sm:py-3 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Watch complete explanation on Youtube</Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}