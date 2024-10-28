import 'remixicon/fonts/remixicon.css';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import RaiseTicketFav from '@/components/dashboard/RaiseTicketFav';

export const metadata = {
    title: 'Dashboard - Leadstor'
}

export default function ClientLayout({ children }) {
    return (
        <div className="sticky flex h-screen flex-row overflow-y-auto rounded-lg sm:overflow-x-hidden">
            <Sidebar />
            
            <div className="flex w-full flex-col">
                <Navbar />
                <div className='p-6 h-full'>
                    {children}
                </div>
            </div>

            <RaiseTicketFav />
        </div>
    )
}