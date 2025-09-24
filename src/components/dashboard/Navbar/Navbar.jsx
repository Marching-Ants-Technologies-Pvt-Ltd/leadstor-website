import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar({ data }) {

    const goToLegacyDashboard = () => {
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/leadstor/dashboard`;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token';
        tokenInput.value = localStorage.getItem('access_token') ?? '';

        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
        form.remove();
        return;
    }

    return (
        <div className="flex justify-end items-center sticky bg-white py-3 px-4 gap-16 z-10">
            <div className='flex gap-3'>
                <span className="tooltip tooltip-bottom" data-tooltip="Goto Conceptninjas Old Dashboard">
                    <div className='hover:bg-blue-50 hover:text-blue-600 hover:border-blue-50 text-gray-600 border bg-transparent cursor-pointer w-fit px-4 h-7 flex justify-center items-center rounded-full' onClick={goToLegacyDashboard}>
                        <i className="ri-computer-line pointer-events-none mr-0 lg:mr-2"></i>
                        <div className="hidden lg:block">Legacy Dashboard</div>
                    </div>
                </span>
                <span className="tooltip tooltip-bottom" data-tooltip="Contact Support">
                    <div className='hover:bg-blue-100 hover:text-blue-500 hover:border-blue-100 text-gray-700 border bg-transparent  cursor-pointer w-7 h-7 flex justify-center items-center rounded-full'>
                        <i className="ri-customer-service-2-fill pointer-events-none"></i>
                    </div>
                </span>
                <span className="tooltip tooltip-bottom" data-tooltip="Check Notification">
                    <div className='hover:bg-blue-100 hover:text-blue-500 hover:border-blue-100 text-gray-700 border bg-transparent  cursor-pointer w-7 h-7 flex justify-center items-center rounded-full'>
                        <i className="ri-notification-line pointer-events-none"></i>
                    </div>
                </span>
            </div>
            <div className='dropdown z-10 flex h-fit'>
                <label className='flex gap-2 poppins cursor-pointer' tabIndex="0">
                    <div className={`pr-2 pointer-events-none ${styles['hide-on-small']}`}>
                        <h3 className='m-0 text-base'>{data.user.name}</h3>
                        <p className='-mt-0.5 p-0 text-xs text-gray-500 text-right'>{data.user.role}</p>
                    </div>
                    <div className='flex justify-center items-center pointer-events-none'>
                        <Image
                            className='rounded-md'
                            placeholder='empty'
                            src={data.user.image}
                            width={36}
                            height={36}
                            alt="User Avatar"
                            priority={false}
                        />
                    </div>
                    <div className='flex justify-center items-center pointer-events-none'>
                        <i className="ri-arrow-down-s-fill text-xl"></i>
                    </div>
                </label>
                <div className="dropdown-menu poppins ml-2 mt-12 border max-w-40 bg-white">
                    <a className="text-gray-600 dropdown-item text-sm">Profile</a>
                    <a className="text-gray-600 dropdown-item text-sm" tabIndex="-1">My Tickets</a>
                    <div className='h-5 border-b w-full'></div>
                    <a className="text-rose-500 dropdown-item text-sm hover:bg-transparent hover:text-rose-600" tabIndex="-1" href="/signout" >SignOut</a>
                </div>
            </div>
        </div>
    )
}