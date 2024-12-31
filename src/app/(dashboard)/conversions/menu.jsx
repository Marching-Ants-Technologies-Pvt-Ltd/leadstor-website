'use client';

import SearchBox from '@/components/elements/SearchBox';

function getLastFourMonths() {

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();
    const months = [];

    for (let i = 0; i < 4; i++) {
        const monthIndex = (currentDate.getMonth() - i + 12) % 12;
        months.unshift(monthNames[monthIndex]);
    }

    return months;
}

export default function ConversionMenu() {
    return (
        <div className="flex p-2">
            <div className="grow">
                <SearchBox />
            </div>
            <div className="grow flex justify-end align-middle poppins gap-1 text-gray-600">

                <div className='flex py-1 border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                    <i className="ri-user-add-line text-xl"></i>
                    <div className='mr-1'>Conversion</div>
                </div>

                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                    <i className="ri-file-excel-2-fill text-xl"></i>
                    <div className='mr-1'>Report</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                        <div className='text-sm mb-1 font-medium py-1'>Collections</div>
                        {getLastFourMonths().map((item, i) => (
                            <a key={`collection-${i}`} className="dropdown-item pl-4 text-sm">{item}</a>
                        ))}
                        {/* <a className="dropdown-item pl-4 text-sm">2</a>
                        <a className="dropdown-item pl-4 text-sm">3</a>
                        <a className="dropdown-item pl-4 text-sm">4</a> */}
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 pl-4">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Custom</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <div className='text-sm mb-1 font-medium py-1'>Joinees</div>
                        {getLastFourMonths().map((item, j) => (
                            <a key={`joinees-${j}`} className="dropdown-item pl-4 text-sm">{item}</a>
                        ))}
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 pl-4">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Custom</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <div className='text-sm mb-1 font-medium py-1'>Pending Payments</div>
                        <a className="dropdown-item pl-4 text-sm">Balance</a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 pl-4">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Custom</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <a className="dropdown-item text-sm">Full Report</a>
                    </div>
                </div>

                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-5'>
                    <i className="ri-filter-2-line text-xl"></i>
                    <div className='mr-1'>Filter</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-52">
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-square-fill text-green-600 text-lg mt-1"></i>
                            <span className='text-sm'>Active</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-square-fill text-yellow-400 text-lg mt-1"></i>
                            <span className='text-sm'>Paused</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-square-fill text-rose-600  text-lg mt-1"></i>
                            <span className='text-sm'>Defaulter</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-bank-card-line text-lg mt-1"></i>
                            <span className='text-sm'>Pending Payment</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Advance</span>
                        </a>
                    </div>
                </div>

                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-0'>
                    <i className="ri-shapes-line text-xl"></i>
                    <div className='mr-1'>Actions</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-chat-1-line text-lg mt-1"></i>
                            <span className='text-sm'>Send SMS</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-mail-ai-line text-lg mt-1"></i>
                            <span className='text-sm'>Send Email</span>
                        </a>
                    </div>
                </div>

                <div className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10 ml-5'>
                    <i className="ri-refresh-line text-xl"></i>
                </div>
            </div>
        </div>
    );
}