import SearchBox from '@/components/elements/SearchBox';

export default function Leads() {

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md flex flex-col">
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
                            <a className="dropdown-item pl-4 text-sm">September</a>
                            <a className="dropdown-item pl-4 text-sm">October</a>
                            <a className="dropdown-item pl-4 text-sm">November</a>
                            <a className="dropdown-item pl-4 text-sm">December</a>
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 pl-4">
                                <i className="ri-equalizer-3-line text-lg mt-1"></i>
                                <span className='text-sm'>Custom</span>
                            </a>
                            <div className="dropdown-divider my-1" role="separator"></div>
                            <div className='text-sm mb-1 font-medium py-1'>Joinees</div>
                            <a className="dropdown-item pl-4 text-sm">September</a>
                            <a className="dropdown-item pl-4 text-sm">October</a>
                            <a className="dropdown-item pl-4 text-sm">November</a>
                            <a className="dropdown-item pl-4 text-sm">December</a>
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

            <div className='grow border-t border-b bg-gray-50'>

            </div>

            <div className="flex px-4 py-3 poppins text-gray-600 text-[14px] cursor-default">
                <div className='border-r pr-4 flex justify-center items-center'>
                    Viewing 1 to 50 of 10348
                </div>
                <div className='pl-4 flex justify-center items-center'>
                    <div className="dropdown-container justify-center">
                        <div className="dropdown">
                            <div>
                                Enquiries limit per page <span className='border px-3 mx-1 rounded-md py-0.5'>50</span>
                                <label className="ml-1 ri-settings-line text-base relative top-[1px] cursor-pointer" tabIndex="0"></label>
                            </div>
                            <div className="dropdown-menu dropdown-menu-top-left bg-white w-16 mb-2">
                                <a className="dropdown-item text-sm">50</a>
                                <a className="dropdown-item text-sm">100</a>
                                <a className="dropdown-item text-sm">200</a>
                                <a className="dropdown-item text-sm">500</a>
                                <a className="dropdown-item text-sm">1000</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grow'></div>
                <div className='flex font-medium cursor-pointer'>
                    <div className='w-8 h-8 border flex justify-center items-center rounded-s-md'>
                        <i className="ri-arrow-left-s-line text-xl"></i>
                    </div>

                    <div className='w-10 h-8 bg-blue-500 border-blue-500 text-white border border-l-0 flex justify-center items-center'>1</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>2</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>3</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>4</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>5</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>...</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>253</div>

                    <div className='w-8 h-8 border border-l-0 flex justify-center items-center rounded-e-md'>
                        <i className="ri-arrow-right-s-line text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}