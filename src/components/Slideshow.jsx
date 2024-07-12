export default function Slideshow() {
    return (
        <>
            <section id='why-leadstor' className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-screen-xl pt-16 pb-10 cursor-default">
                    <h3 className="text-center poppins text-xl sm:text-3xl font-semibold text-gray-700">Get a 360° view of your Leads from Click to Close</h3>
                    <div className="my-10 grid">
                        <div className='m-auto'>
                            <img src='/banners/360-workflow-diagram.png' alt='Leadstor 360 Workflow Diagram'></img>
                        </div>
                        <div className="h-6"></div>
                        <div className='m-auto'>
                            <div>
                                <a href="https://youtu.be/TC4tRkXqVec" target="_blank" 
                                    className="inline-flex items-center py-2 px-8 bg-red-50 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-red-500 hover:text-white rounded-md transition duration-300">
                                    <svg className="w-8 h-8 fill-current mr-2" viewBox="0 0 24 24">
                                        <path
                                            d="M21.9 5.9c-.2-.7-.7-1.2-1.4-1.4C18.3 4 12 4 12 4s-6.3 0-8.5.5c-.7.2-1.2.7-1.4 1.4C2 8.1 2 12 2 12s0 3.9.5 5.1c.2.7.7 1.2 1.4 1.4 2.2.5 8.5.5 8.5.5s6.3 0 8.5-.5c.7-.2 1.2-.7 1.4-1.4.5-1.2.5-5.1.5-5.1s0-3.9-.5-5.1zM9.5 15.5V8.5l6.5 3z" />
                                    </svg>
                                    <span>Watch complete explanation on Youtube</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}