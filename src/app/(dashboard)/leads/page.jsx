import SearchBox from '@/components/elements/SearchBox';
import LeadsTable from './table';
import LeadsMenu from './menu';

export default function Leads() {

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md flex flex-col">
            <div className="flex p-2">
                <div className="grow">
                    <SearchBox />
                </div>
                <LeadsMenu />
            </div>

            <LeadsTable />

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
                        <i class="ri-arrow-left-s-line text-xl"></i>
                    </div>

                    <div className='w-10 h-8 bg-blue-500 border-blue-500 text-white border border-l-0 flex justify-center items-center'>1</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>2</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>3</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>4</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>5</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>...</div>
                    <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>253</div>

                    <div className='w-8 h-8 border border-l-0 flex justify-center items-center rounded-e-md'>
                        <i class="ri-arrow-right-s-line text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}