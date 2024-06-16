export default function Slideshow() {
    return (
        <>
            <section className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-screen-xl pt-16 pb-10 cursor-default">
                    <h3 className="text-center text-3xl font-bold color-[#0b1320]">Get a 360° view of your Leads from Click to Close</h3>
                    <div className="mt-10 mb-6 grid">
                        <div className="aspect-video w-3/5 m-auto">
                            <iframe
                                className="w-full h-full rounded-lg"
                                src="https://www.youtube.com/embed/TC4tRkXqVec"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen>
                            </iframe>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}