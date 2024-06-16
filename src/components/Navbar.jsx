export default function Navbar() {
    return (
        
        <nav className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="/icons/leadstore.png" className="h-8" alt="Flowbite Logo" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Leadstore</span>
                </a>
                <button data-collapse-toggle="navbar-solid-bg" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-solid-bg" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <img src="/icons/burger-menu.svg" />
                </button>
                <div className="hidden w-full md:block md:w-auto">
                    <ul className="navbar">
                        <li>
                            <a href="#" className="navbar-item" aria-current="page">Why Leadstore</a>
                        </li>
                        <li>
                            <a href="/" className="navbar-item">Pricing</a>
                        </li>
                        <li>
                            <a href="#" className="navbar-item">Customers</a>
                        </li>
                        <li>
                            <a href="/about" className="navbar-item">About</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

    );
}